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

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, balance')
    .order('balance', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
