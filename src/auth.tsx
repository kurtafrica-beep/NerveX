import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { captureInvite } from './invite';
import { supabase } from './supabase';

type AuthApi = {
  session: Session | null;
  ready: boolean;
  signInWithGoogle: () => Promise<string>;
  signInWithEmail: (email: string, password: string) => Promise<string>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<{ error: string; confirm: boolean }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthApi | null>(null);

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

// Opens Google in the system browser and comes back through nerve://auth.
// Resolves '' on success, or a message to show the person.
async function signInWithGoogle(): Promise<string> {
  if (Platform.OS === 'web') {
    // In a browser, go to Google in this tab and come back to the app's own page.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: webHome(), queryParams: { prompt: 'select_account' } },
    });
    return error ? 'Google sign-in is not set up yet. Try again in a moment.' : '';
  }
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
  if (!exchanged.error) return '';
  // The link handler below may have used the code first.
  const { data: now } = await supabase.auth.getSession();
  return now.session ? '' : 'Sign-in did not finish. Try again.';
}

function emailProblem(error: { code?: string; message?: string } | null): string {
  if (!error) return '';
  switch (error.code) {
    case 'invalid_credentials':
      return 'Wrong email or password.';
    case 'email_not_confirmed':
      return 'Confirm your email first. Open the link in the message we sent, then sign in.';
    case 'user_already_exists':
    case 'email_exists':
      return 'That email already has an account. Sign in instead.';
    case 'weak_password':
      return 'Pick a longer password: at least 8 characters.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'That email address does not look right.';
    case 'email_address_not_authorized':
      return 'The confirmation email could not be sent to that address. Ask Kurt to turn off email confirmation, or use Google.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many attempts. Wait a minute and try again.';
    case 'signup_disabled':
    case 'email_provider_disabled':
      return 'Email sign-up is turned off for Nerve right now.';
    default:
      return 'That did not work. Check your connection and try again.';
  }
}

async function signInWithEmail(email: string, password: string): Promise<string> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return emailProblem(error);
}

// Resolves confirm: true when the account exists but the email link must be opened first.
async function signUpWithEmail(name: string, email: string, password: string): Promise<{ error: string; confirm: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: name.trim().slice(0, 80) }, emailRedirectTo: Platform.OS === 'web' ? webHome() : Linking.createURL('auth') },
  });
  if (error) return { error: emailProblem(error), confirm: false };
  // With confirmation on, an address that is already registered comes back with no identities.
  if (data.user && !data.session && (data.user.identities?.length ?? 0) === 0) {
    return { error: 'That email already has an account. Sign in instead.', confirm: false };
  }
  return { error: '', confirm: !data.session };
}

// Finishes sign-in when the app is opened from an email confirmation link.
async function finishFromLink(url: string | null) {
  if (!url) return;
  const code = first((Linking.parse(url).queryParams ?? {}).code);
  if (code) await supabase.auth.exchangeCodeForSession(code).catch(() => undefined);
  if (code && Platform.OS === 'web') {
    // Don't leave the one-time code in the address bar.
    const clean = new URL(window.location.href);
    clean.searchParams.delete('code');
    window.history.replaceState(null, '', clean.toString());
  }
}

// The web app's own address, without the query, for sign-in redirects.
function webHome() {
  return window.location.origin + window.location.pathname;
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
    captureInvite().then(() => Linking.getInitialURL()).then(finishFromLink);
    const link = Linking.addEventListener('url', (event) => finishFromLink(event.url));
    return () => {
      alive = false;
      link.remove();
      sub.subscription.unsubscribe();
    };
  }, []);

  const api = useMemo<AuthApi>(
    () => ({
      session,
      ready,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
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
