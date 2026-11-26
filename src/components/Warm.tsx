import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { clockText, useNerve, type WarmKind } from '../data';
import { GUIDE } from '../guides';
import { BY } from '../moves';
import { REACTIONS } from '../reactions';
import { C, F } from '../theme';
import { Btn, Sheet, T } from '../ui';
import { Emo } from './ArtIcon';
import { useVoiceRecorder } from './Recorders';

// Warm-ups: a small daily action that takes no courage, so the streak survives a day at home.
const PROMPTS = [
  'Think of one moment today when you held back from saying something. What would you say next time?',
  'Who did you talk to today, even for a second? How did it feel?',
  'What’s your next move, and what’s the first sentence you’ll say?',
  'When were you most at ease around people this week? What was different?',
  'What’s the worst that could realistically happen on your next move? And then what?',
  'Who do you want to be braver around? What’s one small thing you could say to them?',
];
const KINDS: { k: WarmKind; t: string; d: string }[] = [
  { k: 'plan', t: 'Plan your move', d: 'Pick when and where. Say the line out loud.' },
  { k: 'reflect', t: '60-second reflection', d: 'Answer one question, out loud or typed.' },
  { k: 'back', t: 'Back someone', d: 'React to a friend’s attempt.' },
];
const WHEN = ['Before work', 'At lunch', 'After work', 'Tonight'];
const REFLECT_SECONDS = 60;

// The line under the branch card: a plan, a done note, or the ask.
export function WarmCard({ onDone }: { onDone: (msg: string) => void }) {
  const n = useNerve();
  const [open, setOpen] = useState(false);
  const plan = n.plan;
  const streak = n.streak;
  return (
    <View style={s.card}>
      {plan && !n.movedToday ? (
        <T>
          <T v="semi">Your plan: </T>
          {`${plan.when}${plan.where ? `, ${plan.where}` : ''}.`}
        </T>
      ) : null}
      {n.movedToday ? (
        <T v="sub">{`Move done today. ${streak > 1 ? `${streak}-day streak.` : 'Streak started.'}`}</T>
      ) : n.warmToday ? (
        <T v="sub">{`Warm-up done. Your streak is safe today${streak > 1 ? ` at ${streak} days.` : '.'}`}</T>
      ) : (
        <View style={s.ask}>
          <T style={{ flex: 1, fontSize: 16, lineHeight: 22 }}>
            <T v="semi" style={{ fontSize: 16 }}>
              Not going out today?
            </T>{' '}
            A one-minute warm-up keeps your streak.
          </T>
          <Btn label="Warm up" small onPress={() => setOpen(true)} />
        </View>
      )}
      <WarmSheet
        visible={open}
        onClose={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          onDone('Warm-up done. Streak safe.');
        }}
      />
    </View>
  );
}

