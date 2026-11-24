import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExampleCard } from '../components/Example';
import { RemoteMedia } from '../components/Media';
import { HandsFreePanel, useHandsFree } from '../components/HandsFree';
import { ON_WEB } from '../platform';
import { MOUNTAINS, countsFor } from '../mountains';
import { useRope } from '../rope';
import { RecordingBar, useVoiceRecorder, VideoRecorder } from '../components/Recorders';
import { MAX_AUDIO_SECONDS } from '../config';
import { clockText, stamp, useNerve, type Line, type Recording } from '../data';
import { GUIDE } from '../guides';
import { MentorLine, MENTOR } from '../components/Mentor';
import { parseMoveKey } from '../placePaths';
import { BRANCH, CAP_REACTS, isPath, label, lvWord, unlocked } from '../moves';
import { HUE, PLACE_HUE, QUEST_BONUS, dayNum, moveXp, todaysQuest } from '../progress';
import { PLACES } from '../rpgData';
import { useStage } from '../stage';
import { REACT } from '../reactions';
import { FEARED, NERVE_WORDS, WENT, addReflection, analyse, freshFlow, loadFlow, myReflections, saveFlow, type Flow, type Reflection, type Step } from '../reflect';
import { C, F } from '../theme';
import { Btn, ConfirmLink, Fold, Icon, Pill, Seg, T } from '../ui';

type Props = { moveId: string; onClose: () => void; onPosted: () => void };

