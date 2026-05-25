-- Remove the starting balance concept.
-- Net position = SUM(payout WHERE won) - SUM(amount WHERE not cancelled)
-- Positive = winning (others owe you), negative = losing (you owe others).
-- No wallet, no starting coins — pure ledger.

-- Update compute_balance: starts from 0, not 5000
CREATE OR REPLACE FUNCTION public.compute_balance(p_user_id uuid)
RETURNS integer AS $$
  SELECT 0
    - COALESCE(SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN status = 'won' THEN payout ELSE 0 END), 0)
  FROM public.bets
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Update place_bet: remove the balance sufficiency check (no wallet cap)
CREATE OR REPLACE FUNCTION public.place_bet(
  p_user_id uuid,
  p_match_id text,
  p_pick text,
  p_amount integer
) RETURNS json AS $$
DECLARE
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
