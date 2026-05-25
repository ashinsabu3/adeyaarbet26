import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { forceMigrate, getMigrationStatus, getFullSQL } from '@/lib/migrate';

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'adeyaar26-setup') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await forceMigrate();

  if (result.status === 'needs_manual') {
    return NextResponse.json({
      error: 'Auto-migration unavailable. Run this SQL in Supabase SQL Editor:',
      hint: result.hint,
      sql: result.sql,
    }, { status: 422 });
  }

  if (result.status === 'error') {
    return NextResponse.json({
      error: result.reason,
      sql: getFullSQL(),
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, ...result });
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ migrated: false, reason: 'No database' });
  }

  const cached = getMigrationStatus();
  if (cached) {
    return NextResponse.json({ migrated: cached.status === 'ok', ...cached });
  }

  // Check if core function exists as a quick probe
  const { error } = await supabase.rpc('compute_balance', {
    p_user_id: '00000000-0000-0000-0000-000000000000',
  });

  if (error && error.message?.includes('does not exist')) {
    return NextResponse.json({ migrated: false, reason: 'Functions not deployed' });
  }

  return NextResponse.json({ migrated: true });
}