export function MoveScreen({ moveId, onClose, onPosted }: Props) {
  const n = useNerve();
  const insets = useSafeAreaInsets();
  const { move, via } = useMemo(() => parseMoveKey(moveId), [moveId]);

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

  const locked = !unlocked(move, n.count, n.progress.open, n.progress.level, n.test);
  const pathShut = isPath(move.b) && !n.progress.open[move.b];
  const pend = n.progress.pending[move.id];
  const bk = move.b === 'x' || move.b === 'z' ? 'c' : move.b;
  const [questDay] = useState(() => dayNum(Date.now()));
  const isToday = move.b === 'z' && move.id === todaysQuest().id;
  const note = move.b === 'x'
    ? locked
      ? `Locked. ${PLACES[move.place ?? 0].name} opens at Level ${PLACES[move.place ?? 0].lv}. You are Level ${n.progress.level}.`
      : ''
    : move.b === 'z'
      ? isToday
        ? n.progress.questDays[questDay]
          ? 'Today’s side quest is done. Bonus earned.'
          : `Today’s side quest. Log it before midnight for +${QUEST_BONUS} bonus XP.`
        : 'Not today’s side quest. You can still do it, but the bonus only counts on its own day.'
    : move.retired
    ? 'This move was taken out of the levels. Lines already posted on it stay, but new ones go on the current moves.'
    : pathShut
    ? `Locked. This move is on the ${BRANCH[bk].name} path. The You tab shows what opens it.`
    : locked
      ? `Locked. Do every ${BRANCH[bk].name} ${lvWord(bk)} ${move.lv - 1} move to open ${move.cap ? 'the capstone' : `${lvWord(bk)} ${move.lv}`}.`
      : !move.cap
        ? ''
        : n.count[move.id]
          ? `Capstone done. You summited the ${BRANCH[bk].name} path.`
          : pend?.posted
            ? `Posted. ${pend.reacts} of ${CAP_REACTS} reactions so far. It counts at ${CAP_REACTS}.`
            : pend
              ? `Saved. Now post it to the feed. It counts once ${CAP_REACTS} people react.`
              : `This is the capstone. It counts once your line is posted to the feed and ${CAP_REACTS} people react.`;
  const { dropLine } = n;
  const off = locked || !!move.retired;

  // The two steps: do it (with how nervous you are first), then after (how it went).
  const [flow, setFlowState] = useState<Flow>(() => freshFlow(0));
  const [history, setHistory] = useState<Reflection[]>([]);
  const [result, setResult] = useState<Reflection | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const flowKey = `${moveId}:${version}`;
  useEffect(() => {
    let live = true;
    loadFlow(flowKey).then((f) => {
      if (live) setFlowState(f ?? freshFlow(0));
    });
    return () => {
      live = false;
    };
  }, [flowKey]);
  useEffect(() => {
    let live = true;
    myReflections().then((list) => {
      if (live) setHistory(list);
    });
    return () => {
      live = false;
    };
  }, []);
  const setFlow = (patch: Partial<Flow>) => {
    setFlowState((prev) => {
      const next = { ...prev, ...patch };
      saveFlow(flowKey, next);
      return next;
    });
  };
  const goStep = (step: Step) => {
    setFlow({ step });
    scroller.current?.scrollTo({ y: 0, animated: true });
  };
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // Every finished recording is saved straight to your log as a private take.
  const saveTake = useCallback(
    async (take: Recording): Promise<boolean> => {
      setError('');
      setSaved('');
      if (locked) {
        setError('This move is locked for now, so the take was not saved.');
        return false;
      }
      setSaving(true);
      const problem = await dropLine({ move: move.id, line: '', upgrade: version === 'up', recording: take, posted: false, via });
      setSaving(false);
      if (problem) {
        setFailed(take);
        setError(problem);
        return false;
      }
      setFailed(null);
      setSaved(`${take.kind === 'voice' ? 'Voice note' : 'Video'} saved to your log. Only you can see it until you post it.`);
      return true;
    },
    [dropLine, locked, move.id, version, via],
  );
  const voice = useVoiceRecorder(saveTake);
  const handsFree = useHandsFree(saveTake);

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
      setError('Write one line about what happened.');
      return;
    }
    setBusy(true);
    const problem = await n.dropLine({ move: move.id, line, upgrade: version === 'up', recording: null, via });
    if (problem) {
      setBusy(false);
      setError(problem);
      return;
    }
    // The line is in. The reflection is a bonus: if it fails to save, still show this time's result.
    const saved = await addReflection(move.id, version === 'up', flow);
    const r: Reflection = saved ?? {
      id: 'local',
      move: move.id,
      upgrade: version === 'up',
      nerve_before: flow.before || null,
      nerve_after: flow.after || null,
      went: flow.went || null,
      fear: flow.fear.trim() || null,
      feared: flow.fear.trim() && flow.feared ? flow.feared : null,
      created_at: new Date().toISOString(),
    };
    setBusy(false);
    saveFlow(flowKey, null);
    setText('');
    setResult(r);
    setHistory((h) => [...h, r]);
    setFlowState(freshFlow(0));
    scroller.current?.scrollTo({ y: 0, animated: false });
  };

  const fear = flow.fear.trim();
  const guide = GUIDE[move.id] && !via ? GUIDE[move.id] : null;
  const hasExample = !move.retired;
  const how = guide ? (
    <View style={{ gap: 14 }}>
      {MENTOR[move.b as 'a'] ? <MentorLine b={move.b as 'a'} text={guide.why} /> : null}
      <View style={s.part}>
        {guide.steps.map((step, i) => (
          <View key={i} style={s.step}>
            <T style={s.stepNum}>{i + 1}.</T>
            <T style={{ flex: 1 }}>{step}</T>
          </View>
        ))}
      </View>
      {MENTOR[move.b as 'a'] ? null : (
        <View style={s.part}>
          <T v="eyebrow">Why it works</T>
          <T>{guide.why}</T>
        </View>
      )}
      <View style={s.part}>
        <T v="eyebrow">Watch out for</T>
        <T>{guide.watch}</T>
      </View>
    </View>
  ) : null;
  const folds = (
    <>
      {how ? <Fold title="How to do it" open={!!open.how} onToggle={() => toggle('how')}>{how}</Fold> : null}
      {hasExample ? (
        <Fold title="Watch an example" open={!!open.ex} onToggle={() => toggle('ex')}>
          <ExampleCard move={move} />
        </Fold>
      ) : null}
    </>
  );

  return (
    <View style={s.screen}>
      <View style={[s.bar, { paddingTop: insets.top + 6 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onClose} hitSlop={8} style={s.back}>
          <Icon name="back" />
        </Pressable>
        <T v="semi" style={{ fontSize: 16 }}>
          {move.b === 'x' || move.b === 'z'
            ? label(move)
            : `${BRANCH[bk].name}, ${move.retired ? 'Retired' : move.cap ? 'Capstone' : `${lvWord(bk)} ${move.lv}, ${move.i} of ${move.of}`}`}
        </T>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView ref={scroller} contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          <View style={s.section}>
            <T v="accent" style={{ color: move.b === 'x' ? PLACE_HUE[PLACES[move.place ?? 0].id][0] : move.b === 'z' ? C.accentText : HUE[bk][0] }}>
              {label(move)}
              {via ? `, ${BRANCH[via].name} version` : ''}
              {move.retired ? '' : `, +${moveXp(move)} XP`}
            </T>
            <T v="big">{move.title}</T>
            {note ? (
              <View style={s.lock}>
                <T v="semi" style={{ fontSize: 16, lineHeight: 22 }}>
                  {note}
                </T>
              </View>
            ) : null}
            {result ? null : (
              <>
                <Seg
                  value={version}
                  onChange={setVersion}
                  options={[
                    { key: 'base', label: 'The move' },
                    { key: 'up', label: 'Upgrade' },
                  ]}
                />
                <T style={{ fontSize: 20, lineHeight: 27 }}>{version === 'up' ? move.up : move.doIt}</T>
                {version !== 'up' ? <CountsFor id={move.id} /> : null}
              </>
            )}
          </View>

          {result ? (
            <ResultCard
              r={result}
              history={history}
              xp={moveXp(move)}
              hasUpgrade={!!move.up}
              onUpgrade={() => {
                setResult(null);
                setVersion('up');
                scroller.current?.scrollTo({ y: 0, animated: false });
              }}
              onFeed={onPosted}
              onDone={onClose}
            />
          ) : off ? (
            folds
          ) : (
            <>
              <View style={s.steps} accessibilityRole="tablist">
                {(['do', 'after'] as Step[]).map((k, i) => {
                  const cur = flow.step === k;
                  const past = k === 'do' && flow.step === 'after';
                  return (
                    <Pressable
                      key={k}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: cur }}
                      onPress={() => goStep(k)}
                      style={[s.stepTab, cur && s.stepTabOn]}>
                      <View style={[s.stepDot, past && s.stepDotPast]}>
                        <T style={[s.stepDotText, past && { color: C.surface }]}>{i + 1}</T>
                      </View>
                      <T v="semi" style={{ fontSize: 16, color: cur || past ? C.ink : C.muted }}>
                        {k === 'do' ? 'Do it' : 'After'}
                      </T>
                    </Pressable>
                  );
                })}
              </View>

              {flow.step === 'do' ? (
                <View style={s.card}>
                  <T v="semi" style={{ fontSize: 16, lineHeight: 22 }}>
                    {version === 'up' ? 'Upgrade: same move, one notch harder.' : `Done when: ${move.rep.charAt(0).toLowerCase()}${move.rep.slice(1)}`}
                  </T>
                  {guide?.say ? (
                    <View style={{ gap: 4 }}>
                      <T v="small" style={s.resK}>
                        What to say
                      </T>
                      <View style={s.say}>
                        <T v="semi" style={{ fontSize: 19, lineHeight: 26 }}>
                          {guide.say}
                        </T>
                      </View>
                    </View>
                  ) : null}
                  <T v="semi" style={s.q}>How nervous are you right now?</T>
                  <Scale value={flow.before} onPick={(v) => setFlow({ before: v })} />
                  <T v="semi" style={s.q}>
                    What do you think will happen? <T v="small">Optional</T>
                  </T>
                  <TextInput
                    accessibilityLabel="What do you think will happen?"
                    value={flow.fear}
                    onChangeText={(v) => setFlow({ fear: v })}
                    placeholder="They’ll think I’m weird"
                    placeholderTextColor={C.muted}
                    maxLength={120}
                    style={s.field}
                  />

                  {handsFree.on ? (
                    <HandsFreePanel hf={handsFree} />
                  ) : voice.active ? (
                    <RecordingBar seconds={voice.seconds} limit={MAX_AUDIO_SECONDS} mic={ON_WEB ? undefined : voice.mic} onStop={voice.stop} />
                  ) : saving ? (
                    <View style={s.status}>
                      <T v="semi" style={{ fontSize: 16 }}>
                        Saving your take…
                      </T>
                    </View>
                  ) : (
                    <View style={{ gap: 10, marginTop: 4 }}>
                      <T v="semi" style={s.q}>
                        Record it <T v="small">Optional</T>
                      </T>
                      <View style={{ gap: 10 }}>
                        <View style={s.recRow}>
                          <Btn
                            label={voice.opening ? 'Getting the mic ready…' : 'Record audio'}
                            icon="mic"
                            disabled={voice.opening}
                            style={{ flex: 1, paddingHorizontal: 10 }}
                            onPress={async () => {
                              setError('');
                              setSaved('');
                              const problem = await voice.start();
                              if (problem) setError(problem);
                            }}
                          />
                          {ON_WEB ? null : (
                            <Btn
                              label="Record video"
                              icon="cam"
                              style={{ flex: 1, paddingHorizontal: 10 }}
                              onPress={() => {
                                setError('');
                                setSaved('');
                                setCamera(true);
                              }}
                            />
                          )}
                        </View>
                        {!ON_WEB ? (
                          <Btn
                            label="Hands-free: say start and stop"
                            icon="mic"
                            kind="quiet"
                            onPress={() => {
                              setError('');
                              setSaved('');
                              handsFree.turnOn();
                            }}
                          />
                        ) : null}
                        <T v="small">{ON_WEB ? 'Takes save privately to your log. Video and hands-free are in the Android app.' : 'Takes save privately to your log. Film yourself, not them.'}</T>
                      </View>
                    </View>
                  )}
                  {handsFree.error ? <T v="error">{handsFree.error}</T> : null}
                  {saved ? (
                    <View style={s.saved}>
                      <T v="semi" style={{ fontSize: 15, lineHeight: 21, color: C.accentText }}>
                        {saved}
                      </T>
                    </View>
                  ) : null}
                  {failed && !saving ? (
                    <View style={s.recRow}>
                      <Btn label="Try saving again" kind="primary" small onPress={() => saveTake(failed)} />
                      <Btn label="Discard" kind="quiet" small onPress={() => { setFailed(null); setError(''); }} />
                    </View>
                  ) : null}
                  {error ? <T v="error">{error}</T> : null}

                  <Btn label="I did it" kind="primary" wide disabled={voice.active || saving} onPress={() => goStep('after')} />
                  <T v="small" style={{ textAlign: 'center' }}>
                    Go do it, then come back. Your answers stay here.
                  </T>
                  <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8} style={{ alignSelf: 'center', padding: 6 }}>
                    <T style={{ color: C.muted, textDecorationLine: 'underline' }}>Not today</T>
                  </Pressable>
                  {folds}
                </View>
              ) : (
                <View style={s.card}>
                  <T v="semi" style={s.q}>How did it go?</T>
                  <Choice options={WENT} value={flow.went} onPick={(v) => setFlow({ went: v })} />
                  <T v="semi" style={s.q}>How nervous were you, really?</T>
                  <Scale value={flow.after} onPick={(v) => setFlow({ after: v })} />
                  {fear ? (
                    <>
                      <T v="semi" style={s.q}>{`You expected “${fear}”. Did it happen?`}</T>
                      <Choice options={FEARED} value={flow.feared} onPick={(v) => setFlow({ feared: v })} />
                    </>
                  ) : null}
                  <T v="semi" style={s.q}>What happened? One line.</T>
                  <TextInput
                    accessibilityLabel="What happened? One line."
                    value={text}
                    onChangeText={setText}
                    placeholder="Said hi to six people. Two smiled back."
                    placeholderTextColor={C.muted}
                    multiline
                    maxLength={400}
                    textAlignVertical="top"
                    style={s.area}
                  />
                  {error ? <T v="error">{error}</T> : null}
                  <Btn label={busy ? 'Posting…' : 'Post what happened'} kind="primary" wide disabled={busy || locked} onPress={drop} />
                </View>
              )}
            </>
          )}

          <View>
            <Fold title="Do it with a friend" open={!!open.together} onToggle={() => toggle('together')} rule>
              {n.circle.length === 0 ? (
                <T v="sub">Nobody in your circle yet. Anyone who installs Nerve and signs in shows up here.</T>
              ) : (
                <View style={{ gap: 10 }}>
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
                      ? `Posted today: ${doneToday.map(n.nameOf).join(', ')}.`
                      : partners.length
                        ? 'Same window, until midnight. A line each is enough.'
                        : 'Tap a name to challenge them. Same window, until midnight.'}
                  </T>
                </View>
              )}
            </Fold>
            {/* Your log: the latest entry shows, the rest open with one tap. */}
            <View style={s.logWrap}>
              <View style={s.logTop}>
                <T v="semi" style={{ fontSize: 17, flex: 1 }}>
                  Your log
                </T>
                <T v="semi">{mineHere.length}</T>
              </View>
              {mineHere.length === 0 ? (
                <T v="sub">Nothing here yet. Your first take or line starts the log.</T>
              ) : (
                <View style={{ gap: 10 }}>
                  {(open.log ? mineHere : mineHere.slice(0, 1)).map((x) => (
                    <LogItem key={x.id} line={x} reflection={reflectionFor(x, history)} onError={setError} />
                  ))}
                  {mineHere.length > 1 ? (
                    <Pressable accessibilityRole="button" accessibilityState={{ expanded: !!open.log }} onPress={() => toggle('log')} hitSlop={8} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
                      <T style={{ fontFamily: F.semi, fontSize: 15, color: C.ink, textDecorationLine: 'underline' }}>
                        {open.log ? 'Show only the latest' : `Show ${mineHere.length - 1} more`}
                      </T>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
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

function Scale({ value, onPick }: { value: number; onPick: (v: number) => void }) {
  return (
    <View style={s.scale} accessibilityRole="radiogroup">
      {NERVE_WORDS.map((w, i) => {
        const v = i + 1;
        const on = value === v;
        return (
          <Pressable key={v} accessibilityRole="radio" accessibilityLabel={`${v}, ${w}`} accessibilityState={{ checked: on }} onPress={() => onPick(v)} style={[s.scaleBtn, on && s.on]}>
            <T style={[s.scaleNum, on && { color: C.surface }]}>{v}</T>
            <T style={[s.scaleWord, on && { color: C.surface }]}>{i === 0 || i === 4 ? w : ' '}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

function Choice<K extends string>({ options, value, onPick }: { options: [K, string][]; value: K | ''; onPick: (v: K) => void }) {
  return (
    <View style={s.choice} accessibilityRole="radiogroup">
      {options.map(([k, text]) => {
        const on = value === k;
        return (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onPick(k)} style={[s.choiceBtn, on && s.on]}>
            <T v="semi" style={{ fontSize: 16, color: on ? C.surface : C.ink }}>
              {text}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

// What you get after posting: nerves before and during, the fear against what happened, your pattern, what next.
function ResultCard({ r, history, xp, hasUpgrade, onUpgrade, onFeed, onDone }: { r: Reflection; history: Reflection[]; xp: number; hasUpgrade: boolean; onUpgrade: () => void; onFeed: () => void; onDone: () => void }) {
  const a = analyse(r, history, hasUpgrade);
  // What this move just opened. Said once: it is marked as seen when you leave the result.
  const { news, markNewsSeen } = useStage();
  const [said, setSaid] = useState('');
  if (news && news !== said) setSaid(news);
  useEffect(() => () => markNewsSeen(), [markNewsSeen]);
  return (
    <View style={[s.card, s.result]}>
      <T v="accent">{`Posted, +${xp} XP`}</T>
      {a.nerves ? (
        <View style={s.resPart}>
          <T style={s.resBig}>{`Nerves ${a.nerves.b} → ${a.nerves.a}`}</T>
          <View style={s.bars} accessible={false}>
            <View style={s.barCol}>
              <View style={[s.bar1, { height: a.nerves.b * 18 }]} />
              <T v="small">Before</T>
            </View>
            <View style={s.barCol}>
              <View style={[s.bar1, s.barNow, { height: a.nerves.a * 18 }]} />
              <T v="small">During</T>
            </View>
          </View>
          <T>{a.nerves.text}</T>
        </View>
      ) : (
        <T style={s.resBig}>Done.</T>
      )}
      {a.fear ? (
        <View style={[s.resPart, s.resRule]}>
          <T v="small" style={s.resK}>You expected</T>
          <T v="semi" style={{ fontSize: 18, lineHeight: 24 }}>{`“${a.fear.said}”`}</T>
          <T>{a.fear.text}</T>
        </View>
      ) : null}
      {a.pattern ? (
        <View style={[s.resPart, s.resRule]}>
          <T v="small" style={s.resK}>Your pattern</T>
          <T>{a.pattern}</T>
        </View>
      ) : null}
      {a.last ? (
        <View style={[s.resPart, s.resRule]}>
          <T v="small" style={s.resK}>Last time on this move</T>
          <T>{a.last}</T>
        </View>
      ) : null}
      {said ? (
        <View style={[s.resPart, s.resRule]}>
          <T v="small" style={s.resK}>New for you</T>
          <T>{said}</T>
        </View>
      ) : null}
      <View style={[s.resPart, s.resRule]}>
        <T v="small" style={s.resK}>Next</T>
        <T>{a.next}</T>
        <View style={{ gap: 8, marginTop: 6 }}>
          {a.upgrade ? <Btn label="Try the upgrade" kind="primary" wide onPress={onUpgrade} /> : null}
          <Btn label="See it on the feed" kind={a.upgrade ? 'outline' : 'primary'} wide onPress={onFeed} />
          <Btn label="Done" kind="quiet" wide onPress={onDone} />
        </View>
      </View>
    </View>
  );
}

// One entry in your log. Private takes can be played back and posted with an optional caption.
// The reflection saved with a line: same move, within a few minutes of it.
function reflectionFor(line: Line, history: Reflection[]): Reflection | null {
  const at = new Date(line.created_at).getTime();
  let best: Reflection | null = null;
  let gap = 10 * 60000;
  for (const r of history) {
    if (r.move !== line.move) continue;
    const d = Math.abs(new Date(r.created_at).getTime() - at);
    if (d <= gap) {
      gap = d;
      best = r;
    }
  }
  return best;
}

const WENT_WORD = { well: 'Went well', mixed: 'Mixed', rough: 'Rough' };
const FEARED_WORD = { no: 'It didn’t happen.', partly: 'It partly happened.', yes: 'It happened, and you still did it.' };

function LogItem({ line, reflection, onError }: { line: Line; reflection: Reflection | null; onError: (message: string) => void }) {
  const n = useNerve();
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const isPrivate = line.posted === false;
  const kind = line.media_kind === 'voice' ? 'Voice note' : line.media_kind === 'video' ? 'Video' : '';
  const kudos = n.kudosFor(line.id);
  const comments = n.commentsFor(line.id);
  const counts: Record<string, number> = {};
  for (const k of kudos) counts[k.kind] = (counts[k.kind] ?? 0) + 1;
  const r = reflection;
  const hasDetail = !!r || !isPrivate;
  const summary = [r?.nerve_before && r?.nerve_after ? `Nerves ${r.nerve_before} → ${r.nerve_after}` : '', kudos.length ? `${kudos.length} ${kudos.length === 1 ? 'reaction' : 'reactions'}` : '', comments.length ? `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}` : '']
    .filter(Boolean)
    .join(', ');
  return (
    <View style={s.logItem}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${stamp(line.created_at)}. ${line.line || kind}. ${open ? 'Hide details' : 'Show details'}`}
        disabled={!hasDetail}
        onPress={() => setOpen((o) => !o)}
        style={{ gap: 8 }}>
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
        {hasDetail ? (
          <View style={s.logMore}>
            <T v="small" style={{ flex: 1 }}>{open ? 'Hide details' : summary || 'Details'}</T>
            <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}>
              <Icon name="chevron" size={16} color={C.muted} />
            </View>
          </View>
        ) : null}
      </Pressable>
      {open ? (
        <View style={s.logDetail}>
          {r ? (
            <View style={{ gap: 4 }}>
              <T v="small" style={{ fontFamily: F.semi }}>How it went</T>
              <T>
                {[r.went ? WENT_WORD[r.went] : '', r.nerve_before && r.nerve_after ? `nerves ${r.nerve_before} before, ${r.nerve_after} during` : r.nerve_before ? `nerves ${r.nerve_before} before` : '']
                  .filter(Boolean)
                  .join(', ')
                  .replace(/^n/, 'N') || 'Logged'}
              </T>
              {r.fear ? <T v="sub">{`You expected “${r.fear}”.${r.feared ? ` ${FEARED_WORD[r.feared]}` : ''}`}</T> : null}
            </View>
          ) : (
            <T v="small">No reflection saved with this one.</T>
          )}
          {isPrivate ? null : (
            <View style={{ gap: 6 }}>
              <T v="small" style={{ fontFamily: F.semi }}>On the feed</T>
              {kudos.length ? (
                <T>{Object.entries(counts).map(([k, c]) => `${REACT[k]?.e ?? ''} ${c}`).join('   ')}</T>
              ) : (
                <T v="sub">No reactions yet.</T>
              )}
              {comments.map((c) => (
                <T key={c.id} style={{ fontSize: 15, lineHeight: 21 }}>
                  <T v="semi" style={{ fontSize: 15 }}>{n.nameOf(c.author)}</T> {c.body}
                </T>
              ))}
            </View>
          )}
        </View>
      ) : null}
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
  lock: { padding: 12, borderRadius: 8, backgroundColor: C.accentSoft },
  guide: { gap: 14, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  part: { gap: 4 },
  step: { flexDirection: 'row', gap: 8 },
  stepNum: { fontFamily: F.semi, color: C.accentText, minWidth: 18 },
  say: { paddingVertical: 10, paddingHorizontal: 14, borderLeftWidth: 3, borderLeftColor: C.accent, backgroundColor: C.accentSoft, borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  rec: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: C.bg },
  area: {
    minHeight: 108,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.ink,
    backgroundColor: C.surface,
    fontFamily: F.body,
    fontSize: 17,
    lineHeight: 24,
    color: C.ink,
  },
  recRow: { flexDirection: 'row', gap: 8 },
  status: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center' },
  saved: { padding: 12, borderRadius: 8, backgroundColor: C.accentSoft },
  logMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  badgePrivate: { backgroundColor: C.bg, color: C.muted },
  badgePosted: { backgroundColor: C.accentSoft, color: C.accentText },
  caption: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, fontFamily: F.body, fontSize: 16, color: C.ink },
  logActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  logHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { fontFamily: F.display, fontSize: 34, lineHeight: 34, color: C.accentText },
  steps: { flexDirection: 'row', gap: 8, marginBottom: -12 },
  stepTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  stepTabOn: { borderColor: C.ink, borderBottomWidth: 4, borderBottomColor: C.accent },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  stepDotPast: { backgroundColor: C.ink },
  stepDotText: { fontFamily: F.semi, fontSize: 13, lineHeight: 16, color: C.ink },
  card: { gap: 12, padding: 16, borderRadius: 10, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.surface },
  q: { fontSize: 17, lineHeight: 23, marginTop: 4 },
  field: { minHeight: 48, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.surface, fontFamily: F.body, fontSize: 16, color: C.ink },
  scale: { flexDirection: 'row', gap: 6 },
  scaleBtn: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 8, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.bg },
  scaleNum: { fontFamily: F.display, fontSize: 22, lineHeight: 26, color: C.ink },
  scaleWord: { fontFamily: F.semi, fontSize: 11, lineHeight: 14, color: C.muted },
  choice: { flexDirection: 'row', gap: 6 },
  choiceBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.bg },
  on: { backgroundColor: C.ink, borderColor: C.ink },
  result: { borderTopWidth: 6, borderTopColor: C.accent, gap: 16 },
  resPart: { gap: 6 },
  resRule: { paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line },
  resBig: { fontFamily: F.display, fontSize: 34, lineHeight: 40, color: C.ink },
  resK: { fontFamily: F.semi, color: C.muted },
  bars: { flexDirection: 'row', gap: 14, alignItems: 'flex-end', height: 110 },
  barCol: { alignItems: 'center', gap: 4 },
  bar1: { width: 44, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.bgDeep },
  barNow: { backgroundColor: C.accent },
  logWrap: { gap: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line },
  logTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logMore: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 },
  logDetail: { gap: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  logItem: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, gap: 8 },
});

// Tells you when a move also moves your rope team's mountain or this month's expedition.
function CountsFor({ id }: { id: string }) {
  const r = useRope();
  const { stage, roped } = useStage();
  const tags: string[] = [];
  if (stage < 2 && !roped) return null;
  if (r.team && r.mountain && countsFor(r.mountain, id)) tags.push(`your rope team (${MOUNTAINS[r.mountain].name})`);
  if (countsFor('strangers', id)) tags.push('this month’s expedition');
  if (!tags.length) return null;
  const hue = r.team && r.mountain && countsFor(r.mountain, id) ? MOUNTAINS[r.mountain].hue : C.accent;
  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: C.bg, borderLeftWidth: 4, borderLeftColor: hue }}>
      <T v="semi" style={{ fontSize: 14, lineHeight: 19 }}>{`Counts for ${tags.join(' and ')}.`}</T>
    </View>
  );
}
