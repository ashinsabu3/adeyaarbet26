-- Prevent betting on resolved matches + prevent duplicate same-side bets
CREATE OR REPLACE FUNCTION public.place_bet(
  p_user_id uuid, p_match_id text, p_pick text, p_amount integer
) RETURNS json AS $$
DECLARE
  v_balance integer;
  v_existing_pick text;
  v_bet_id bigint;
BEGIN
  IF p_pick NOT IN ('home', 'away', 'draw') THEN RAISE EXCEPTION 'Invalid pick'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

  PERFORM 1 FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;

  IF EXISTS (SELECT 1 FROM public.bets WHERE match_id = p_match_id AND status IN ('won', 'lost') LIMIT 1) THEN
    RAISE EXCEPTION 'Match already resolved';
  END IF;

  SELECT pick INTO v_existing_pick FROM public.bets
    WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending' FOR UPDATE;

  IF v_existing_pick IS NOT NULL AND v_existing_pick = p_pick THEN
    RAISE EXCEPTION 'Already bet on this side';
  END IF;

  IF v_existing_pick IS NOT NULL AND v_existing_pick != p_pick THEN
    UPDATE public.bets SET status = 'cancelled'
      WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending';
    INSERT INTO public.activity (user_id, type, payload)
      VALUES (p_user_id, 'bet_cancelled', jsonb_build_object(
        'match_id', p_match_id, 'reason', 'side_switch', 'new_pick', p_pick));
  END IF;

  v_balance := public.compute_balance(p_user_id);
  IF p_amount > v_balance THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  INSERT INTO public.bets (user_id, match_id, pick, amount)
    VALUES (p_user_id, p_match_id, p_pick, p_amount) RETURNING id INTO v_bet_id;

  INSERT INTO public.activity (user_id, type, payload)
    VALUES (p_user_id, 'bet_placed', jsonb_build_object(
      'match_id', p_match_id, 'pick', p_pick, 'amount', p_amount, 'bet_id', v_bet_id));

  RETURN json_build_object('id', v_bet_id, 'balance', public.compute_balance(p_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