function WarmSheet({ visible, onClose, onDone }: { visible: boolean; onClose: () => void; onDone: () => void }) {
  const n = useNerve();
  const back = n.lineToBack;
  const [kind, setKind] = useState<WarmKind>('plan');
  const k = kind === 'back' && !back ? 'plan' : kind;
  const finish = (w: WarmKind, extra = {}) => {
    n.saveWarm(w, extra);
    onDone();
  };
  return (
    <Sheet visible={visible} title="Warm-up" onClose={onClose}>
      <T v="sub">About a minute, no going out. A warm-up keeps your streak for up to two days in a row.</T>
      <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
        {KINDS.filter((o) => o.k !== 'back' || back).map((o) => (
          <Pressable key={o.k} accessibilityRole="radio" accessibilityState={{ checked: o.k === k }} onPress={() => setKind(o.k)} style={[s.pick, o.k === k && s.pickOn]}>
            <T v="semi">{o.t}</T>
            <T v="small">{o.d}</T>
          </Pressable>
        ))}
      </View>
      {visible && k === 'plan' ? <PlanPanel onSave={(move) => finish('plan', { move })} /> : null}
      {visible && k === 'reflect' ? <ReflectPanel onSave={(extra) => finish('reflect', extra)} /> : null}
      {visible && k === 'back' && back ? (
        <View style={{ gap: 10 }}>
          <View style={s.quote}>
            <T v="semi">
              {n.nameOf(back.author)}
              {BY[back.move] ? ` did ${BY[back.move].title.charAt(0).toLowerCase()}${BY[back.move].title.slice(1)}` : ''}
            </T>
            {back.line ? <T style={{ fontStyle: 'italic' }}>{`“${back.line}”`}</T> : null}
          </View>
          <T v="semi">Back them up</T>
          <View style={s.reacts}>
            {REACTIONS.map((r) => (
              <Pressable
                key={r.k}
                accessibilityRole="button"
                onPress={async () => {
                  const err = await n.react(back.id, r.k);
                  if (!err) finish('back', { line: back.id });
                }}
                style={({ pressed }) => [s.react, pressed && { opacity: 0.8 }]}>
                <Emo e={r.e} size={30} />
                <T v="small" style={{ color: C.ink }}>
                  {r.t}
                </T>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

function PlanPanel({ onSave }: { onSave: (move: string) => void }) {
  const n = useNerve();
  const m = n.tonight.move;
  const say = GUIDE[m.id]?.say;
  const [when, setWhen] = useState(n.plan?.when ?? '');
  const [where, setWhere] = useState(n.plan?.where ?? '');
  const [said, setSaid] = useState(0);
  return (
    <View style={{ gap: 10 }}>
      <View style={s.quote}>
        <T v="small">Your next move</T>
        <T v="semi" style={{ fontSize: 18 }}>
          {m.title}
        </T>
        <T v="small">{m.doIt}</T>
      </View>
      <T v="semi">When will you do it?</T>
      <View style={s.whenRow} accessibilityRole="radiogroup" accessibilityLabel="When">
        {WHEN.map((t) => (
          <Pressable key={t} accessibilityRole="radio" accessibilityState={{ checked: when === t }} onPress={() => setWhen(t)} style={[s.when, when === t && s.whenOn]}>
            <T v="semi" style={{ fontSize: 15, color: when === t ? C.accentInk : C.ink }}>
              {t}
            </T>
          </Pressable>
        ))}
      </View>
      <T v="semi">
        Where? <T v="small">Optional</T>
      </T>
      <TextInput value={where} onChangeText={setWhere} maxLength={60} placeholder="The coffee shop near work" placeholderTextColor={C.muted} style={s.field} accessibilityLabel="Where" />
      {say ? (
        <>
          <T v="semi">Say the line out loud, three times</T>
          <T style={s.say}>{say}</T>
          <Btn label={said >= 3 ? 'Said it three times' : `I said it: ${said} of 3`} small onPress={() => setSaid((x) => Math.min(3, x + 1))} />
        </>
      ) : null}
      <Btn
        label="Save my plan"
        kind="primary"
        wide
        disabled={!when}
        onPress={() => {
          n.savePlan({ move: m.id, when, where: where.trim() });
          onSave(m.id);
        }}
      />
    </View>
  );
}

function ReflectPanel({ onSave }: { onSave: (extra: { prompt: string; text: string; voice: boolean }) => void }) {
  const [prompt] = useState(() => PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length]);
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(false);
  const [note, setNote] = useState('');
  // The recording stays on this phone: nothing is uploaded.
  const rec = useVoiceRecorder(() => {
    setVoice(true);
    setNote('Recorded. It stays on this phone.');
  });
  const { active, seconds, stop } = rec;
  useEffect(() => {
    if (active && seconds >= REFLECT_SECONDS) stop();
  }, [active, seconds, stop]);
  return (
    <View style={{ gap: 10 }}>
      <T style={s.say}>{prompt}</T>
      <Btn
        label={active ? `Stop (${clockText(Math.max(0, REFLECT_SECONDS - seconds))} left)` : voice ? 'Record again' : 'Record 60 seconds'}
        icon={active ? 'stop' : 'mic'}
        kind={active ? 'dark' : 'outline'}
        disabled={rec.opening}
        onPress={async () => {
          if (active) return stop();
          setNote('');
          const err = await rec.start();
          if (err) setNote(`${err} Type your answer instead.`);
        }}
      />
      {note ? <T v="small">{note}</T> : null}
      <TextInput value={text} onChangeText={setText} maxLength={500} multiline placeholder="Or type it here" placeholderTextColor={C.muted} style={[s.field, { minHeight: 84, textAlignVertical: 'top' }]} accessibilityLabel="Your answer" />
      <T v="small">Only you can see this.</T>
      <Btn label="Save reflection" kind="primary" wide disabled={active || (text.trim().length < 3 && !voice)} onPress={() => onSave({ prompt, text: text.trim().slice(0, 500), voice })} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pick: { gap: 2, padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: C.line },
  pickOn: { borderColor: C.ink, borderWidth: 2.5, backgroundColor: C.accentSoft },
  quote: { gap: 2, padding: 12, borderRadius: 8, backgroundColor: C.bg },
  whenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  when: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1.5, borderColor: C.ink },
  whenOn: { backgroundColor: C.accent },
  field: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.surface, fontFamily: F.body, fontSize: 16, color: C.ink },
  say: { fontFamily: F.semi, fontSize: 19, lineHeight: 26, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: C.accent },
  reacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  react: { width: '30%', flexGrow: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.line },
});
