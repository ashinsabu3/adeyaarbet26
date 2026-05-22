import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { FRIENDS, MATCHES, ME_ID, getTeam } from '@/lib/data';
import { CURRENCY_SYMBOL } from '@/lib/currency';

function generateMockActivity() {
  const friends = FRIENDS.filter(f => f.id !== ME_ID);
  const picks = ['home', 'away', 'draw'];
  const amounts = [200, 300, 500, 750, 1000];
  const activity = [];

  for (let i = 0; i < 8; i++) {
    const friend = friends[i % friends.length];
    const match = MATCHES[i % MATCHES.length];
    const pick = picks[i % 3];
    const team = pick === 'home' ? getTeam(match.home) :
                 pick === 'away' ? getTeam(match.away) : null;
    const amount = amounts[i % amounts.length];

    activity.push({
      id: `activity-${i}`,
      userId: friend.id,
      username: friend.name,
      type: 'bet_placed',
      text: `bet ${CURRENCY_SYMBOL}${amount} on ${team ? team.name : 'Draw'}`,
      createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    });
  }

  return activity;
}

export async function GET(request) {
  const supabase = await createSupabaseServer();
  if (!supabase) {
    const activity = generateMockActivity();
    return NextResponse.json(activity);
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data, error } = await supabase
    .from('activity')
    .select('*, profiles(username, display_name, avatar_url)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, payload } = body;

  const validTypes = ['bet_placed', 'bet_won', 'bet_lost', 'joined'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('activity')
    .insert({ user_id: user.id, type, payload: payload || {} })
    .select('*, profiles(username, display_name, avatar_url)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
