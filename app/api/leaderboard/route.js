import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { FRIENDS } from '@/lib/data';
import { STARTING_BALANCE } from '@/lib/currency';
import { computeBalance } from '@/lib/ledger';

export async function GET() {
  if (!supabase) {
    const mock = FRIENDS.map(f => ({
      id: f.id,
      username: f.id,
      display_name: f.name,
      balance: STARTING_BALANCE,
    }));
    return NextResponse.json(mock);
  }

  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, username, display_name');

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const { data: bets, error: bErr } = await supabase
    .from('bets')
    .select('user_id, amount, status, payout');

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });

  // Group bets by user, compute balance via shared ledger formula
  const betsByUser = {};
  for (const b of bets) {
    (betsByUser[b.user_id] = betsByUser[b.user_id] || []).push(b);
  }

  const result = profiles.map(p => ({
    ...p,
    balance: computeBalance(betsByUser[p.id] || []),
  }));

  result.sort((a, b) => b.balance - a.balance);
  return NextResponse.json(result);
}
