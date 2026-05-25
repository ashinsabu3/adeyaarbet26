import supabase from './supabase';

// Each migration: { version, name, sql }
// SQL MUST be idempotent — safe to run on a DB that's already partially applied.
const MIGRATIONS = [
  {
    version: 1,
    name: 'initial_schema',
    sql: `
-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  balance integer NOT NULL DEFAULT 5000,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Activity
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

-- Bets
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
`,
  },
  {
    version: 2,
    name: 'anon_policies',
    sql: `
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can update profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Anon can update profiles" ON public.profiles FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon can update bets' AND tablename = 'bets') THEN
    CREATE POLICY "Anon can update bets" ON public.bets FOR UPDATE TO anon USING (true);
  END IF;
END $$;
`,
  },
  {
    version: 3,
    name: 'ledger_model',
    sql: `
-- Activity type constraint (idempotent: drop then re-add)
ALTER TABLE public.activity DROP CONSTRAINT IF EXISTS activity_type_check;
ALTER TABLE public.activity ADD CONSTRAINT activity_type_check
  CHECK (type IN ('bet_placed', 'bet_won', 'bet_lost', 'bet_cancelled', 'joined'));

-- Payout column
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS payout integer;

-- Drop odds column if it exists (legacy)
ALTER TABLE public.bets DROP COLUMN IF EXISTS odds;

-- Balance default
ALTER TABLE public.profiles ALTER COLUMN balance SET DEFAULT 5000;

-- compute_balance: derive from bet ledger
CREATE OR REPLACE FUNCTION public.compute_balance(p_user_id uuid)
RETURNS integer AS $$
  SELECT 5000
    - COALESCE(SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN status = 'won' THEN payout ELSE 0 END), 0)
  FROM public.bets
  WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- place_bet: atomic bet placement with side-switch auto-cancel
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
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN RAISE EXCEPTION 'User not found'; END IF;

  SELECT pick INTO v_existing_pick FROM public.bets
    WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending' FOR UPDATE;

  IF v_existing_pick IS NOT NULL AND v_existing_pick != p_pick THEN
    UPDATE public.bets SET status = 'cancelled'
      WHERE user_id = p_user_id AND match_id = p_match_id AND status = 'pending';
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

-- cancel_bets: atomic cancel
CREATE OR REPLACE FUNCTION public.cancel_bets(
  p_user_id uuid, p_match_id text
) RETURNS json AS $$
DECLARE
  v_cancelled integer;
  v_refunded integer;
BEGIN
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

-- resolve_match: parimutuel payout distribution
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
`,
  },
  {
    version: 4,
    name: 'settlements',
    sql: `
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
`,
  },
];

// Module-level singleton: runs once per cold start, all callers await the same promise
let migrationPromise = null;
let migrationResult = null;

async function runMigrations() {
  if (!supabase) return { status: 'skipped', reason: 'no_database' };

  try {
    // Try to use exec_sql. If it doesn't exist, try to bootstrap it via the REST SQL endpoint.
    const { error: bootstrapErr } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.schema_migrations (
          version integer PRIMARY KEY,
          name text NOT NULL,
          applied_at timestamptz NOT NULL DEFAULT now()
        );
      `,
    });

    if (bootstrapErr && bootstrapErr.message?.includes('does not exist')) {
      // exec_sql doesn't exist — provide the bootstrap SQL for manual execution
      const bootstrapSQL = `
-- Run this ONCE in Supabase SQL Editor to enable auto-migration:
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN EXECUTE sql; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

${getFullSQL()}
`;
      return {
        status: 'needs_manual',
        reason: 'exec_sql function missing',
        hint: 'Run the SQL below in Supabase SQL Editor (one-time setup)',
        sql: bootstrapSQL,
      };
    }
    if (bootstrapErr) {
      return { status: 'error', reason: bootstrapErr.message };
    }

    // Check which versions are already applied
    const { data: applied } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version');

    const appliedSet = new Set((applied || []).map((r) => r.version));
    const pending = MIGRATIONS.filter((m) => !appliedSet.has(m.version));

    if (pending.length === 0) {
      return { status: 'ok', applied: MIGRATIONS.length, pending: 0 };
    }

    // Apply each pending migration in order
    const results = [];
    for (const migration of pending) {
      const { error } = await supabase.rpc('exec_sql', { sql: migration.sql });
      if (error) {
        results.push({ version: migration.version, name: migration.name, error: error.message });
        // Don't stop — later migrations might still be applicable
        continue;
      }

      // Record successful application
      await supabase.from('schema_migrations').upsert({
        version: migration.version,
        name: migration.name,
      });
      results.push({ version: migration.version, name: migration.name, ok: true });
    }

    const failed = results.filter((r) => r.error);
    return {
      status: failed.length === 0 ? 'ok' : 'partial',
      applied: results.filter((r) => r.ok).length,
      failed,
      total: MIGRATIONS.length,
    };
  } catch (err) {
    return { status: 'error', reason: err.message };
  }
}

// Public: ensures migrations run exactly once per process lifetime
export function ensureMigrated() {
  if (migrationResult) return Promise.resolve(migrationResult);
  if (!migrationPromise) {
    migrationPromise = runMigrations().then((result) => {
      migrationResult = result;
      return result;
    });
  }
  return migrationPromise;
}

// Public: force re-run (for /api/setup manual trigger)
export async function forceMigrate() {
  migrationPromise = null;
  migrationResult = null;
  return runMigrations().then((result) => {
    migrationResult = result;
    migrationPromise = Promise.resolve(result);
    return result;
  });
}

// Public: get current status without triggering
export function getMigrationStatus() {
  return migrationResult;
}

// Public: full SQL for manual execution
export function getFullSQL() {
  return MIGRATIONS.map(
    (m) => `-- Migration ${m.version}: ${m.name}\n${m.sql}`
  ).join('\n\n');
}

export { MIGRATIONS };
