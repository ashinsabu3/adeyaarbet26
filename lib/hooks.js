'use client';

import { useState, useEffect, useRef } from 'react';
import supabaseBrowser from '@/lib/supabase-browser';

function getUserFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('adeyaar_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * Returns the current authenticated user.
 * - Supabase configured: uses session auth
 * - No Supabase: uses localStorage (local dev friend picker)
 * Returns { user: object|null, loading: boolean }
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    async function resolve() {
      // No Supabase configured — use localStorage (local dev mode)
      if (!supabaseBrowser) {
        const stored = getUserFromStorage();
        if (mounted.current) {
          setUser(stored);
          setLoading(false);
        }
        return;
      }

      // Supabase configured — use session
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
        if (mounted.current) {
          setUser({
            id: session.user.id,
            username: meta.username || meta.preferred_username || session.user.email?.split('@')[0] || 'user',
            display_name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Player',
            balance: 0,
            email: session.user.email,
            avatar_url: meta.avatar_url,
          });
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

    // Listen for auth changes
    let subscription;
    if (supabaseBrowser) {
      const { data } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          setUser(null);
        } else {
          const meta = session.user.user_metadata || {};
          setUser({
            id: session.user.id,
            username: meta.username || meta.preferred_username || session.user.email?.split('@')[0] || 'user',
            display_name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Player',
            balance: 0,
            email: session.user.email,
            avatar_url: meta.avatar_url,
          });
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
