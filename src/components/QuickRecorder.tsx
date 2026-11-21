import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AudioQuality,
  IOSOutputFormat,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { MAX_AUDIO_SECONDS } from '../config';
import { clockText, useNerve } from '../data';
import { BRANCH, BRANCH_KEYS, BY, MOVES, PATH_KEYS, unlocked, type Move } from '../moves';
import { todaysQuest } from '../progress';
import { PLACES } from '../rpgData';
import { C, F } from '../theme';
import { Btn, Icon, T } from '../ui';
import { HandsFreePanel, useHandsFree } from './HandsFree';
import { VoicePlayer } from './Media';

// Quick takes: record now, decide later which move it belongs to.
// Takes stay on this phone until they're moved to a move.
export type Take = { id: string; uri: string; seconds: number; at: number; auto?: boolean; wav?: boolean };
const KEY = 'nerve.takes.inbox';

const VOICE: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 32000,
  isMeteringEnabled: true,
  android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
  ios: { outputFormat: IOSOutputFormat.MPEG4AAC, audioQuality: AudioQuality.MEDIUM },
  web: { mimeType: 'audio/webm', bitsPerSecond: 32000 },
};


export function useTakes() {
  const [takes, setTakes] = useState<Take[]>([]);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => setTakes(v ? (JSON.parse(v) as Take[]) : []));
  }, []);
  const save = useCallback((next: Take[]) => {
    setTakes(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, []);
  return { takes, save };
}

// Move the recorder's temporary file somewhere the phone won't clear it.
function keep(uri: string, ext = 'm4a'): string {
  try {
    const src = new File(uri);
    const dest = new File(Paths.document, `take-${Date.now()}.${ext}`);
    src.move(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}
function remove(uri: string) {
  try {
    new File(uri).delete();
  } catch {
    // already gone
  }
}

export function QuickRecorder({ visible, onClose, onError, onMode }: { visible: boolean; onClose: () => void; onError: (m: string) => void; onMode?: (m: 'idle' | 'manual' | 'auto') => void }) {
  const n = useNerve();
  const { takes, save } = useTakes();
  const recorder = useAudioRecorder(VOICE);
  const state = useAudioRecorderState(recorder, 200);
  const [mode, setModeState] = useState<'idle' | 'manual' | 'auto'>('idle');
  const takesRef = useRef(takes);
  useEffect(() => {
    takesRef.current = takes;
  }, [takes]);
  // Voice commands: say "start" and "stop", same as hands-free inside a move.
  const hf = useHandsFree(
    useCallback(
      async (rec: { uri: string; seconds: number; wav?: boolean }) => {
        save([{ id: String(Date.now()), uri: keep(rec.uri, rec.wav ? 'wav' : 'm4a'), seconds: rec.seconds, at: Date.now(), auto: true, wav: rec.wav }, ...takesRef.current]);
        return true;
      },
      [save],
    ),
  );
  const setMode = useCallback(
    (m: 'idle' | 'manual' | 'auto') => {
      setModeState(m);
      onMode?.(m);
    },
    [onMode],
  );
  const voiceToggle = useCallback(
    async (on: boolean) => {
      if (on) {
        await hf.turnOn();
        onMode?.('auto');
      } else {
        hf.turnOff();
        onMode?.('idle');
      }
    },
    [hf, onMode],
  );
  const [picking, setPicking] = useState<Take | null>(null);
  const [busy, setBusy] = useState('');
  const seg = useRef({ start: 0, firstLoud: 0, lastLoud: 0, last: 0 });

  const add = useCallback(
    (t: Take) => {
      save([t, ...takesRef.current]);
    },
    [save],
  );

  const begin = useCallback(async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
    seg.current = { start: Date.now(), firstLoud: 0, lastLoud: 0, last: 0 };
  }, [recorder]);

  const finish = useCallback(
    async (keepIt: boolean, auto: boolean) => {
      try {
        await recorder.stop();
      } catch {
        // the file is still there
      }
      const uri = recorder.uri;
      const seconds = (Date.now() - seg.current.start) / 1000;
      if (!uri) return;
      if (keepIt) add({ id: String(Date.now()), uri: keep(uri), seconds, at: Date.now(), auto });
      else remove(uri);
    },
    [recorder, add],
  );

  const startMode = useCallback(
    async (next: 'manual' | 'auto') => {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        onError('Nerve needs the microphone to record. Allow it in your phone settings.');
        return;
      }
      try {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await begin();
        setMode(next);
      } catch {
        onError('Recording could not start. Close other apps using the microphone and try again.');
      }
    },
    [begin, onError, setMode],
  );

  const stopAll = useCallback(async () => {
    setMode('idle');
    await finish(true, false);
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // nothing to undo
    }
  }, [finish, setMode]);

  // Manual takes stop at the limit.
  useEffect(() => {
    if (mode !== 'manual' || state.durationMillis < MAX_AUDIO_SECONDS * 1000) return;
    const t = setTimeout(stopAll, 0);
    return () => clearTimeout(t);
  }, [mode, state.durationMillis, stopAll]);

  const level = Math.max(0, Math.min(1, ((state.metering ?? -160) + 60) / 60));
  const recording = mode !== 'idle';
  const voiceOn = hf.on;
  const busyMic = recording || voiceOn;

  const moveTo = async (take: Take, move: Move) => {
    setBusy(take.id);
    const problem = await n.dropLine({ move: move.id, line: '', upgrade: false, recording: { kind: 'voice', uri: take.uri, seconds: take.seconds, wav: take.wav }, posted: false });
    setBusy('');
    if (problem) {
      onError(problem);
      return;
    }
    remove(take.uri);
    save(takesRef.current.filter((t) => t.id !== take.id));
    setPicking(null);
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View style={s.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={mode === 'manual' || voiceOn ? undefined : onClose} accessibilityLabel="Close" />
        <View style={s.sheet} accessibilityViewIsModal>
          <View style={s.grab} />
          {picking ? (
            <MovePicker take={picking} busy={busy === picking.id} onPick={(m) => moveTo(picking, m)} onBack={() => setPicking(null)} />
          ) : (
            <>
              <View style={s.head}>
                <T v="h" style={{ fontSize: 26 }}>
                  Quick take
                </T>
                <Btn label="Close" kind="quiet" small disabled={mode === 'manual' || voiceOn} onPress={onClose} />
              </View>

              <View style={s.deck}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
                  disabled={voiceOn}
                  onPress={() => (recording ? stopAll() : startMode('manual'))}
                  style={({ pressed }) => [s.big, recording && s.bigOn, voiceOn && { opacity: 0.4 }, pressed && { transform: [{ scale: 0.96 }] }]}>
                  <Icon name={recording ? 'stop' : 'mic'} size={36} color={recording ? '#FFFFFF' : C.ink} width={2.4} />
                </Pressable>
                <View style={{ flex: 1, gap: 6 }}>
                  <T style={s.clock}>{recording ? clockText(state.durationMillis / 1000) : '0:00'}</T>
                  <T v="small" style={{ color: C.ink }}>
                    {mode === 'manual' ? 'Recording. Tap to stop.' : voiceOn ? 'Voice commands are on. Use them below.' : 'Tap to record. It goes to your takes below.'}
                  </T>
                  <View style={s.meter}>
                    <View style={[s.meterFill, { width: `${Math.round(level * 100)}%` }]} />
                  </View>
                </View>
              </View>

              <View style={s.autoRow}>
                <View style={{ flex: 1 }}>
                  <T v="semi" style={{ fontSize: 16 }}>
                    Auto record
                  </T>
                  <T v="small">Say “start” to record and “stop” to save it to your takes, then it listens again. Keep Nerve open; the screen stays on.</T>
                </View>
                <Switch
                  value={voiceOn}
                  disabled={recording}
                  onValueChange={voiceToggle}
                  trackColor={{ true: C.accent, false: C.line }}
                  thumbColor={C.surface}
                  accessibilityLabel="Auto record with start and stop"
                />
              </View>
              {voiceOn ? <HandsFreePanel hf={hf} /> : null}
              {hf.error ? <T v="error">{hf.error}</T> : null}

              <View style={s.listHead}>
                <T v="semi" style={{ fontSize: 16 }}>
                  Your takes
                </T>
                <T v="small">{takes.length ? `${takes.length} waiting` : ''}</T>
              </View>
              <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 10 }}>
                {takes.length === 0 ? (
                  <T v="sub">Nothing yet. Record a take, then add it to the move it belongs to. Takes stay on this phone until you do.</T>
                ) : (
                  takes.map((t) => (
                    <View key={t.id} style={s.take}>
                      <View style={s.takeHead}>
                        <T v="semi" style={{ fontSize: 15 }}>
                          {new Date(t.at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                          {t.auto ? '  · auto' : ''}
                        </T>
                        <T v="small">{clockText(t.seconds)}</T>
                      </View>
                      <VoicePlayer uri={t.uri} />
                      <View style={s.row}>
                        <Btn label="Add to a move" kind="primary" small disabled={busyMic} onPress={() => setPicking(t)} />
                        <Btn
                          label="Delete"
                          kind="quiet"
                          small
                          onPress={() => {
                            remove(t.uri);
                            save(takesRef.current.filter((x) => x.id !== t.id));
                          }}
                        />
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Pick the move a take belongs to: tonight's move and today's quest first, then everything open.
function MovePicker({ take, busy, onPick, onBack }: { take: Take; busy: boolean; onPick: (m: Move) => void; onBack: () => void }) {
  const n = useNerve();
  const p = n.progress;
  const open = (m: Move) => !m.retired && unlocked(m, n.count, p.open, p.level, n.test);
  const groups: { title: string; moves: Move[] }[] = [];
  groups.push({ title: 'Tonight', moves: [n.tonight.move, todaysQuest()] });
  for (const b of BRANCH_KEYS) groups.push({ title: BRANCH[b].name, moves: MOVES.filter((m) => m.b === b && open(m)) });
  PLACES.forEach((pl, k) => {
    const ms = MOVES.filter((m) => m.b === 'x' && m.place === k && open(m));
    if (ms.length) groups.push({ title: pl.name, moves: ms });
  });
  for (const b of PATH_KEYS) {
    const ms = MOVES.filter((m) => m.b === b && open(m));
    if (ms.length) groups.push({ title: `${BRANCH[b].name} path`, moves: ms });
  }
  return (
    <>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <T v="h" style={{ fontSize: 24 }}>
            Which move was it?
          </T>
          <T v="small">{clockText(take.seconds)} take. It saves to that move as a private take, like recording it there.</T>
        </View>
      </View>
      <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: 14 }}>
        {groups
          .filter((g) => g.moves.length)
          .map((g) => (
            <View key={g.title} style={{ gap: 6 }}>
              <T v="eyebrow">{g.title}</T>
              {g.moves.map((m) => (
                <Pressable
                  key={g.title + m.id}
                  disabled={busy}
                  accessibilityRole="button"
                  onPress={() => onPick(BY[m.id])}
                  style={({ pressed }) => [s.pick, pressed && { backgroundColor: C.accentSoft }]}>
                  <T v="semi" style={{ flex: 1, fontSize: 16, lineHeight: 21 }}>
                    {m.title}
                  </T>
                  {n.count[m.id] ? <T style={{ fontFamily: F.semi, fontSize: 13, color: C.accentText }}>{n.count[m.id]} lines</T> : null}
                </Pressable>
              ))}
            </View>
          ))}
      </ScrollView>
      <Btn label={busy ? 'Saving…' : 'Back to takes'} kind="quiet" disabled={busy} onPress={onBack} />
    </>
  );
}

const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(20,32,27,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 16, paddingBottom: 30, gap: 14 },
  grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: C.line },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  deck: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14, borderRadius: 8, backgroundColor: C.bg },
  big: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.accent, borderWidth: 2.5, borderColor: C.ink, borderBottomWidth: 6, alignItems: 'center', justifyContent: 'center' },
  bigOn: { backgroundColor: C.rec },
  clock: { fontFamily: F.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.5, color: C.ink },
  meter: { height: 8, borderRadius: 4, backgroundColor: C.bgDeep, overflow: 'hidden' },
  meterFill: { height: '100%', backgroundColor: C.accent },
  autoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 1.5, borderTopColor: C.line, paddingTop: 12 },
  take: { padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, gap: 8 },
  takeHead: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 8 },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 6, borderWidth: 1.5, borderColor: C.line },
});
