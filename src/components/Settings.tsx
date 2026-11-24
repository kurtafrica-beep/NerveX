import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { useNerve } from '../data';
import { useStage } from '../stage';
import { inviteCode, sendInvite } from '../invite';
import { PATH_KEYS } from '../moves';
import { lastMic, micsSeen } from '../mic';
import { ON_WEB } from '../platform';
import type { Reward } from './Reward';
import { C, F } from '../theme';
import { Btn, T } from '../ui';

// Account settings: a sheet from the gear on the You screen.
export function Settings({ onClose, onError, onPreview }: { onClose: () => void; onError: (message: string) => void; onPreview: (r: Reward) => void }) {
  const n = useNerve();
  const stage = useStage();
  const { session, signOut, resetPassword } = useAuth();
  const insets = useSafeAreaInsets();
  const me = n.profiles[n.uid];
  const [name, setName] = useState(me?.name ?? '');
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [mics] = useState(() => micsSeen());
  const nudges = me?.allow_nudges !== false;

  const run = async (key: string, fn: () => Promise<string>, done: string) => {
    setBusy(key);
    const problem = await fn();
    setBusy('');
    if (problem) onError(problem);
    else setNote(done);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.shade} accessibilityLabel="Close" onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <ScrollView contentContainerStyle={{ gap: 4, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
          <View style={s.head}>
            <T v="h">Account</T>
            <Btn label="Close" kind="quiet" small onPress={onClose} />
          </View>
          {note ? (
            <T v="small" style={s.note} accessibilityLiveRegion="polite">
              {note}
            </T>
          ) : null}

          <View style={s.group}>
            <T style={s.h3}>Profile</T>
            <T style={s.label}>Name</T>
            <TextInput
              accessibilityLabel="Name"
              value={name}
              onChangeText={setName}
              maxLength={40}
              autoComplete="name"
              style={s.field}
              placeholderTextColor={C.muted}
            />
            <T v="small">This is the name your circle and rope team see.</T>
            <Btn
              label="Save name"
              small
              disabled={busy === 'name' || !name.trim() || name.trim() === me?.name}
              onPress={() => run('name', () => n.setName(name), 'Name saved.')}
              style={{ alignSelf: 'flex-start' }}
            />
          </View>

          {ON_WEB ? null : (
            <View style={s.group}>
              <T style={s.h3}>Microphone</T>
              <T v="small">Voice takes record from a headset’s mic when one is connected, and from the phone when not. A Bluetooth mic takes a second or two to open, and sounds like a phone call.</T>
              <T v="semi" style={{ fontSize: 15 }}>
                Connected now: {mics.length ? mics.join(', ') : 'Phone mic'}
              </T>
              {lastMic() ? <T v="small">Last take: {lastMic()}</T> : null}
            </View>
          )}

          <View style={s.group}>
            <T style={s.h3}>Friends</T>
            <Invite onError={onError} />
          </View>

          <View style={s.group}>
            <T style={s.h3}>Rope team</T>
            <View style={s.toggle}>
              <View style={{ flex: 1 }}>
                <T v="semi">Allow nudges</T>
                <T v="small">Teammates can nudge you when you’re short on moves. Turn this off and your team won’t see a Nudge button next to your name.</T>
              </View>
              <Switch
                accessibilityLabel="Allow nudges"
                value={nudges}
                disabled={busy === 'nudges'}
                onValueChange={(on) => run('nudges', () => n.setAllowNudges(on), on ? 'Teammates can nudge you.' : 'Nudges are off.')}
              />
            </View>
          </View>

          <View style={s.group}>
            <T style={s.h3}>Testing</T>
            <View style={s.toggle}>
              <View style={{ flex: 1 }}>
                <T v="semi">Tester mode</T>
                <T v="small">Opens every path, place and patch so you can try them. It comes off before launch.</T>
              </View>
              <Switch
                accessibilityLabel="Tester mode"
                value={n.test}
                onValueChange={(on) => {
                  n.setTest(on);
                  const first = PATH_KEYS.find((b) => !n.progress.paths[b].met);
                  if (on && first) onPreview({ levels: [], level: 0, ach: [], gained: 0, paths: [first], preview: true });
                }}
              />
            </View>
            <View style={s.toggle}>
              <View style={{ flex: 1 }}>
                <T v="semi">See it as a new user</T>
                <T v="small">Shows the first-day version of every tab until you turn this off or close the app.</T>
              </View>
              <Switch accessibilityLabel="See it as a new user" value={stage.fresh} onValueChange={stage.setFresh} />
            </View>
            <Btn
              label="Replay the intro"
              small
              style={{ alignSelf: 'flex-start' }}
              onPress={() => {
                onClose();
                stage.replayIntro();
              }}
            />
          </View>

          <View style={s.group}>
            <T style={s.h3}>Signed in</T>
            <T v="small">{session?.user.email ? `As ${session.user.email}` : 'Signed in.'}</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {session?.user.email && session.user.app_metadata?.provider === 'email' ? (
                <Btn
                  label="Change password"
                  small
                  disabled={busy === 'pw'}
                  onPress={() => run('pw', () => resetPassword(session.user.email ?? ''), `We sent a link to ${session.user.email}. Open it on this phone to set a new password.`)}
                />
              ) : null}
              <Btn label="Sign out" small onPress={signOut} />
            </View>
          </View>

          <View style={s.group}>
            <T style={[s.h3, { color: C.danger }]}>Delete account</T>
            <T v="small">Deletes your account, lines, recordings, reactions and rope teams for good. This can’t be undone.</T>
            <T style={s.label}>Type DELETE to confirm</T>
            <TextInput
              accessibilityLabel="Type DELETE to confirm"
              value={word}
              onChangeText={setWord}
              autoCapitalize="characters"
              autoCorrect={false}
              style={s.field}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: word.trim() !== 'DELETE' || busy === 'delete' }}
              disabled={word.trim() !== 'DELETE' || busy === 'delete'}
              onPress={async () => {
                setBusy('delete');
                const problem = await n.deleteAccount();
                setBusy('');
                if (problem) onError(problem);
              }}
              style={({ pressed }) => [s.danger, (word.trim() !== 'DELETE' || busy === 'delete') && { opacity: 0.45 }, pressed && { backgroundColor: C.danger }]}>
              {({ pressed }) => <T style={[s.dangerText, pressed && { color: '#FFFFFF' }]}>{busy === 'delete' ? 'Deleting…' : 'Delete my account'}</T>}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Invite({ onError }: { onError: (message: string) => void }) {
  const n = useNerve();
  const mine = inviteCode(n.uid);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState('');
  const [copied, setCopied] = useState(false);
  const send = async () => {
    const how = await sendInvite(mine);
    if (how === 'copied') setJoined('');
    setCopied(how === 'copied');
    if (how === 'failed') onError('Sharing didn’t open. Send your code instead: ' + mine);
  };
  const redeem = async () => {
    setBusy(true);
    const r = await n.redeemInvite(code);
    setBusy(false);
    if (r.problem) return onError(r.problem);
    setCode('');
    setJoined(r.who ?? 'your friend');
  };
  return (
    <View style={{ gap: 10 }}>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <T v="semi">Bring a friend</T>
          <T v="small">
            Your code is <T v="small" style={{ fontFamily: F.displayBold, color: C.ink, letterSpacing: 1 }}>{mine}</T>
          </T>
        </View>
        <Btn label="Invite friends" small onPress={send} />
      </View>
      <View style={s.row}>
        <TextInput
          accessibilityLabel="Friend's invite code"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().slice(0, 8))}
          placeholder="Got a code?"
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
          style={[s.field, { flex: 1, fontFamily: F.displayBold, letterSpacing: 2 }]}
        />
        <Btn label="Join" kind="outline" small disabled={busy || code.length !== 8} onPress={redeem} />
      </View>
      {copied ? <T v="small" style={{ color: C.accentText, fontFamily: F.semi }}>Invite copied. Paste it to a friend.</T> : null}
      {joined ? <T v="small" style={{ color: C.accentText, fontFamily: F.semi }}>You and {joined} are in each other’s circle now.</T> : null}
    </View>
  );
}

const s = StyleSheet.create({
  shade: { flex: 1, backgroundColor: 'rgba(20,28,24,0.45)' },
  sheet: { maxHeight: '90%', paddingHorizontal: 16, paddingTop: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderTopWidth: 2, borderColor: C.ink, backgroundColor: C.surface },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 8 },
  note: { padding: 10, borderRadius: 8, backgroundColor: C.bg, fontFamily: F.semi, color: C.ink },
  group: { gap: 8, paddingTop: 14, paddingBottom: 6, borderTopWidth: 1, borderTopColor: C.line },
  h3: { fontFamily: F.semi, fontSize: 17, lineHeight: 22, color: C.ink },
  label: { fontFamily: F.semi, fontSize: 14, color: C.muted },
  field: { borderWidth: 1.5, borderColor: C.ink, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: F.medium, fontSize: 16, color: C.ink, backgroundColor: C.surface },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  danger: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: C.danger },
  dangerText: { fontFamily: F.semi, fontSize: 15, color: C.danger },
});
