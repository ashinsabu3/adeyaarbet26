import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('match_id');

  if (!matchId) {
    return NextResponse.json({ error: 'match_id is required' }, { status: 400 });
  }

  const supabase = await getDb();
  if (!supabase) {
    return NextResponse.json({ matchId, total: 0, bettorCount: 0, bySide: { home: 0, away: 0, draw: 0 }, bets: [] });
  }

  const { data: bets, error } = await supabase
    .from('bets')
    .select('user_id, pick, amount, profiles(display_name)')
    .eq('match_id', matchId)
    .eq('status', 'pending');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = bets.reduce((s, b) => s + b.amount, 0);
  const bettorCount = new Set(bets.map(b => b.user_id)).size;
  const bySide = { home: 0, away: 0, draw: 0 };
  bets.forEach(b => { bySide[b.pick] = (bySide[b.pick] || 0) + b.amount; });

  // Compute possible winnings per bet (parimutuel: stake/side_pool * total_pool)
  const enriched = bets.map(b => {
    const sidePool = bySide[b.pick] || 1;
    const possibleWin = Math.floor((b.amount / sidePool) * total);
    return {
      user_id: b.user_id,
      display_name: b.profiles?.display_name || 'Unknown',
      pick: b.pick,
      amount: b.amount,
      possible_win: possibleWin,
    };
  });

  return NextResponse.json({ matchId, total, bettorCount, bySide, bets: enriched });
}
