import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { userId, matchId } = await request.json();

    if (!userId || !matchId) {
      return NextResponse.json({ error: 'Missing userId or matchId' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('cancel_bets', {
      p_user_id: userId,
      p_match_id: matchId,
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('No pending bets')) {
        return NextResponse.json({ error: 'No pending bets to cancel' }, { status: 400 });
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
