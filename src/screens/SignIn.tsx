import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { C, F } from '../theme';
import { Btn, Seg, T } from '../ui';

type Mode = 'in' | 'up' | 'reset';

export function SignIn() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'' | 'email' | 'google'>('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const submit = async () => {
    setError('');
    setNote('');
    const address = email.trim();
    if (mode === 'up' && !name.trim()) return setError('Add the name your circle will see.');
    if (!/^\S+@\S+\.\S+$/.test(address)) return setError('Enter your email address.');
    if (mode === 'reset') {
      setBusy('email');
      const problem = await resetPassword(address);
      setBusy('');
      if (problem) return setError(problem);
      setNote(`If ${address} has a Nerve account, a reset link is on its way. Open it on this phone to set a new password.`);
      return;
    }
    if (password.length < 8) return setError(mode === 'up' ? 'Pick a password of at least 8 characters.' : 'Enter your password.');

    setBusy('email');
    if (mode === 'in') {
      const problem = await signInWithEmail(address, password);
      setBusy('');
      setError(problem);
      return;
    }
    const result = await signUpWithEmail(name, address, password);
    setBusy('');
    if (result.error) return setError(result.error);
    if (result.confirm) {
      setMode('in');
      setNote(`We sent a link to ${address}. Open it, then sign in here.`);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
        <View style={{ gap: 10 }}>
          <T style={s.wordmark}>NERVE</T>
          <T style={s.tagline}>Do the move. Drop the line.</T>
          <T v="sub">125 moves for talking to people, in five branches of five levels, plus harder paths once you are ready. Pick one tonight, do it, and tell your circle what happened.</T>
        </View>

        <View style={{ gap: 12 }}>
          {mode === 'reset' ? (
            <View style={{ gap: 4 }}>
              <T v="h">Reset your password</T>
              <T v="sub">Enter your email and we’ll send you a link to set a new one.</T>
            </View>
          ) : (
          <Seg
            value={mode}
            onChange={(next) => {
              setMode(next);
              setError('');
              setNote('');
            }}
            options={[
              { key: 'in', label: 'Sign in' },
              { key: 'up', label: 'Create account' },
            ]}
          />
          )}
          {mode === 'up' ? (
            <TextInput
              accessibilityLabel="Your name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={C.muted}
              maxLength={80}
              autoCapitalize="words"
              autoComplete="name"
              style={s.field}
            />
          ) : null}
          <TextInput
            accessibilityLabel="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            style={s.field}
          />
          {mode === 'reset' ? null : (
          <TextInput
            accessibilityLabel="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'up' ? 'Password, at least 8 characters' : 'Password'}
            placeholderTextColor={C.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
            style={s.field}
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          )}
          {mode === 'in' ? (
            <Btn
              label="Forgot password?"
              kind="quiet"
              small
              style={{ alignSelf: 'flex-start' }}
              onPress={() => {
                setMode('reset');
                setError('');
                setNote('');
              }}
            />
          ) : null}
          {note ? <T style={s.note}>{note}</T> : null}
          {error ? <T v="error">{error}</T> : null}
          <Btn
            label={busy === 'email' ? 'One moment…' : mode === 'up' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
            kind="primary"
            wide
            disabled={busy !== ''}
            onPress={submit}
          />

          {mode === 'reset' ? (
            <Btn
              label="Back to sign in"
              kind="quiet"
              wide
              onPress={() => {
                setMode('in');
                setError('');
              }}
            />
          ) : null}
          {mode === 'reset' ? null : (
          <>
          <View style={s.or}>
            <View style={s.rule} />
            <T v="small">or</T>
            <View style={s.rule} />
          </View>

          <Btn
            label={busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
            wide
            disabled={busy !== ''}
            onPress={async () => {
              setBusy('google');
              setError('');
              setNote('');
              const problem = await signInWithGoogle();
              setBusy('');
              setError(problem);
            }}
          />
          </>
          )}
          <T v="small">Only people signed in to Nerve can see your lines.</T>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between', gap: 32 },
  wordmark: { fontFamily: F.display, fontSize: 84, lineHeight: 80, color: C.ink },
  tagline: { fontFamily: F.semi, fontSize: 22, lineHeight: 28, color: C.accentText },
  field: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.surface,
    fontFamily: F.body,
    fontSize: 17,
    color: C.ink,
  },
  note: { fontFamily: F.semi, fontSize: 15, lineHeight: 20, color: C.accentText },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: C.line },
});
