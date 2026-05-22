import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('match_id');

  if (!matchId) {
    return NextResponse.json({ error: 'match_id is required' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ matchId, total: 0, bettorCount: 0, bySide: { home: 0, away: 0, draw: 0 } });
  }

  const { data: bets, error } = await supabase
    .from('bets')
    .select('user_id, pick, amount')
    .eq('match_id', matchId)
    .eq('status', 'pending');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = bets.reduce((s, b) => s + b.amount, 0);
  const bettorCount = new Set(bets.map(b => b.user_id)).size;
  const bySide = { home: 0, away: 0, draw: 0 };
  bets.forEach(b => { bySide[b.pick] = (bySide[b.pick] || 0) + b.amount; });

  return NextResponse.json({ matchId, total, bettorCount, bySide });
}
