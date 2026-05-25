import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || !code) {
    return NextResponse.redirect(new URL(next, origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth', origin));
  }

  const authUser = data?.user;
  if (authUser) {
    const meta = authUser.user_metadata || {};
    const username = meta.preferred_username || meta.user_name || authUser.email?.split('@')[0] || authUser.id;
    const display_name = meta.full_name || meta.name || username;
    await supabase.from('profiles').upsert(
      { id: authUser.id, username, display_name },
      { onConflict: 'id', ignoreDuplicates: true }
    );
  }

  return NextResponse.redirect(new URL(next, origin));
}
