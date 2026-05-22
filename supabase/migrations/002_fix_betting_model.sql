-- Fix betting model: parimutuel (no fixed odds), correct starting balance

-- Change default balance to 5000
ALTER TABLE public.profiles ALTER COLUMN balance SET DEFAULT 5000;

-- Remove odds column (parimutuel doesn't use fixed odds)
ALTER TABLE public.bets DROP COLUMN IF EXISTS odds;

-- Add payout column (filled when match resolves)
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS payout integer;

-- Allow anon access for local dev (users can read without auth)
CREATE POLICY "Anon can view profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view bets" ON public.bets FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view activity" ON public.activity FOR SELECT TO anon USING (true);

-- Allow anon to insert/update (for local dev without full auth flow)
CREATE POLICY "Anon can insert bets" ON public.bets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert activity" ON public.activity FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can insert profiles" ON public.profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update profiles" ON public.profiles FOR UPDATE TO anon USING (true);

-- Function to place a bet atomically (checks balance, deducts, inserts bet, logs activity)
CREATE OR REPLACE FUNCTION public.place_bet(
  p_user_id uuid,
  p_match_id text,
  p_pick text,
  p_amount integer
) RETURNS json AS $$
DECLARE
  v_balance integer;
  v_bet_id bigint;
BEGIN
  IF p_pick NOT IN ('home', 'away', 'draw') THEN
    RAISE EXCEPTION 'Invalid pick';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance INTO v_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  IF p_amount > v_balance THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.profiles SET balance = balance - p_amount WHERE id = p_user_id;

  INSERT INTO public.bets (user_id, match_id, pick, amount)
    VALUES (p_user_id, p_match_id, p_pick, p_amount)
    RETURNING id INTO v_bet_id;

  INSERT INTO public.activity (user_id, type, payload)
    VALUES (p_user_id, 'bet_placed', jsonb_build_object(
      'match_id', p_match_id,
      'pick', p_pick,
      'amount', p_amount,
      'bet_id', v_bet_id
    ));

  RETURN json_build_object('id', v_bet_id, 'balance', v_balance - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve a match and distribute parimutuel payouts
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
    RAISE EXCEPTION 'Invalid winner: must be home, away, or draw';
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_pool
    FROM public.bets WHERE match_id = p_match_id AND status = 'pending';
  SELECT COALESCE(SUM(amount), 0) INTO v_winning_pool
    FROM public.bets WHERE match_id = p_match_id AND status = 'pending' AND pick = p_winner;

  IF v_total_pool = 0 THEN
    RAISE EXCEPTION 'No pending bets on this match';
  END IF;

  -- If no one picked the winner, refund all
  IF v_winning_pool = 0 THEN
    FOR v_bet IN SELECT id, user_id, amount FROM public.bets
      WHERE match_id = p_match_id AND status = 'pending'
    LOOP
      UPDATE public.bets SET status = 'cancelled', payout = v_bet.amount WHERE id = v_bet.id;
      UPDATE public.profiles SET balance = balance + v_bet.amount WHERE id = v_bet.user_id;
    END LOOP;
    RETURN json_build_object('refunded', true, 'pool', v_total_pool);
  END IF;

  -- Mark losers
  UPDATE public.bets SET status = 'lost'
    WHERE match_id = p_match_id AND status = 'pending' AND pick != p_winner;

  -- Pay winners: payout = (stake / winning_pool) * total_pool
  FOR v_bet IN SELECT id, user_id, amount FROM public.bets
    WHERE match_id = p_match_id AND status = 'pending' AND pick = p_winner
  LOOP
    v_payout := (v_bet.amount::numeric / v_winning_pool * v_total_pool)::integer;
    UPDATE public.bets SET status = 'won', payout = v_payout WHERE id = v_bet.id;
    UPDATE public.profiles SET balance = balance + v_payout WHERE id = v_bet.user_id;
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
