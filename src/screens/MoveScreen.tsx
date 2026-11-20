import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RemoteMedia } from '../components/Media';
import { RecordingBar, useVoiceRecorder, VideoRecorder } from '../components/Recorders';
import { MAX_AUDIO_SECONDS } from '../config';
import { clockText, stamp, useNerve, type Line, type Recording } from '../data';
import { GUIDE } from '../guides';
import { BRANCH, BY, inLevel, label, levelSize, lvl, unlocked } from '../moves';
import { C, F } from '../theme';
import { Btn, ConfirmLink, Icon, Pill, Seg, T } from '../ui';

type Props = { moveId: string; onClose: () => void; onPosted: () => void };

export function MoveScreen({ moveId, onClose, onPosted }: Props) {
  const n = useNerve();
  const insets = useSafeAreaInsets();
  const move = BY[moveId];

  const [version, setVersion] = useState<'base' | 'up'>('base');
  const [text, setText] = useState('');
  // A take that failed to save, kept so it can be retried.
  const [failed, setFailed] = useState<Recording | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');

  const locked = !unlocked(move, n.count);
  const { dropLine } = n;

  // Every finished recording is saved straight to your log as a private take.
  const saveTake = useCallback(
    async (take: Recording) => {
      setError('');
      setSaved('');
      if (locked) {
        setError('This move is locked for now, so the take was not saved.');
        return;
      }
      setSaving(true);
      const problem = await dropLine({ move: move.id, line: '', upgrade: version === 'up', recording: take, posted: false });
      setSaving(false);
      if (problem) {
        setFailed(take);
        setError(problem);
        return;
      }
      setFailed(null);
      setSaved(`${take.kind === 'voice' ? 'Voice note' : 'Video'} saved to your log. Only you can see it until you post it.`);
    },
    [dropLine, locked, move.id, version],
  );
  const voice = useVoiceRecorder(saveTake);

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
    if (locked) {
      setError('This move is locked for now.');
      return;
    }
    if (voice.active) {
      setError('Stop the recording first.');
      return;
    }
    if (!line) {
      setError('Write one line about what happened. Recordings save to your log by themselves.');
      return;
    }
    setBusy(true);
    const problem = await n.dropLine({ move: move.id, line, upgrade: version === 'up', recording: null });
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
          {BRANCH[move.b].name} · Level {lvl(move.n)} · {inLevel(move.n)} of {levelSize(lvl(move.n))}
        </T>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          <View style={s.section}>
            <T v="accent">{label(move)}</T>
            <T v="big">{move.title}</T>
            {locked ? (
              <View style={s.lock}>
                <T v="semi" style={{ fontSize: 16, lineHeight: 22 }}>
                  Locked. Drop a line on every {BRANCH[move.b].name} Level {lvl(move.n) - 1} move to open Level {lvl(move.n)}.
                </T>
              </View>
            ) : null}
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
            ) : saving ? (
              <View style={s.status}>
                <T v="semi" style={{ fontSize: 16 }}>
                  Saving your take…
                </T>
              </View>
            ) : (
              <View style={s.recRow}>
                <Btn
                  label={n.mine.some((x) => x.move === move.id && x.media_path) ? 'Another audio' : 'Record audio'}
                  icon="mic"
                  disabled={locked}
                  style={{ flex: 1, paddingHorizontal: 10 }}
                  onPress={async () => {
                    setError('');
                    setSaved('');
                    const problem = await voice.start();
                    if (problem) setError(problem);
                  }}
                />
                <Btn
                  label={n.mine.some((x) => x.move === move.id && x.media_path) ? 'Another video' : 'Record video'}
                  icon="cam"
                  disabled={locked}
                  style={{ flex: 1, paddingHorizontal: 10 }}
                  onPress={() => {
                    setError('');
                    setSaved('');
                    setCamera(true);
                  }}
                />
              </View>
            )}
            {saved ? (
              <View style={s.saved}>
                <T v="semi" style={{ fontSize: 15, lineHeight: 21, color: C.accent }}>
                  {saved}
                </T>
              </View>
            ) : null}
            {!voice.active && !saving && !saved ? (
              <T v="small">Recording starts on the tap and saves to your log when you stop. Audio up to 30 minutes, video up to 1 minute. Film yourself, not them.</T>
            ) : null}
            {failed && !saving ? (
              <View style={s.recRow}>
                <Btn label="Try saving again" kind="primary" small onPress={() => saveTake(failed)} />
                <Btn label="Discard" kind="quiet" small onPress={() => { setFailed(null); setError(''); }} />
              </View>
            ) : null}

            {error ? <T v="error">{error}</T> : null}
            <Btn label={busy ? 'Dropping…' : 'Drop the line'} kind="primary" wide disabled={busy || locked} onPress={drop} />
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
              <T v="sub">Nothing here yet. Your first take or line starts the log.</T>
            ) : (
              mineHere.map((x) => <LogItem key={x.id} line={x} onError={setError} />)
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {camera ? (
        <VideoRecorder
          onCancel={() => setCamera(false)}
          onDone={(next) => {
            setCamera(false);
            saveTake(next);
          }}
        />
      ) : null}
    </View>
  );
}

// One entry in your log. Private takes can be played back and posted with an optional caption.
function LogItem({ line, onError }: { line: Line; onError: (message: string) => void }) {
  const n = useNerve();
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const isPrivate = line.posted === false;
  const kind = line.media_kind === 'voice' ? 'Voice note' : line.media_kind === 'video' ? 'Video' : '';
  return (
    <View style={s.logItem}>
      <View style={s.logMeta}>
        <T v="small" style={{ flex: 1 }}>
          {stamp(line.created_at)}
          {line.upgrade ? ' · Upgrade' : ''}
          {kind ? ` · ${kind}` : ''}
          {line.media_seconds ? ` · ${clockText(line.media_seconds)}` : ''}
        </T>
        <T style={[s.badge, isPrivate ? s.badgePrivate : s.badgePosted]}>{isPrivate ? 'Private' : 'Posted'}</T>
      </View>
      {line.line ? <T>{line.line}</T> : null}
      {line.media_path && line.media_kind ? <RemoteMedia path={line.media_path} kind={line.media_kind} seconds={line.media_seconds} /> : null}
      {isPrivate ? (
        <View style={{ gap: 8 }}>
          <TextInput
            accessibilityLabel="Caption for this take"
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a line (optional)"
            placeholderTextColor={C.muted}
            maxLength={400}
            style={s.caption}
          />
          <View style={s.logActions}>
            <Btn
              label={busy ? 'Posting…' : 'Post to feed'}
              kind="primary"
              small
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                const problem = await n.postLine(line, caption);
                setBusy(false);
                if (problem) onError(problem);
              }}
            />
            <ConfirmLink
              label="Delete"
              onConfirm={async () => {
                const problem = await n.deleteLine(line);
                if (problem) onError(problem);
              }}
            />
          </View>
        </View>
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
  lock: { padding: 12, borderRadius: 14, backgroundColor: C.accentSoft },
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
  status: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center' },
  saved: { padding: 12, borderRadius: 14, backgroundColor: C.accentSoft },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  badgePrivate: { backgroundColor: C.bg, color: C.muted },
  badgePosted: { backgroundColor: C.accentSoft, color: C.accent },
  caption: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, fontFamily: F.body, fontSize: 16, color: C.ink },
  logActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  logHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { fontFamily: F.display, fontSize: 34, lineHeight: 34, color: C.accent },
  logItem: { padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, gap: 8 },
});
