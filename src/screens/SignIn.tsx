import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { C, F } from '../theme';
import { Btn, T } from '../ui';

export function SignIn() {
  const { signInWithGoogle } = useAuth();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  return (
    <View style={[s.wrap, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}>
      <View style={{ gap: 12 }}>
        <T style={s.wordmark}>NERVE</T>
        <T style={s.tagline}>Do the move. Drop the line.</T>
        <T v="sub">
          Thirty small moves for talking to people, in three branches. Pick one tonight, do it, and tell your circle what happened.
        </T>
      </View>
      <View style={{ gap: 12 }}>
        {error ? <T v="error">{error}</T> : null}
        <Btn
          label={busy ? 'Opening Google…' : 'Continue with Google'}
          kind="primary"
          wide
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            setError('');
            const problem = await signInWithGoogle();
            setBusy(false);
            setError(problem);
          }}
        />
        <T v="small">Your name and photo come from your Google account. Only people signed in to Nerve can see your lines.</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24, justifyContent: 'space-between' },
  wordmark: { fontFamily: F.display, fontSize: 84, lineHeight: 80, color: C.ink },
  tagline: { fontFamily: F.semi, fontSize: 22, lineHeight: 28, color: C.accent },
});
