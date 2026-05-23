import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { FRIENDS } from '@/lib/data';
import { STARTING_BALANCE } from '@/lib/currency';

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

  // Compute balance from bets (ledger model)
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, username, display_name');

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const { data: bets, error: bErr } = await supabase
    .from('bets')
    .select('user_id, amount, status, payout');

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });

  const balanceMap = {};
  for (const b of bets) {
    if (!balanceMap[b.user_id]) balanceMap[b.user_id] = { spent: 0, won: 0 };
    if (b.status !== 'cancelled') balanceMap[b.user_id].spent += b.amount;
    if (b.status === 'won') balanceMap[b.user_id].won += (b.payout || 0);
  }

  const result = profiles.map(p => ({
    ...p,
    balance: STARTING_BALANCE - (balanceMap[p.id]?.spent || 0) + (balanceMap[p.id]?.won || 0),
  }));

  result.sort((a, b) => b.balance - a.balance);
  return NextResponse.json(result);
}
