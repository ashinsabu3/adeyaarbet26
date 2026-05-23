-- Ledger model: balance is DERIVED from bets, never stored independently.
-- Formula: balance = STARTING_BALANCE - SUM(amount for active bets) + SUM(payout for won bets)
-- "active" = status IN ('pending', 'won', 'lost')  (i.e. NOT cancelled)
-- This makes corruption impossible — there's no mutable balance to desync.

-- Helper: compute a user's balance from their bet history
CREATE OR REPLACE FUNCTION public.compute_balance(p_user_id uuid)
RETURNS integer AS $$
  SELECT 5000
    - COALESCE(SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN status = 'won' THEN payout ELSE 0 END), 0)
  FROM public.bets
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Place a bet (atomic, enforces one-side-per-match, auto-cancels if switching sides)
CREATE OR REPLACE FUNCTION public.place_bet(
  p_user_id uuid,
  p_match_id text,
  p_pick text,
  p_amount integer
) RETURNS json AS $$
DECLARE
  v_balance integer;
  v_existing_pick text;
  v_bet_id bigint;
BEGIN
  IF p_pick NOT IN ('home', 'away', 'draw') THEN
    RAISE EXCEPTION 'Invalid pick';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Lock existing pending bets on this match to prevent races
  SELECT pick INTO v_existing_pick
    FROM public.bets
    WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending'
    FOR UPDATE;

  -- If switching sides, cancel all existing bets on this match
  IF v_existing_pick IS NOT NULL AND v_existing_pick != p_pick THEN
    UPDATE public.bets
      SET status = 'cancelled'
      WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending';
  END IF;

  -- Compute balance AFTER any cancellations (cancelled bets free up money)
  v_balance := public.compute_balance(p_user_id);

  IF p_amount > v_balance THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  INSERT INTO public.bets (user_id, match_id, pick, amount)
    VALUES (p_user_id, p_match_id, p_pick, p_amount)
    RETURNING id INTO v_bet_id;

  INSERT INTO public.activity (user_id, type, payload)
    VALUES (p_user_id, 'bet_placed', jsonb_build_object(
      'match_id', p_match_id, 'pick', p_pick, 'amount', p_amount, 'bet_id', v_bet_id
    ));

  RETURN json_build_object(
    'id', v_bet_id,
    'balance', public.compute_balance(p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel all pending bets for a user on a match
CREATE OR REPLACE FUNCTION public.cancel_bets(
  p_user_id uuid,
  p_match_id text
) RETURNS json AS $$
DECLARE
  v_cancelled integer;
  v_refunded integer;
BEGIN
  -- Lock and cancel in one shot
  WITH cancelled AS (
    UPDATE public.bets
      SET status = 'cancelled'
      WHERE user_id = p_user_id
        AND match_id = p_match_id
        AND status = 'pending'
      RETURNING amount
  )
  SELECT COUNT(*)::integer, COALESCE(SUM(amount), 0)::integer
    INTO v_cancelled, v_refunded
    FROM cancelled;

  IF v_cancelled = 0 THEN
    RAISE EXCEPTION 'No pending bets to cancel';
  END IF;

  RETURN json_build_object(
    'cancelled', v_cancelled,
    'refunded', v_refunded,
    'balance', public.compute_balance(p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resolve a match: distribute parimutuel payouts
CREATE OR REPLACE FUNCTION public.resolve_match(p_match_id text, p_winner text)
RETURNS json AS $$
DECLARE
  v_total_pool integer;
  v_winning_pool integer;
  v_bet record;
  v_payout integer;
  v_payouts_made integer := 0;
BEGIN
  IF p_winner NOT IN ('home', 'away', 'draw') THEN
    RAISE EXCEPTION 'Invalid winner';
  END IF;

  -- Lock all pending bets on this match to prevent concurrent resolution
  PERFORM 1 FROM public.bets
    WHERE match_id = p_match_id AND status = 'pending'
    FOR UPDATE;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_pool
    FROM public.bets WHERE match_id = p_match_id AND status = 'pending';

  IF v_total_pool = 0 THEN
    RAISE EXCEPTION 'No pending bets on this match (already resolved?)';
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_winning_pool
    FROM public.bets WHERE match_id = p_match_id AND status = 'pending' AND pick = p_winner;

  -- No winners: refund everyone (mark cancelled)
  IF v_winning_pool = 0 THEN
    UPDATE public.bets SET status = 'cancelled'
      WHERE match_id = p_match_id AND status = 'pending';
    RETURN json_build_object('refunded', true, 'pool', v_total_pool);
  END IF;

  -- Mark losers
  UPDATE public.bets SET status = 'lost'
    WHERE match_id = p_match_id AND status = 'pending' AND pick != p_winner;

  -- Pay winners proportionally
  FOR v_bet IN
    SELECT id, user_id, amount FROM public.bets
      WHERE match_id = p_match_id AND status = 'pending' AND pick = p_winner
  LOOP
    v_payout := (v_bet.amount::numeric / v_winning_pool * v_total_pool)::integer;
    UPDATE public.bets SET status = 'won', payout = v_payout WHERE id = v_bet.id;
    v_payouts_made := v_payouts_made + 1;

    INSERT INTO public.activity (user_id, type, payload)
      VALUES (v_bet.user_id, 'bet_won', jsonb_build_object(
        'match_id', p_match_id, 'payout', v_payout, 'bet_id', v_bet.id
      ));
  END LOOP;

  RETURN json_build_object(
    'pool', v_total_pool,
    'winning_pool', v_winning_pool,
    'payouts_made', v_payouts_made,
    'winner', p_winner
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the balance column from profiles (balance is now computed)
-- NOTE: Do this AFTER applying the functions above.
-- If you have existing data, the balance column is now ignored.
ALTER TABLE public.profiles ALTER COLUMN balance SET DEFAULT 5000;
