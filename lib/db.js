import supabase from './supabase';
import { ensureMigrated } from './migrate';

// Auto-migrating supabase accessor.
// First call per cold start triggers migration check (idempotent, non-blocking for reads).
// Returns the raw supabase client after ensuring schema is up to date.
export async function getDb() {
  if (!supabase) return null;
  await ensureMigrated();
  return supabase;
}

export default supabase;
