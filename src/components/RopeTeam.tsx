import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { PLACE_POSTER } from '../artImages';
import { stamp, useNerve } from '../data';
import { levelMoves } from '../moves';
import { MEET_DAYS, MEET_TIMES, PER, REPORT_WHY, ROPE_MIN, daysLeft, useRope } from '../rope';
import { PLACES } from '../rpgData';
import { C, F } from '../theme';
import { Btn, T } from '../ui';

// Rope team: friends who follow each other share one mountain for the week. Private to the team.
const HUES = ['#1E5C9E', '#2A6B44', '#9A5F00', '#6B3FA0', '#7A1F1F'];
const TRAIL: [number, number][] = [
  [30, 160], [120, 142], [72, 120], [176, 98], [124, 78], [200, 58], [172, 42], [196, 22],
];

function along(frac: number) {
  const segs = TRAIL.slice(1).map((p, i) => Math.hypot(p[0] - TRAIL[i][0], p[1] - TRAIL[i][1]));
  let left = segs.reduce((a, b) => a + b, 0) * frac;
  const done: [number, number][] = [TRAIL[0]];
  for (let i = 0; i < segs.length; i++) {
    const [a, b] = [TRAIL[i], TRAIL[i + 1]];
    if (left >= segs[i]) {
      done.push(b);
      left -= segs[i];
      continue;
    }
    const t = left / segs[i];
    done.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    break;
  }
  return done;
}

function Face({ name, hue, me, size = 30, dim }: { name: string; hue: string; me?: boolean; size?: number; dim?: boolean }) {
  return (
    <View style={[s.face, { width: size, height: size, borderRadius: size / 2, backgroundColor: hue, opacity: dim ? 0.4 : 1 }]}>
      <T style={[s.faceText, { color: me ? C.ink : '#FFFFFF' }]}>{(name || '?').charAt(0).toUpperCase()}</T>
    </View>
  );
}

