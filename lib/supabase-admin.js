import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-only client with service_role privileges (for migrations, admin ops).
// Falls back to null if service key is not configured.
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

export default supabaseAdmin;
