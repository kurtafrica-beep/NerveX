import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoPlayer, VoicePlayer } from '../components/Media';
import { RecordingBar, useVoiceRecorder, VideoRecorder } from '../components/Recorders';
import { MAX_AUDIO_SECONDS } from '../config';
import { clockText, stamp, useNerve, type Recording } from '../data';
import { GUIDE } from '../guides';
import { BRANCH, BY, label } from '../moves';
import { C, F } from '../theme';
import { Btn, ConfirmLink, Icon, Pill, Seg, T } from '../ui';

type Props = { moveId: string; onClose: () => void; onPosted: () => void };

export function MoveScreen({ moveId, onClose, onPosted }: Props) {
  const n = useNerve();
  const insets = useSafeAreaInsets();
  const move = BY[moveId];

  const [version, setVersion] = useState<'base' | 'up'>('base');
  const [text, setText] = useState('');
  const [rec, setRec] = useState<Recording | null>(null);
  const [consent, setConsent] = useState(false);
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');

  const attach = useCallback((next: Recording) => {
    setRec(next);
    setConsent(false);
    setError('');
  }, []);
  const voice = useVoiceRecorder(attach);

  // Android back: close the camera first, then the sheet.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (camera) setCamera(false);
      else onClose();
      return true;
    });
    return () => sub.remove();
  }, [camera, onClose]);

  const mineHere = n.mine.filter((x) => x.move === move.id);
  const partners = n.partnersFor(move.id);
  const today = new Date().toDateString();
  const doneToday = partners.filter((id) =>
    n.lines.some((x) => x.author === id && x.move === move.id && new Date(x.created_at).toDateString() === today),
  );

  const drop = async () => {
    const line = text.trim();
    setError('');
    if (voice.active) {
      setError('Stop the recording first.');
      return;
    }
    if (!line && !rec) {
      setError('Write one line about what happened, or record it.');
      return;
    }
    if (rec && !consent) {
      setError(`Tick the box to confirm who is in the ${rec.kind === 'voice' ? 'recording' : 'video'}.`);
      return;
    }
    setBusy(true);
    const problem = await n.dropLine({ move: move.id, line, upgrade: version === 'up', recording: rec });
    setBusy(false);
    if (problem) setError(problem);
    else onPosted();
  };

  return (
    <View style={s.screen}>
      <View style={[s.bar, { paddingTop: insets.top + 6 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onClose} hitSlop={8} style={s.back}>
          <Icon name="back" />
        </Pressable>
        <T v="semi" style={{ fontSize: 16 }}>
          {BRANCH[move.b].name} · {move.n} of 10
        </T>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          <View style={s.section}>
            <T v="accent">{label(move)}</T>
            <T v="big">{move.title}</T>
            <Seg
              value={version}
              onChange={setVersion}
              options={[
                { key: 'base', label: 'The move' },
                { key: 'up', label: 'Upgrade' },
              ]}
            />
            <T style={{ fontSize: 20, lineHeight: 27 }}>{version === 'up' ? move.up : move.doIt}</T>
            <T v="sub">{version === 'up' ? 'Same move, one notch harder. Your line gets tagged as an upgrade.' : move.rep}</T>
          </View>

          {GUIDE[move.id] ? (
            <View style={s.guide}>
              <View style={s.part}>
                <T v="eyebrow">How to do it</T>
                {GUIDE[move.id].steps.map((step, i) => (
                  <View key={i} style={s.step}>
                    <T style={s.stepNum}>{i + 1}.</T>
                    <T style={{ flex: 1 }}>{step}</T>
                  </View>
                ))}
              </View>
              {GUIDE[move.id].say ? (
                <View style={s.part}>
                  <T v="eyebrow">Try saying</T>
                  <View style={s.say}>
                    <T v="semi" style={{ fontSize: 16, lineHeight: 22 }}>
                      {GUIDE[move.id].say}
                    </T>
                  </View>
                </View>
              ) : null}
              <View style={s.part}>
                <T v="eyebrow">Why it works</T>
                <T>{GUIDE[move.id].why}</T>
              </View>
              <View style={s.part}>
                <T v="eyebrow">Watch out for</T>
                <T>{GUIDE[move.id].watch}</T>
              </View>
              <View style={s.part}>
                <T v="eyebrow">Record it</T>
                <View style={s.rec}>
                  <T>{GUIDE[move.id].record}</T>
                </View>
              </View>
            </View>
          ) : null}

          <View style={s.section}>
            <T v="eyebrow">The line</T>
            <TextInput
              accessibilityLabel="The line"
              value={text}
              onChangeText={setText}
              placeholder="What happened. One line."
              placeholderTextColor={C.muted}
              multiline
              maxLength={400}
              textAlignVertical="top"
              style={s.area}
            />

            {voice.active ? (
              <RecordingBar seconds={voice.seconds} limit={MAX_AUDIO_SECONDS} onStop={voice.stop} />
            ) : rec ? (
              <View style={s.preview}>
                {rec.kind === 'voice' ? <VoicePlayer uri={rec.uri} /> : <VideoPlayer uri={rec.uri} />}
                <View style={s.previewMeta}>
                  <T v="small">
                    {rec.kind === 'voice' ? 'Voice note' : 'Video'} · {clockText(rec.seconds)}
                  </T>
                  <ConfirmLink label="Remove" onConfirm={() => setRec(null)} />
                </View>
              </View>
            ) : (
              <View style={s.recRow}>
                <Btn
                  label="Record audio"
                  icon="mic"
                  style={{ flex: 1, paddingHorizontal: 10 }}
                  onPress={async () => {
                    setError('');
                    const problem = await voice.start();
                    if (problem) setError(problem);
                  }}
                />
                <Btn
                  label="Record video"
                  icon="cam"
                  style={{ flex: 1, paddingHorizontal: 10 }}
                  onPress={() => {
                    setError('');
                    setCamera(true);
                  }}
                />
              </View>
            )}
            {!voice.active && !rec ? <T v="small">Recording starts on the tap. Audio up to 30 minutes, video up to 1 minute. Film yourself, not them.</T> : null}

            {rec ? (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: consent }}
                onPress={() => setConsent((v) => !v)}
                style={s.check}>
                <View style={[s.box, consent && { backgroundColor: C.accent, borderColor: C.accent }]}>
                  {consent ? <T style={s.tick}>✓</T> : null}
                </View>
                <T style={{ flex: 1, fontSize: 15, lineHeight: 21 }}>
                  {rec.kind === 'voice'
                    ? 'Mine is the only voice in this recording, or everyone in it said yes to being posted.'
                    : 'I am the only person you can recognise in this video, or everyone in it said yes to being posted.'}
                </T>
              </Pressable>
            ) : null}

            {error ? <T v="error">{error}</T> : null}
            <Btn label={busy ? (rec ? 'Uploading…' : 'Dropping…') : 'Drop the line'} kind="primary" wide disabled={busy} onPress={drop} />
          </View>

          <View style={s.section}>
            <T v="eyebrow">Together</T>
            {n.circle.length === 0 ? (
              <T v="sub">Nobody in your circle yet. Anyone who installs Nerve and signs in shows up here.</T>
            ) : (
              <>
                <View style={s.chips}>
                  {n.circle.map((person) => {
                    const mine = n.myChallengeTo(person.id, move.id);
                    const theirs = n.incoming.some((c) => c.author === person.id && c.move === move.id);
                    return (
                      <Pill
                        key={person.id}
                        label={person.name || 'Someone'}
                        on={!!mine || theirs}
                        disabled={pending === person.id || (theirs && !mine)}
                        onPress={async () => {
                          setPending(person.id);
                          const problem = await n.toggleChallenge(person.id, move.id);
                          setPending('');
                          if (problem) setError(problem);
                        }}
                      />
                    );
                  })}
                </View>
                <T v="sub">
                  {doneToday.length
                    ? `Line dropped today: ${doneToday.map(n.nameOf).join(', ')}.`
                    : partners.length
                      ? 'Same window, until midnight. A line each is enough.'
                      : 'Tap a name to challenge them. Same window, until midnight.'}
                </T>
              </>
            )}
          </View>

          <View style={s.section}>
            <View style={s.logHead}>
              <T v="eyebrow">Your log</T>
              <T style={s.count}>{mineHere.length}</T>
            </View>
            {mineHere.length === 0 ? (
              <T v="sub">Nothing here yet. First line starts the log.</T>
            ) : (
              mineHere.map((x) => (
                <View key={x.id} style={s.logItem}>
                  <T v="small">
                    {stamp(x.created_at)}
                    {x.upgrade ? ' · Upgrade' : ''}
                    {x.media_kind ? ` · ${x.media_kind === 'voice' ? 'Voice note' : 'Video'}` : ''}
                  </T>
                  <T>{x.line || (x.media_kind === 'voice' ? 'Voice note' : 'Video')}</T>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {camera ? (
        <VideoRecorder
          onCancel={() => setCamera(false)}
          onDone={(next) => {
            setCamera(false);
            attach(next);
          }}
        />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg, zIndex: 20, elevation: 20 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    backgroundColor: C.bg,
  },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, paddingTop: 20, gap: 24 },
  section: { gap: 10 },
  guide: { gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  part: { gap: 4 },
  step: { flexDirection: 'row', gap: 8 },
  stepNum: { fontFamily: F.semi, color: C.accent, minWidth: 18 },
  say: { paddingVertical: 10, paddingHorizontal: 14, borderLeftWidth: 3, borderLeftColor: C.accent, backgroundColor: C.accentSoft, borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  rec: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: C.bg },
  area: {
    minHeight: 108,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.surface,
    fontFamily: F.body,
    fontSize: 17,
    lineHeight: 24,
    color: C.ink,
  },
  recRow: { flexDirection: 'row', gap: 8 },
  preview: { gap: 8, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  previewMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  check: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tick: { color: C.accentInk, fontFamily: F.semi, fontSize: 15, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  logHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { fontFamily: F.display, fontSize: 34, lineHeight: 34, color: C.accent },
  logItem: { padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, gap: 2 },
});
