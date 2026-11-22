import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { C, F } from '../theme';
import { Btn, T } from '../ui';

// Shown after a password reset link opens the app.
export function NewPassword() {
  const { setNewPassword, cancelRecovery } = useAuth();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (password.length < 8) return setError('Pick a password of at least 8 characters.');
    if (password !== again) return setError('The two passwords don’t match.');
    setBusy(true);
    const problem = await setNewPassword(password);
    setBusy(false);
    setError(problem);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
        <View style={{ gap: 8 }}>
          <T v="h">Set a new password</T>
          <T v="sub">Pick one you don’t use anywhere else. You’ll stay signed in afterwards.</T>
        </View>
        <TextInput
          accessibilityLabel="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="New password, at least 8 characters"
          placeholderTextColor={C.muted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          style={s.field}
        />
        <TextInput
          accessibilityLabel="New password again"
          value={again}
          onChangeText={setAgain}
          placeholder="Same password again"
          placeholderTextColor={C.muted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          style={s.field}
          returnKeyType="go"
          onSubmitEditing={save}
        />
        {error ? <T v="error">{error}</T> : null}
        <Btn label={busy ? 'Saving…' : 'Save new password'} kind="primary" wide disabled={busy} onPress={save} />
        <Btn label="Cancel" kind="quiet" wide disabled={busy} onPress={cancelRecovery} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: 24, gap: 14 },
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
});
