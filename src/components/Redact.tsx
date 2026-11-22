import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clockText, type Recording } from '../data';
import { useRedactEngine } from '../redact/useEngine';
import { forgetVoice, PASSAGE, saveVoice, setMuteOthers, useVoice } from '../redact/voice';
import type { Analysis, Redaction, Span } from '../redact/types';
import { remove, playable } from '../takeStore';
import { C, F } from '../theme';
import { Btn, T } from '../ui';
import { VoicePlayer } from './Media';
import { RecordingBar, useVoiceRecorder } from './Recorders';

// ---------------------------------------------------------------------------
// The strip: one bar for the whole take. Blaze is you (kept). Hatched grey is
// someone else (muted). A thin outline is a bit of you that you chose to mute.

export function VoiceStrip({
  duration,
  you,
  them,
  muted,
  selected,
  onPick,
  playhead,
  height = 44,
}: {
  duration: number;
  you: Span[];
  them: Span[];
  muted?: Set<number>;
  selected?: number | null;
  onPick?: (i: number) => void;
  playhead?: number;
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const pct = (t: number) => `${Math.max(0, Math.min(100, (t / Math.max(duration, 0.001)) * 100))}%` as const;
  const pick = (e: GestureResponderEvent) => {
    if (!onPick || !width || !you.length) return;
    const t = (e.nativeEvent.locationX / width) * duration;
    let best = -1;
    let gap = Infinity;
    you.forEach(([a, b], i) => {
      const d = t < a ? a - t : t > b ? t - b : 0;
      if (d < gap) {
        gap = d;
        best = i;
      }
    });
    // within about 4% of the strip counts as a tap on that bit
    if (best >= 0 && gap <= duration * 0.04) onPick(best);
  };
  return (
    <Pressable
      accessibilityRole={onPick ? 'adjustable' : undefined}
      accessibilityLabel={`Your voice kept for ${clockText(you.reduce((a, [x, y]) => a + y - x, 0))} of ${clockText(duration)}. Other voices muted.`}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onPress={pick}
      disabled={!onPick}
      style={[st.track, { height }]}>
      {them.map(([a, b], i) => (
        <View key={`t${i}`} style={[st.them, { left: pct(a), width: pct(b - a) }]} />
      ))}
      {you.map(([a, b], i) => (
        <View
          key={`y${i}`}
          style={[st.you, muted?.has(i) && st.youMuted, selected === i && st.youSel, { left: pct(a), width: pct(b - a) }]}
        />
      ))}
      {playhead != null ? <View style={[st.head, { left: pct(playhead) }]} /> : null}
    </Pressable>
  );
}

// Merge their stretches that are close together into gaps worth a caption.
function gapsOf(them: Span[]): Span[] {
  const out: Span[] = [];
  for (const [a, b] of them) {
    const last = out[out.length - 1];
    if (last && a - last[1] < 1.2) last[1] = b;
    else out.push([a, b]);
  }
  return out.filter(([a, b]) => b - a >= 0.6);
}

// ---------------------------------------------------------------------------
// Review: runs right after a voice take when "Mute other voices" is on.
// Nothing is saved or uploaded until you press Save. The original recording,
// with the other person in it, is deleted from the phone once the redacted
// take is saved, or when you discard.

export function RedactReview({
  take,
  onSave,
  onDiscard,
  keepOnCancel,
}: {
  take: Recording;
  // quick takes stay in your takes if you back out
  keepOnCancel?: boolean;
  // resolves true once the redacted take is safely saved
  onSave: (rec: Recording) => Promise<boolean>;
  onDiscard: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { profile } = useVoice();
  const { engine, host } = useRedactEngine();
  const [phase, setPhase] = useState<'reading' | 'ready' | 'saving' | 'error'>('reading');
  const [problem, setProblem] = useState('');
  const [a, setA] = useState<Analysis | null>(null);
  const [muted, setMuted] = useState<Set<number>>(new Set());
  const [sel, setSel] = useState<number | null>(null);
  const [caps, setCaps] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const made = useRef<string[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !profile) return;
    started.current = true;
    (async () => {
      try {
        await engine.load(take.uri);
        const r = await engine.analyze(profile);
        if (r.error) throw new Error(r.error);
        setA(r);
        setPhase('ready');
      } catch (e) {
        setProblem(e instanceof Error ? e.message : 'Nerve could not read this take.');
        setPhase('error');
      }
    })();
  }, [engine, profile, take.uri]);

  // Tidy up preview files and the engine's copy when the sheet closes (only then).
  // (engine is stable for the life of the sheet, so this runs once, on close)
  useEffect(
    () => () => {
      made.current.forEach(remove);
      engine.clear();
    },
    [engine],
  );

  const keep = useMemo(() => (a ? a.you.filter((_, i) => !muted.has(i)) : []), [a, muted]);
  const keptSec = keep.reduce((t, [x, y]) => t + y - x, 0);
  const gaps = useMemo(() => (a ? gapsOf(a.them) : []), [a]);

  const toggle = (i: number) => {
    setMuted((m) => {
      const next = new Set(m);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    setPreview(null);
  };

  const makePreview = async () => {
    setPreviewing(true);
    try {
      const uri = await engine.render(keep);
      made.current.push(uri);
      setPreview(await playable(uri));
    } catch {
      setProblem('The preview could not be made. You can still save.');
    }
    setPreviewing(false);
  };

  const save = async () => {
    if (!a) return;
    setPhase('saving');
    setProblem('');
    try {
      const uri = await engine.render(keep);
      const redaction: Redaction = {
        v: 1,
        them: [
          ...gaps.map(([s, e], i) => ({ s: round(s), e: round(e), cap: caps[i]?.trim().slice(0, 140) || undefined })),
          ...a.you.filter((_, i) => muted.has(i)).map(([s, e]) => ({ s: round(s), e: round(e) })),
        ].sort((x, y) => x.s - y.s),
      };
      const ok = await onSave({ kind: 'voice', uri, seconds: take.seconds, wav: true, redaction });
      if (ok) {
        remove(take.uri); // the unredacted original
        onDiscard();
      } else {
        made.current.push(uri);
        setPhase('ready');
      }
    } catch {
      setProblem('The redacted take could not be made. Try again.');
      setPhase('ready');
    }
  };

  const discard = () => {
    if (!keepOnCancel) remove(take.uri);
    onDiscard();
  };
  const dropLabel = keepOnCancel ? 'Back to my takes' : 'Delete this take';

  return (
    <Modal visible animationType="slide" onRequestClose={phase === 'saving' ? () => {} : discard}>
      <View style={[st.screen, { paddingTop: insets.top + 12 }]}>
        {host}
        <ScrollView contentContainerStyle={[st.body, { paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled">
          <T v="h">Your side only</T>
          <T v="sub">
            Nerve keeps your voice and mutes everyone else before anything is saved. It all happens on this {take.uri.startsWith('idb:') || take.uri.startsWith('blob:') ? 'computer' : 'phone'}.
          </T>

          {!profile ? (
            <T v="error">Set up your voice first. It’s in Account, under Your voice.</T>
          ) : phase === 'reading' ? (
            <View style={st.waiting}>
              <Scanning />
              <T v="semi">Finding your voice in {clockText(take.seconds)}…</T>
              <T v="small">Longer takes take longer. Keep Nerve open.</T>
            </View>
          ) : phase === 'error' ? (
            <View style={{ gap: 12 }}>
              <T v="error">{problem}</T>
              <Btn label={dropLabel} kind="primary" onPress={discard} />
            </View>
          ) : a ? (
            <>
              <View style={{ gap: 10 }}>
                <VoiceStrip duration={a.duration} you={a.you} them={a.them} muted={muted} selected={sel} onPick={setSel} />
                <View style={st.legend}>
                  <View style={st.key}>
                    <View style={[st.swatch, { backgroundColor: C.accent }]} />
                    <T v="small" style={{ color: C.ink }}>
                      Your voice, kept: {clockText(keptSec)}
                    </T>
                  </View>
                  <View style={st.key}>
                    <View style={[st.swatch, st.swatchThem]} />
                    <T v="small" style={{ color: C.ink }}>
                      Others, muted: {clockText(a.themSec)}
                    </T>
                  </View>
                </View>
                {a.note ? <T v="small" style={st.note}>{a.note}</T> : null}
                {sel != null && a.you[sel] ? (
                  <View style={st.selRow}>
                    <T v="semi" style={{ flex: 1, fontSize: 16 }}>
                      {clockText(a.you[sel][0])}–{clockText(a.you[sel][1])}
                    </T>
                    <Btn label={muted.has(sel) ? 'Keep this bit' : 'Mute this bit'} small onPress={() => toggle(sel)} />
                  </View>
                ) : a.you.length ? (
                  <T v="small">Tap an orange stretch if it isn’t you, and mute it. Muted voices can’t be turned back on.</T>
                ) : null}
              </View>

              {keptSec < 1 ? (
                <View style={{ gap: 12 }}>
                  <T v="semi">None of your voice was found, so there’s nothing to save.</T>
                  <T v="sub">If it was only you talking, turn off Mute other voices for that take. If it was a conversation, try holding the phone nearer to you.</T>
                  <Btn label={dropLabel} kind="primary" onPress={discard} />
                </View>
              ) : (
                <>
                  {gaps.length ? (
                    <View style={{ gap: 10 }}>
                      <T v="semi">What did they say?</T>
                      <T v="small">Optional. One short line per gap, so your circle can follow. Leave out names.</T>
                      {gaps.slice(0, 12).map(([s0, e0], i) => (
                        <View key={i} style={st.capRow}>
                          <T style={st.capTime}>{clockText(s0)}</T>
                          <TextInput
                            accessibilityLabel={`What they said at ${clockText(s0)}`}
                            value={caps[i] ?? ''}
                            onChangeText={(v) => setCaps((c) => Object.assign([...c], { [i]: v }))}
                            placeholder={`${Math.max(1, Math.round(e0 - s0))} seconds muted`}
                            placeholderTextColor={C.muted}
                            maxLength={140}
                            style={st.cap}
                          />
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={{ gap: 10 }}>
                    {preview ? (
                      <VoicePlayer uri={preview} />
                    ) : (
                      <Btn label={previewing ? 'Making preview…' : 'Listen before saving'} icon="play" disabled={previewing || phase === 'saving'} onPress={makePreview} />
                    )}
                    {problem ? <T v="error">{problem}</T> : null}
                    <Btn label={phase === 'saving' ? 'Saving…' : 'Save my side'} kind="primary" wide disabled={phase === 'saving'} onPress={save} />
                    <Btn label={dropLabel} kind="quiet" wide disabled={phase === 'saving'} onPress={discard} />
                    <T v="small">Saving keeps only your side, private in your log until you post it. The original with their voice is deleted.</T>
                  </View>
                </>
              )}
            </>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

// Moving band while the engine works, so a long take doesn't look stuck.
function Scanning() {
  const [x] = useState(() => new Animated.Value(0));
  const [w, setW] = useState(0);
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(x, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [x]);
  return (
    <View style={[st.track, { height: 44 }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Animated.View style={[st.scan, { transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-0.3 * w, w] }) }] }]} />
    </View>
  );
}

const round = (x: number) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------------------
// Voice setup: read a short passage once. Nerve keeps a description of your
// voice (numbers, not audio) on this device and deletes the recording.

export function VoiceSetup({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { profile } = useVoice();
  const { engine, host } = useRedactEngine();
  const [phase, setPhase] = useState<'idle' | 'recording' | 'reading' | 'done'>('idle');
  const [problem, setProblem] = useState('');

  const rec = useVoiceRecorder(async (r) => {
    setPhase('reading');
    try {
      await engine.load(r.uri);
      const out = await engine.enroll();
      engine.clear();
      if (!out.profile) throw new Error(out.error || 'Nerve could not hear enough of you.');
      await saveVoice(out.profile);
      setPhase('done');
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Nerve could not read that. Try again.');
      setPhase('idle');
    } finally {
      remove(r.uri);
    }
  });

  return (
    <Modal visible animationType="slide" onRequestClose={rec.active ? () => {} : onClose}>
      <View style={[st.screen, { paddingTop: insets.top + 12 }]}>
        {host}
        <ScrollView contentContainerStyle={[st.body, { paddingBottom: insets.bottom + 28 }]}>
          <T v="h">Your voice</T>
          <T v="sub">
            Read this out loud in your normal voice, somewhere quiet. Nerve learns how you sound so it can keep your side of a conversation and mute the other person’s. The recording is deleted straight after; only a description of your voice stays on this device.
          </T>
          <View style={st.passage}>
            <T style={st.passageText}>{PASSAGE}</T>
          </View>

          {phase === 'done' ? (
            <View style={{ gap: 12 }}>
              <T v="semi">Got it. Mute other voices is on for your voice takes.</T>
              <Btn label="Done" kind="primary" wide onPress={onClose} />
            </View>
          ) : rec.active ? (
            <>
              <RecordingBar seconds={rec.seconds} limit={60} onStop={rec.stop} />
              <T v="small">Stop when you reach the end.</T>
            </>
          ) : phase === 'reading' ? (
            <T v="semi">Learning your voice…</T>
          ) : (
            <View style={{ gap: 10 }}>
              {problem ? <T v="error">{problem}</T> : null}
              <Btn
                label={profile ? 'Read it again' : 'Start reading'}
                kind="primary"
                icon="mic"
                wide
                onPress={async () => {
                  setProblem('');
                  const p = await rec.start();
                  if (p) setProblem(p);
                }}
              />
              <Btn label="Not now" kind="quiet" wide onPress={onClose} />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// The switch that sits under the record buttons.

export function MuteOthersRow({ onSetup }: { onSetup: () => void }) {
  const { profile, muteOthers } = useVoice();
  if (profile === undefined) return null;
  if (!profile) {
    return (
      <Pressable accessibilityRole="button" onPress={onSetup} style={st.row}>
        <View style={{ flex: 1 }}>
          <T v="semi" style={{ fontSize: 16 }}>
            Mute other voices
          </T>
          <T v="small">Keep your side of the conversation, mute theirs. Takes 30 seconds to set up.</T>
        </View>
        <T style={st.link}>Set up</T>
      </Pressable>
    );
  }
  return (
    <View style={st.row}>
      <View style={{ flex: 1 }}>
        <T v="semi" style={{ fontSize: 16 }}>
          Mute other voices
        </T>
        <T v="small">{muteOthers ? 'On. You review your side before it saves.' : 'Off. Turn it on when someone else is in the take.'}</T>
      </View>
      <Switch
        value={muteOthers}
        onValueChange={(v) => setMuteOthers(v)}
        trackColor={{ true: C.accent, false: C.line }}
        thumbColor={C.surface}
        accessibilityLabel="Mute other voices"
      />
    </View>
  );
}

// For the Account sheet.
export function VoiceSettings({ onSetup }: { onSetup: () => void }) {
  const { profile } = useVoice();
  return (
    <View style={{ gap: 8 }}>
      <T v="small">
        {profile
          ? `Set up on this device. Nerve uses it to keep your side of a take and mute other people. It’s a description of your voice, not a recording, and it never leaves this device.`
          : 'Not set up on this device. Set it up to mute other people in your voice takes.'}
      </T>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Btn label={profile ? 'Set up again' : 'Set up your voice'} small onPress={onSetup} />
        {profile ? <Btn label="Forget my voice" kind="quiet" small onPress={() => forgetVoice()} /> : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { padding: 16, gap: 18 },
  track: { width: '100%', borderRadius: 6, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.surface, overflow: 'hidden' },
  them: { position: 'absolute', top: 0, bottom: 0, backgroundColor: C.bgDeep, borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.line },
  you: { position: 'absolute', top: 6, bottom: 6, borderRadius: 2, backgroundColor: C.accent },
  youMuted: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.muted },
  youSel: { top: 2, bottom: 2, borderWidth: 2, borderColor: C.ink },
  head: { position: 'absolute', top: 0, bottom: 0, width: 2, marginLeft: -1, backgroundColor: C.ink },
  scan: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', backgroundColor: C.accentSoft },
  waiting: { gap: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 14, height: 14, borderRadius: 2 },
  swatchThem: { backgroundColor: C.bgDeep, borderWidth: 1, borderColor: C.muted, borderStyle: 'dashed' },
  note: { padding: 10, borderRadius: 8, backgroundColor: C.accentSoft, color: C.ink, fontFamily: F.medium },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  capRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  capTime: { fontFamily: F.semi, fontSize: 15, color: C.muted, minWidth: 42 },
  cap: { flex: 1, minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, fontFamily: F.body, fontSize: 16, color: C.ink },
  passage: { padding: 16, borderLeftWidth: 4, borderLeftColor: C.accent, backgroundColor: C.surface, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  passageText: { fontFamily: F.medium, fontSize: 20, lineHeight: 30, color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  link: { fontFamily: F.semi, fontSize: 16, color: C.accentText },
});