function Chips<K extends string | number>({ options, value, onPick, label }: { options: { k: K; t: string }[]; value: K | null; onPick: (k: K) => void; label: string }) {
  return (
    <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => (
        <Pressable
          key={String(o.k)}
          accessibilityRole="radio"
          accessibilityState={{ selected: o.k === value }}
          onPress={() => onPick(o.k)}
          style={[s.chip, o.k === value && s.chipOn]}>
          <T style={[s.chipText, o.k === value && { color: C.surface }]}>{o.t}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function RopeTeam({ onError }: { onError: (message: string) => void }) {
  const n = useNerve();
  const r = useRope();
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState<string[]>([]);
  const [draft, setDraft] = useState<{ place: number; day: string; time: string } | null>(null);
  const [report, setReport] = useState<{ who: string | null; why: string | null; leave: boolean } | null>(null);
  const [notice, setNotice] = useState('');

  const run = async (fn: () => Promise<string>, after?: () => void) => {
    setBusy(true);
    const problem = await fn();
    setBusy(false);
    if (problem) onError(problem);
    else after?.();
  };

  const hueOf = useMemo(() => {
    const ids = [...r.mutuals].sort();
    return (id: string) => (id === n.uid ? C.accent : HUES[Math.max(0, ids.indexOf(id)) % HUES.length]);
  }, [r.mutuals, n.uid]);
  const nameOf = (id: string) => (id === n.uid ? 'You' : n.nameOf(id));

  if (!r.loaded) return null;

  const header = (
    <View style={s.head}>
      <View style={{ flex: 1 }}>
        <T v="eyebrow">Rope team</T>
        <T style={s.title}>Climb this week together</T>
      </View>
      <T style={s.private}>Private</T>
    </View>
  );

  // ---- No team yet: answer invites, or invite friends ----
  if (!r.team) {
    const followsMe = Object.keys(n.profiles).filter((id) => id !== n.uid && n.isFollowedBy(id) && !n.isFollowing(id));
    return (
      <View style={s.card}>
        {header}
        {notice ? <T v="small" style={s.notice}>{notice}</T> : null}
        {r.invites.map((inv) => (
          <View key={inv.team} style={s.invite}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                {[inv.from, ...inv.others].map((id, i) => (
                  <View key={id} style={{ marginLeft: i ? -8 : 0 }}>
                    <Face name={n.nameOf(id)} hue={hueOf(id)} />
                  </View>
                ))}
              </View>
              <T style={{ flex: 1 }}>
                {`${n.nameOf(inv.from)} invited you to climb${inv.others.length ? ` with ${inv.others.map(n.nameOf).join(' and ')}` : ''} this week.`}
              </T>
            </View>
            <View style={s.row}>
              <Btn label="Join the team" kind="primary" small disabled={busy} onPress={() => run(() => r.answer(inv.team, true))} />
              <Btn label="Not this week" small disabled={busy} onPress={() => run(() => r.answer(inv.team, false))} />
            </View>
            <T v="small">{`${n.nameOf(inv.from)} won’t be told why you said no.`}</T>
          </View>
        ))}
        <T v="sub">Invite up to three friends. You share one mountain for the week: everyone’s moves move the rope. Only the team sees it.</T>
        {r.mutuals.length === 0 && followsMe.length === 0 ? (
          <T v="small">Rope teams are for friends who follow each other. Follow a few people from the feed, and once they follow you back they’ll show up here.</T>
        ) : null}
        <View style={{ gap: 6 }}>
          {r.mutuals.map((id) => {
            const on = pick.includes(id);
            const full = !on && pick.length >= 3;
            return (
              <Pressable
                key={id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: full }}
                disabled={full}
                onPress={() => setPick((p) => (on ? p.filter((x) => x !== id) : [...p, id]))}
                style={[s.pickRow, on && s.pickOn, full && { opacity: 0.5 }]}>
                <Face name={n.nameOf(id)} hue={hueOf(id)} size={32} />
                <T style={s.name}>{n.nameOf(id)}</T>
                <T style={[s.tick, on && { color: C.ink }]}>{on ? 'Selected' : 'Select'}</T>
              </Pressable>
            );
          })}
          {followsMe.slice(0, 3).map((id) => (
            <View key={id} style={[s.pickRow, { opacity: 0.55 }]}>
              <Face name={n.nameOf(id)} hue={C.line} size={32} />
              <View style={{ flex: 1 }}>
                <T style={s.name}>{n.nameOf(id)}</T>
                <T v="small">Follows you. Follow back to invite them.</T>
              </View>
            </View>
          ))}
        </View>
        {pick.length ? (
          <T v="small">{`Once they accept, a team of ${pick.length + 1} climbs ${(pick.length + 1) * PER} moves, and each of you logs at least ${ROPE_MIN}.`}</T>
        ) : null}
        <Btn
          label={pick.length ? `Send ${pick.length === 1 ? 'invite' : `${pick.length} invites`}` : 'Send invites'}
          kind="primary"
          disabled={!pick.length || busy}
          onPress={() => run(() => r.create(pick), () => setPick([]))}
        />
      </View>
    );
  }

  // ---- On a team ----
  const roster = [...r.roster].sort((a, b) => (a.member === n.uid ? -1 : b.member === n.uid ? 1 : a.created_at.localeCompare(b.created_at)));
  const on = roster.filter((m) => m.status === 'in');
  const goal = on.length * PER;
  const count = (id: string) => r.counts[id] ?? 0;
  const total = on.reduce((a, m) => a + count(m.member), 0);
  const frac = goal ? Math.min(1, total / goal) : 0;
  const short = on.filter((m) => count(m.member) < ROPE_MIN);
  const most = Math.max(ROPE_MIN, ...on.map((x) => count(x.member)));
  const left = daysLeft();
  const done = along(frac);
  const at = done[done.length - 1];
  const path = (pts: [number, number][]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  const pos = (i: number): [number, number] => [Math.max(14 + i * 18, at[0] - 27 + i * 18), at[1] - 16 + (i % 2) * 6];
  const climbers = on.map((m, i) => `<circle cx="${pos(i)[0].toFixed(1)}" cy="${pos(i)[1].toFixed(1)}" r="10" fill="${hueOf(m.member)}" stroke="${C.ink}" stroke-width="2"/>`).join('');
  const xml = `<svg viewBox="0 0 340 170">
<path d="M6 164 L118 52 L150 70 L196 18 L262 86 L334 164 Z" fill="${C.bgDeep}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M196 18 L180 36 L190 34 L198 44 L206 32 L214 34 Z" fill="#FFFFFF" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="${path(TRAIL)}" fill="none" stroke="${C.line}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>
${frac > 0 ? `<path d="${path(done)}" fill="none" stroke="${C.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
<line x1="196" y1="22" x2="196" y2="4" stroke="${C.ink}" stroke-width="2"/><path d="M196 4 L214 9 L196 14 Z" fill="${C.accent}" stroke="${C.ink}" stroke-width="1.5"/>
${climbers}</svg>`;
  const status =
    on.length < 2
      ? 'Waiting for your team to accept'
      : frac >= 1 && !short.length
        ? 'Summited'
        : short.length
          ? `${short.map((m) => nameOf(m.member)).join(' and ')} ${short.length > 1 ? 'still need more' : `still ${short[0].member === n.uid ? 'need' : 'needs'} ${ROPE_MIN - count(short[0].member)} more`}`
          : '';

  const meet = r.meet;
  const going = (id: string) => r.rsvps.find((x) => meet && x.meet === meet.id && x.member === id)?.going;
  const others = on.filter((m) => m.member !== n.uid);
  const waiting = others.filter((m) => going(m.member) === undefined);
  const events = r.events.filter((e) => e.team === r.team).slice(0, 6);
  const eventText = (e: (typeof events)[number]) => {
    const who = nameOf(e.actor);
    const to = e.target ? (e.target === n.uid ? 'you' : n.nameOf(e.target)) : '';
    switch (e.kind) {
      case 'invited':
        return `${who} invited ${to}`;
      case 'joined':
        return `${who} joined the team`;
      case 'left':
        return `${who} left the team`;
      case 'nudged':
        return `${who} nudged ${to}`;
      case 'meet':
        return `${who} suggested a meet-up, ${e.note ?? ''}`;
      case 'in':
        return `${who} ${e.actor === n.uid ? 'are' : 'is'} in for the meet-up`;
      case 'out':
        return `${who} can’t make the meet-up`;
      case 'cancelled':
        return `${who} cancelled the meet-up`;
      default:
        return '';
    }
  };
  const openPlaces = PLACES.map((p, k) => ({ k, t: p.name })).filter((o) => n.test || o.k < 3 || n.progress.level >= PLACES[o.k].lv);
  const togetherMove = meet ? levelMoves('x', meet.place + 1)[3] : undefined;

  return (
    <View style={s.card}>
      {header}
      {notice ? <T v="small" style={s.notice}>{notice}</T> : null}
      <View accessible accessibilityRole="image" accessibilityLabel={`Your rope team is ${Math.round(frac * 100)} percent of the way up`}>
        <View style={{ width: '100%', aspectRatio: 2 }}>
          <SvgXml xml={xml} width="100%" height="100%" />
        </View>
        <View style={s.overlay} pointerEvents="none">
          {on.map((m, i) => (
            <T
              key={m.member}
              style={[s.climberText, { left: `${(pos(i)[0] / 340) * 100}%`, top: `${(pos(i)[1] / 170) * 100}%`, color: m.member === n.uid ? C.ink : '#FFFFFF' }]}>
              {nameOf(m.member).charAt(0)}
            </T>
          ))}
        </View>
      </View>
      <T style={s.stat}>
        <T style={{ fontFamily: F.display }}>{`${total} of ${goal}`}</T>
        {` moves, ${left === 1 ? 'last day' : `${left} days left`}${status ? `. ${status}` : ''}`}
      </T>

      <View style={{ gap: 10 }}>
        {roster.map((m) => {
          const me = m.member === n.uid;
          const c = count(m.member);
          const nudged = r.nudgedToday(m.member);
          return (
            <View key={m.member} style={s.member}>
              <Face name={nameOf(m.member)} hue={hueOf(m.member)} me={me} dim={m.status === 'invited'} />
              <View style={{ flex: 1, gap: 4 }}>
                <T style={[s.name, m.status === 'invited' && { color: C.muted }]}>{nameOf(m.member)}</T>
                {m.status === 'invited' ? (
                  <T v="small">Invited, hasn’t answered</T>
                ) : (
                  <View style={s.bar}>
                    <View style={{ width: `${Math.round((c / most) * 100)}%`, height: '100%', backgroundColor: hueOf(m.member) }} />
                  </View>
                )}
              </View>
              {m.status === 'in' && !me && c < ROPE_MIN ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={nudged ? `Nudged ${nameOf(m.member)} today` : `Nudge ${nameOf(m.member)}`}
                  disabled={nudged || busy}
                  onPress={() => run(() => r.nudge(m.member))}
                  style={[s.nudge, nudged && { borderColor: C.line }]}>
                  <T style={[s.nudgeText, nudged && { color: C.muted }]}>{nudged ? 'Nudged' : 'Nudge'}</T>
                </Pressable>
              ) : null}
              {m.status === 'in' ? <T style={[s.n, c < ROPE_MIN && { color: C.accentText }]}>{c < ROPE_MIN ? `${c} of ${ROPE_MIN}` : `${c} moves`}</T> : null}
            </View>
          );
        })}
      </View>
      <T v="small">{`The team summits at ${goal} moves, and only if each of you logs at least ${ROPE_MIN}. Invited friends count once they accept. The climb restarts every Monday.`}</T>

      <View style={s.feed}>
        <T style={s.feedTitle}>Team activity</T>
        {events.length ? (
          events.map((e) => (
            <View key={e.id} style={s.feedRow}>
              <T style={{ flex: 1, fontSize: 14, lineHeight: 19 }}>{eventText(e)}</T>
              <T v="small">{stamp(e.created_at)}</T>
            </View>
          ))
        ) : (
          <T v="small">Nothing yet.</T>
        )}
        <T v="small">You’ll see a dot on the Feed tab when someone invites you, nudges you or suggests a meet-up. One nudge per person a day.</T>
      </View>

      {!meet && !draft && on.length >= 2 ? (
        <View style={s.ask}>
          <T style={s.askTitle}>Want to meet up?</T>
          <T v="small">Optional. Suggest a place and a time, and whoever’s free says they’re in.</T>
          <Btn label="Suggest a meet-up" small onPress={() => setDraft({ place: 0, day: 'Saturday', time: '2 pm' })} />
        </View>
      ) : null}
      {draft ? (
        <View style={s.form}>
          <T style={s.askTitle}>Suggest a meet-up</T>
          <T v="eyebrow">Where</T>
          <Chips label="Where" options={openPlaces} value={draft.place} onPick={(k) => setDraft({ ...draft, place: k })} />
          <T v="eyebrow">When</T>
          <Chips label="Day" options={MEET_DAYS.map((d) => ({ k: d as string, t: d }))} value={draft.day} onPick={(k) => setDraft({ ...draft, day: k })} />
          <Chips label="Time" options={MEET_TIMES.map((d) => ({ k: d as string, t: d }))} value={draft.time} onPick={(k) => setDraft({ ...draft, time: k })} />
          <View style={s.row}>
            <Btn label="Post to the team" kind="primary" small disabled={busy} onPress={() => run(() => r.suggest(draft.place, draft.day, draft.time), () => setDraft(null))} />
            <Btn label="Cancel" kind="quiet" small onPress={() => setDraft(null)} />
          </View>
        </View>
      ) : null}
      {meet ? (
        <View style={s.summit}>
          {PLACE_POSTER[PLACES[meet.place].id] ? (
            <Image source={PLACE_POSTER[PLACES[meet.place].id]} style={s.poster} resizeMode="cover" accessibilityIgnoresInvertColors />
          ) : null}
          <View style={{ padding: 14, gap: 8 }}>
            <T v="eyebrow">{`${meet.day}, ${meet.at_time}. Suggested by ${meet.created_by === n.uid ? 'you' : n.nameOf(meet.created_by)}`}</T>
            <T style={s.title}>{PLACES[meet.place].name}</T>
            {togetherMove ? <T>{`While you’re there: ${togetherMove.title}. Each of you tries it, then you post one line as a team.`}</T> : null}
            <T v="small">
              {`${on.filter((m) => going(m.member) === true).length} of ${on.length} in${waiting.length ? `. Waiting on ${waiting.map((m) => nameOf(m.member)).join(' and ')}` : ''}`}
            </T>
            <View style={s.row}>
              <Btn label={going(n.uid) ? 'You’re in' : 'I’m in'} kind={going(n.uid) ? 'dark' : 'primary'} small disabled={busy} onPress={() => run(() => r.rsvp(!going(n.uid)))} />
              {meet.created_by === n.uid ? (
                <Btn label="Cancel the meet-up" small disabled={busy} onPress={() => run(r.cancelMeet)} />
              ) : going(n.uid) !== false ? (
                <Btn label="Can’t make it" small disabled={busy} onPress={() => run(() => r.rsvp(false))} />
              ) : null}
            </View>
            <View style={s.rules}>
              {['Public places only, in daylight or a busy evening spot', 'Only your rope team, friends who follow each other', 'Leave whenever you want. No one films anyone without asking'].map((x) => (
                <T key={x} v="small">{`•  ${x}`}</T>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      {report ? (
        <View style={[s.form, { borderColor: C.danger }]}>
          <T style={s.askTitle}>Report a problem</T>
          <T v="small">Only the Nerve team sees reports. The person isn’t told who sent it.</T>
          <T v="eyebrow">Who</T>
          <Chips
            label="Who"
            options={roster.filter((m) => m.member !== n.uid).map((m) => ({ k: m.member, t: n.nameOf(m.member) }))}
            value={report.who}
            onPick={(k) => setReport({ ...report, who: k })}
          />
          <T v="eyebrow">What happened</T>
          <Chips label="What happened" options={REPORT_WHY.map((w) => ({ k: w as string, t: w }))} value={report.why} onPick={(k) => setReport({ ...report, why: k })} />
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: report.leave }} onPress={() => setReport({ ...report, leave: !report.leave })} style={s.check}>
            <View style={[s.box, report.leave && { backgroundColor: C.ink }]}>{report.leave ? <T style={{ color: C.surface, fontSize: 12, lineHeight: 14 }}>✓</T> : null}</View>
            <T style={{ flex: 1, fontSize: 14, lineHeight: 19 }}>Leave the team, and don’t let them invite me again</T>
          </Pressable>
          <View style={s.row}>
            <Btn
              label="Send report"
              kind="primary"
              small
              disabled={!report.who || !report.why || busy}
              onPress={() => {
                const who = report.who as string;
                const leave = report.leave;
                run(
                  () => r.report(who, report.why as string, leave),
                  () => {
                    setNotice(`Report sent about ${n.nameOf(who)}. We review every report.${leave ? ` You’ve left the team, and ${n.nameOf(who)} can’t invite you again.` : ''}`);
                    setReport(null);
                  },
                );
              }}
            />
            <Btn label="Cancel" kind="quiet" small onPress={() => setReport(null)} />
          </View>
        </View>
      ) : null}

      <View style={[s.row, { gap: 18 }]}>
        <Pressable accessibilityRole="button" onPress={() => setReport(report ? null : { who: null, why: null, leave: true })}>
          <T style={s.link}>Report a problem</T>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => run(r.leave, () => setNotice('You left the team.'))}>
          <T style={s.link}>Leave the team</T>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 8, padding: 16, gap: 12, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { fontFamily: F.display, fontSize: 22, lineHeight: 26, color: C.ink },
  private: { fontFamily: F.semi, fontSize: 12, color: C.muted, borderWidth: 1.5, borderColor: C.line, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  notice: { padding: 10, borderRadius: 8, backgroundColor: C.bg },
  invite: { gap: 10, padding: 14, borderRadius: 8, borderWidth: 1.5, borderColor: C.ink, borderLeftWidth: 5, borderLeftColor: C.accent },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  pickOn: { borderColor: C.ink, borderLeftWidth: 5, borderLeftColor: C.accent },
  tick: { fontFamily: F.semi, fontSize: 13, color: C.muted },
  face: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.ink },
  faceText: { fontFamily: F.semi, fontSize: 13, lineHeight: 16 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  climberText: { position: 'absolute', width: 20, marginLeft: -10, marginTop: -9, textAlign: 'center', fontFamily: F.semi, fontSize: 11, lineHeight: 18 },
  stat: { fontFamily: F.semi, fontSize: 15, lineHeight: 21, color: C.ink },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontFamily: F.semi, fontSize: 15, lineHeight: 19 },
  bar: { height: 6, borderRadius: 3, backgroundColor: C.bgDeep, overflow: 'hidden' },
  n: { fontFamily: F.semi, fontSize: 13, color: C.muted, minWidth: 54, textAlign: 'right' },
  nudge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1.5, borderColor: C.ink },
  nudgeText: { fontFamily: F.semi, fontSize: 13, lineHeight: 17 },
  feed: { gap: 6, padding: 12, borderRadius: 8, backgroundColor: C.bg },
  feedTitle: { fontFamily: F.semi, fontSize: 15 },
  feedRow: { flexDirection: 'row', gap: 10, alignItems: 'baseline' },
  ask: { gap: 8, padding: 14, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  askTitle: { fontFamily: F.semi, fontSize: 16 },
  form: { gap: 8, padding: 14, borderRadius: 8, borderWidth: 1.5, borderColor: C.ink },
  summit: { borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: C.ink, backgroundColor: C.bg },
  poster: { width: '100%', height: 110 },
  rules: { gap: 4, padding: 10, borderRadius: 6, backgroundColor: C.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: C.line },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.ink },
  check: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  box: { width: 18, height: 18, marginTop: 1, borderRadius: 4, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  link: { fontSize: 14, color: C.muted, textDecorationLine: 'underline' },
});
