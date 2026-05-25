-- AdeYaar 26 — Production Bootstrap
-- Run this ONCE in Supabase SQL Editor to set up the entire schema.
-- After this, future migrations auto-apply via exec_sql on deploy/restart.

-- Enable auto-migration support (restricted to service_role only)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$ BEGIN EXECUTE sql; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM authenticated;

-- Migration tracking table
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Migration 1: initial_schema
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  balance integer NOT NULL DEFAULT 5000,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.activity (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity(user_id);
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.bets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id text NOT NULL,
  pick text NOT NULL CHECK (pick IN ('home', 'away', 'draw')),
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  payout integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON public.bets(match_id);
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- Migration 2: anon_policies
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can view profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Anon can view profiles" ON public.profiles FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can view bets' AND tablename = 'bets') THEN
    CREATE POLICY "Anon can view bets" ON public.bets FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can view activity' AND tablename = 'activity') THEN
    CREATE POLICY "Anon can view activity" ON public.activity FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can insert bets' AND tablename = 'bets') THEN
    CREATE POLICY "Anon can insert bets" ON public.bets FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can insert activity' AND tablename = 'activity') THEN
    CREATE POLICY "Anon can insert activity" ON public.activity FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can insert profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Anon can insert profiles" ON public.profiles FOR INSERT TO anon WITH CHECK (true);
  END IF;
  -- No anon UPDATE on profiles — mutations via SECURITY DEFINER functions only
  -- NOTE: No anon UPDATE on bets — all mutations go through SECURITY DEFINER functions
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Migration 3: ledger_model
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.activity DROP CONSTRAINT IF EXISTS activity_type_check;
ALTER TABLE public.activity ADD CONSTRAINT activity_type_check
  CHECK (type IN ('bet_placed', 'bet_won', 'bet_lost', 'bet_cancelled', 'joined'));

ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS payout integer;
ALTER TABLE public.bets DROP COLUMN IF EXISTS odds;
ALTER TABLE public.profiles ALTER COLUMN balance SET DEFAULT 5000;

CREATE OR REPLACE FUNCTION public.compute_balance(p_user_id uuid)
RETURNS integer AS $$
  SELECT 5000
    - COALESCE(SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN status = 'won' THEN payout ELSE 0 END), 0)
  FROM public.bets
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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

  -- Lock the user's profile row to serialize ALL bets by this user (prevents concurrent double-spend)
  PERFORM 1 FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;

  SELECT pick INTO v_existing_pick FROM public.bets
    WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending' FOR UPDATE;

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

CREATE OR REPLACE FUNCTION public.cancel_bets(
  p_user_id uuid, p_match_id text
) RETURNS json AS $$
DECLARE
  v_cancelled integer;
  v_refunded integer;
BEGIN
  -- Lock profile row to serialize with place_bet (prevents race)
  PERFORM 1 FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  WITH cancelled AS (
    UPDATE public.bets SET status = 'cancelled'
      WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending'
      RETURNING amount
  )
  SELECT COUNT(*)::integer, COALESCE(SUM(amount), 0)::integer INTO v_cancelled, v_refunded FROM cancelled;

  IF v_cancelled = 0 THEN RAISE EXCEPTION 'No pending bets to cancel'; END IF;

  INSERT INTO public.activity (user_id, type, payload)
    VALUES (p_user_id, 'bet_cancelled', jsonb_build_object(
      'match_id', p_match_id, 'refunded', v_refunded, 'count', v_cancelled));

  RETURN json_build_object('cancelled', v_cancelled, 'refunded', v_refunded, 'balance', public.compute_balance(p_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.resolve_match(p_match_id text, p_winner text)
RETURNS json AS $$
DECLARE
  v_total_pool integer;
  v_winning_pool integer;
  v_bet record;
  v_payout integer;
  v_payouts_made integer := 0;
BEGIN
  IF p_winner NOT IN ('home', 'away', 'draw') THEN RAISE EXCEPTION 'Invalid winner'; END IF;

  PERFORM 1 FROM public.bets WHERE match_id = p_match_id AND status = 'pending' FOR UPDATE;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_pool
    FROM public.bets WHERE match_id = p_match_id AND status = 'pending';
  IF v_total_pool = 0 THEN RAISE EXCEPTION 'No pending bets on this match (already resolved?)'; END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_winning_pool
    FROM public.bets WHERE match_id = p_match_id AND status = 'pending' AND pick = p_winner;

  IF v_winning_pool = 0 THEN
    UPDATE public.bets SET status = 'cancelled' WHERE match_id = p_match_id AND status = 'pending';
    RETURN json_build_object('refunded', true, 'pool', v_total_pool);
  END IF;

  -- Log losses
  INSERT INTO public.activity (user_id, type, payload)
    SELECT user_id, 'bet_lost', jsonb_build_object('match_id', p_match_id, 'amount', amount, 'bet_id', id)
    FROM public.bets
    WHERE match_id = p_match_id AND status = 'pending' AND pick != p_winner;

  UPDATE public.bets SET status = 'lost'
    WHERE match_id = p_match_id AND status = 'pending' AND pick != p_winner;

  FOR v_bet IN SELECT id, user_id, amount FROM public.bets
    WHERE match_id = p_match_id AND status = 'pending' AND pick = p_winner
  LOOP
    v_payout := FLOOR(v_bet.amount::numeric / v_winning_pool * v_total_pool)::integer;
    UPDATE public.bets SET status = 'won', payout = v_payout WHERE id = v_bet.id;
    v_payouts_made := v_payouts_made + 1;
    INSERT INTO public.activity (user_id, type, payload)
      VALUES (v_bet.user_id, 'bet_won', jsonb_build_object(
        'match_id', p_match_id, 'payout', v_payout, 'bet_id', v_bet.id));
  END LOOP;

  RETURN json_build_object('pool', v_total_pool, 'winning_pool', v_winning_pool,
    'payouts_made', v_payouts_made, 'winner', p_winner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- Migration 4: settlements
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.settlements (
  id bigserial PRIMARY KEY,
  from_user uuid NOT NULL REFERENCES public.profiles(id),
  to_user uuid NOT NULL REFERENCES public.profiles(id),
  amount integer NOT NULL CHECK (amount > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_settle CHECK (from_user != to_user)
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_settlements_select' AND tablename = 'settlements') THEN
    CREATE POLICY "anon_settlements_select" ON public.settlements FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_settlements_insert' AND tablename = 'settlements') THEN
    CREATE POLICY "anon_settlements_insert" ON public.settlements FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Record all migrations as applied
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.schema_migrations (version, name) VALUES
  (1, 'initial_schema'),
  (2, 'anon_policies'),
  (3, 'ledger_model'),
  (4, 'settlements')
ON CONFLICT (version) DO NOTHING;
