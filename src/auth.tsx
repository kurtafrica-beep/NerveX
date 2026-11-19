import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';

type AuthApi = {
  session: Session | null;
  ready: boolean;
  signInWithGoogle: () => Promise<string>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthApi | null>(null);

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

// Opens Google in the system browser and comes back through nerve://auth.
// Resolves '' on success, or a message to show the person.
async function signInWithGoogle(): Promise<string> {
  const redirectTo = Linking.createURL('auth');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
  });
  if (error || !data?.url) return 'Google sign-in is not set up yet. Try again in a moment.';

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return '';

  const params = Linking.parse(result.url).queryParams ?? {};
  const problem = first(params.error_description) || first(params.error);
  if (problem) return `Google sign-in failed: ${problem.replace(/\+/g, ' ')}`;
  const code = first(params.code);
  if (!code) return 'Google sign-in did not finish. Try again.';

  const exchanged = await supabase.auth.exchangeCodeForSession(code);
  return exchanged.error ? 'Sign-in did not finish. Try again.' : '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const api = useMemo<AuthApi>(
    () => ({
      session,
      ready,
      signInWithGoogle,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, ready],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('useAuth must be used inside AuthProvider');
  return api;
}
