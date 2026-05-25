import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { FRIENDS } from '@/lib/data';
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const id = searchParams.get('id');

  if (!username && !id) {
    return NextResponse.json({ error: 'username or id is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServer();


  if (!supabase) {
    const friend = FRIENDS.find(f => f.id === (username || id));
    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: friend.id,
      username: friend.id,
      display_name: friend.name,
      balance: 0,
    });
  }

  let query = supabase.from('profiles').select('id, username, display_name, balance');
  if (id) {
    query = query.eq('id', id);
  } else {
    query = query.eq('username', username);
  }
  const { data: profile, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute balance from bets (ledger model)
  const { data: bets } = await supabase
    .from('bets')
    .select('amount, status, payout')
    .eq('user_id', profile.id);

  let balance = 0;
  if (bets) {
    for (const b of bets) {
      if (b.status !== 'cancelled') balance -= b.amount;
      if (b.status === 'won') balance += (b.payout || 0);
    }
  }

  return NextResponse.json({ ...profile, balance });
}
