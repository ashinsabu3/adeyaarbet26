import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const FRIENDS = [
  { id: '00000000-0000-0000-0000-000000000001', username: 'ashin', display_name: 'Ashin' },
  { id: '00000000-0000-0000-0000-000000000002', username: 'pratyush', display_name: 'Pratyush' },
  { id: '00000000-0000-0000-0000-000000000003', username: 'manan', display_name: 'Manan' },
  { id: '00000000-0000-0000-0000-000000000004', username: 'boidushya', display_name: 'Boidushya' },
  { id: '00000000-0000-0000-0000-000000000005', username: 'jayesh', display_name: 'Jayesh' },
  { id: '00000000-0000-0000-0000-000000000006', username: 'rahul', display_name: 'Rahul' },
  { id: '00000000-0000-0000-0000-000000000007', username: 'rohan', display_name: 'Rohan' },
  { id: '00000000-0000-0000-0000-000000000008', username: 'aryan', display_name: 'Aryan' },
];

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      users: FRIENDS.map(f => ({ ...f, balance: 5000 })),
      note: 'Supabase not configured. Showing static friends list.',
    });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, balance');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    users: data,
    note: 'Users are seeded via migration. This endpoint lists current profiles.',
  });
}
