'use client';

import { useState, useEffect, useRef } from 'react';
import supabaseBrowser from '@/lib/supabase-browser';
import { STARTING_BALANCE } from '@/lib/currency';

const FALLBACK_USER = Object.freeze({
  id: 'rahul',
  username: 'rahul',
  display_name: 'Rahul',
  balance: STARTING_BALANCE,
});

/**
 * Returns the current authenticated user or null.
 * When Supabase is unconfigured and no local session exists, returns null.
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    async function resolve() {
      // Check localStorage for a local session (set after login)
      const localSession = localStorage.getItem('adeyaar_user');
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          if (mounted.current) {
            setUser(parsed);
            setLoading(false);
          }
          return;
        } catch {}
      }

      if (!supabaseBrowser) {
        if (mounted.current) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session?.user) {
          if (mounted.current) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const meta = session.user.user_metadata || {};
        const resolved = {
          id: session.user.id,
          username: meta.username || meta.preferred_username || session.user.email?.split('@')[0] || 'user',
          display_name: meta.full_name || meta.name || 'Player',
          balance: STARTING_BALANCE,
          email: session.user.email,
          avatar_url: meta.avatar_url,
        };
        localStorage.setItem('adeyaar_user', JSON.stringify(resolved));
        if (mounted.current) {
          setUser(resolved);
          setLoading(false);
        }
      } catch {
        if (mounted.current) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    resolve();

    let subscription;
    if (supabaseBrowser) {
      const { data } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          localStorage.removeItem('adeyaar_user');
          setUser(null);
        } else {
          const meta = session.user.user_metadata || {};
          const resolved = {
            id: session.user.id,
            username: meta.username || meta.preferred_username || session.user.email?.split('@')[0] || 'user',
            display_name: meta.full_name || meta.name || 'Player',
            balance: STARTING_BALANCE,
            email: session.user.email,
            avatar_url: meta.avatar_url,
          };
          localStorage.setItem('adeyaar_user', JSON.stringify(resolved));
          setUser(resolved);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function logout() {
  localStorage.removeItem('adeyaar_user');
  if (supabaseBrowser) {
    supabaseBrowser.auth.signOut();
  }
  window.location.reload();
}
