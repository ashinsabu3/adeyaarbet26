import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { FRIENDS } from '@/lib/data';
import { STARTING_BALANCE } from '@/lib/currency';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const id = searchParams.get('id');

  if (!username && !id) {
    return NextResponse.json({ error: 'username or id is required' }, { status: 400 });
  }

  if (!supabase) {
    const friend = FRIENDS.find(f => f.id === (username || id));
    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: friend.id,
      username: friend.id,
      display_name: friend.name,
      balance: STARTING_BALANCE,
    });
  }

  let query = supabase.from('profiles').select('id, username, display_name, balance');
  if (id) {
    query = query.eq('id', id);
  } else {
    query = query.eq('username', username);
  }
  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
