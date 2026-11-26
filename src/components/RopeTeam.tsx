import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { PLACE_POSTER } from '../artImages';
import { stamp, useNerve } from '../data';
import { BRANCH, BY, MOVES, isPath, levelMoves, unlocked } from '../moves';
import { MOUNTAINS, MTN_KEYS, PEAKS, countsFor, type MountainKey } from '../mountains';
import { todaysQuest } from '../progress';
import { MEET_DAYS, MEET_TIMES, PER, REPORT_WHY, ROPE_MIN, daysLeft, useRope, weekStartIso } from '../rope';
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

export function RopeTeam({ onError, onOpenMove }: { onError: (message: string) => void; onOpenMove: (id: string) => void }) {
  const n = useNerve();
  const r = useRope();
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState<string[]>([]);
  const [draft, setDraft] = useState<{ place: number; day: string; time: string } | null>(null);
  const [report, setReport] = useState<{ who: string | null; why: string | null; leave: boolean } | null>(null);
  const [notice, setNotice] = useState('');
  const [more, setMore] = useState(false);
  const [showMoves, setShowMoves] = useState(false);
  const [listing, setListing] = useState<MountainKey | 'all' | null>(null);

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
          <T v="small">Rope teams are for friends who follow each other. Follow a few people from Community, and once they follow you back they’ll show up here.</T>
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
  const mk = r.mountain;
  const mtn = mk ? MOUNTAINS[mk] : null;
  const peak = r.info?.peak ?? 0;
  const per = (mtn ? mtn.per : MOUNTAINS.strangers.per) + peak;
  const goal = on.length * per;
  const count = (id: string) => r.counts[id] ?? 0;
  const total = on.reduce((a, m) => a + count(m.member), 0);
  const frac = goal ? Math.min(1, total / goal) : 0;
  const short = on.filter((m) => count(m.member) < ROPE_MIN);
  const most = Math.max(ROPE_MIN, ...on.map((x) => count(x.member)));
  const left = daysLeft();
  const done = along(frac);
  const at = done[done.length - 1];
  const hue = mtn ? mtn.hue : C.accent;
  const path = (pts: [number, number][]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  const pos = (i: number): [number, number] => [Math.max(14 + i * 18, at[0] - 27 + i * 18), at[1] - 16 + (i % 2) * 6];
  const climbers = on.map((m, i) => `<circle cx="${pos(i)[0].toFixed(1)}" cy="${pos(i)[1].toFixed(1)}" r="10" fill="${hueOf(m.member)}" stroke="${C.ink}" stroke-width="2"/>`).join('');
  const xml = `<svg viewBox="0 0 340 170">
<path d="M6 164 L118 52 L150 70 L196 18 L262 86 L334 164 Z" fill="${C.bgDeep}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M196 18 L180 36 L190 34 L198 44 L206 32 L214 34 Z" fill="#FFFFFF" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="${path(TRAIL)}" fill="none" stroke="${C.line}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>
${frac > 0 ? `<path d="${path(done)}" fill="none" stroke="${C.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
<line x1="196" y1="22" x2="196" y2="4" stroke="${C.ink}" stroke-width="2"/><path d="M196 4 L214 9 L196 14 Z" fill="${hue}" stroke="${C.ink}" stroke-width="1.5"/>
${climbers}</svg>`;
  const status =
    on.length < 2
      ? 'Waiting for your team to accept'
      : frac >= 1 && !short.length
        ? mk === 'night'
          ? 'Moves done. Now everyone checks in at the meet-up'
          : 'Summited'
        : short.length
          ? `${short.map((m) => nameOf(m.member)).join(' and ')} ${short.length > 1 ? 'still need more' : `still ${short[0].member === n.uid ? 'need' : 'needs'} ${ROPE_MIN - count(short[0].member)} more`}`
          : '';

  // Who picks: whoever started the team, until Tuesday. After that, anyone on the team.
  const owner = r.info?.created_by ?? null;
  const ownerIn = !!owner && on.some((m) => m.member === owner);
  const monday = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', weekday: 'short' }).format(new Date()) === 'Mon';
  const canPick = !ownerIn || owner === n.uid || !monday;
  const locked = !!mk && total > 0;

  // The rope move: one move the whole team shares, the same for everyone this week.
  const weekNo = Math.floor(new Date(weekStartIso()).getTime() / 604800000);
  const ropePool = mk ? MOVES.filter((m) => !m.retired && m.b !== 'z' && !isPath(m.b) && countsFor(mk, m.id) && (m.b === 'x' ? (m.place ?? 0) === 0 : m.lv === 1)) : [];
  const ropeMove = ropePool.length ? ropePool[weekNo % ropePool.length] : null;
  const openCounted = mk
    ? MOVES.filter((m) => !m.retired && countsFor(mk, m.id) && (m.b === 'z' ? m.id === todaysQuest().id : unlocked(m, n.count, n.progress.open, n.progress.level, n.test)))
    : [];
  const lockedCount = mk ? MOVES.filter((m) => !m.retired && m.b !== 'z' && countsFor(mk, m.id)).length - openCounted.filter((m) => m.b !== 'z').length : 0;

  const meet = r.meet;
  const going = (id: string) => r.rsvps.find((x) => meet && x.meet === meet.id && x.member === id)?.going;
  const others = on.filter((m) => m.member !== n.uid);
  const waiting = others.filter((m) => going(m.member) === undefined);
  const events = r.events.filter((e) => e.team === r.team).slice(0, 8);
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
      case 'dropped':
        return `${who} came off the rope after two quiet climbs`;
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
      case 'picked':
        return `${who} picked ${MOUNTAINS[e.note as MountainKey]?.name ?? 'a mountain'} for this week`;
      case 'rescue':
        return `${who} teamed up with ${to} on ${BY[e.note ?? '']?.title ?? 'a move'}`;
      case 'checkin':
        return `${who} checked in at the meet-up`;
      case 'summit':
        return `The team summited ${MOUNTAINS[e.note as MountainKey]?.name ?? 'the mountain'}`;
      case 'peak':
        return `Three in a row. The team moved up to ${PEAKS[Number(e.note) || 0]}`;
      case 'missed':
        return 'Last week’s climb fell short. The streak starts again';
      default:
        return '';
    }
  };
  const openPlaces = PLACES.map((p, k) => ({ k, t: p.name })).filter((o) => n.test || o.k < 3 || n.progress.level >= PLACES[o.k].lv);
  const togetherMove = meet ? levelMoves('x', meet.place + 1)[3] : undefined;
  const freeFriends = r.mutuals.filter((id) => !roster.some((m) => m.member === id));
  const checkedCount = meet ? on.filter((m) => r.checkedIn(m.member)).length : 0;
  const meetHour = meet ? (meet.at_time === '10 am' ? 10 : meet.at_time === '2 pm' ? 14 : 19) : 0;
  const nowParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', weekday: 'long', hour: 'numeric', hour12: false }).formatToParts(new Date());
  const nowDay = nowParts.find((p) => p.type === 'weekday')?.value;
  const nowHour = Number(nowParts.find((p) => p.type === 'hour')?.value ?? 0) % 24;
  const checkOpen = !!meet && nowDay === meet.day && nowHour >= meetHour - 1 && nowHour <= meetHour + 4;

  return (
    <View style={s.card}>
      {header}
      {notice ? <T v="small" style={s.notice}>{notice}</T> : null}

      {!mk ? (
        <View style={{ gap: 8 }}>
          <T style={s.askTitle}>Pick this week’s mountain</T>
          <T v="small">
            {canPick
              ? owner === n.uid
                ? 'You started this team, so you pick. Each mountain counts different moves. It locks once someone logs a move that counts.'
                : 'Pick for the team. Each mountain counts different moves. It locks once someone logs a move that counts.'
              : `${n.nameOf(owner ?? '')} started this team and picks until Tuesday. After that, anyone can. Until then the climb counts as Strangers.`}
          </T>
          <View style={s.mtnGrid}>
            {MTN_KEYS.map((k) => (
              <Pressable
                key={k}
                accessibilityRole="radio"
                accessibilityState={{ disabled: !canPick || busy }}
                disabled={!canPick || busy}
                onPress={() => run(() => r.pick(k))}
                style={({ pressed }) => [s.mtnCard, { borderTopColor: MOUNTAINS[k].hue }, (!canPick || busy) && { opacity: 0.6 }, pressed && { borderColor: C.ink }]}>
                <T style={[s.mtnName, { color: MOUNTAINS[k].hue }]}>{MOUNTAINS[k].name}</T>
                <T v="small">{MOUNTAINS[k].rule}</T>
                <T style={s.mtnPer}>{`${MOUNTAINS[k].per + peak} moves each`}</T>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={() => setListing('all')}>
            <T style={s.link}>See which moves count for each</T>
          </Pressable>
        </View>
      ) : (
        <View style={[s.mtnHead, { borderLeftColor: hue }]}>
          <View style={s.rowBetween}>
            <T style={[s.mtnName, { color: hue, fontSize: 18 }]}>{`${mtn!.name}, ${PEAKS[peak]}`}</T>
            <T v="small">{`Peak ${peak + 1} of ${PEAKS.length}`}</T>
          </View>
          <T v="small">{mtn!.rule}</T>
          <View style={s.ladder} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {PEAKS.map((p, i) => (
              <View key={p} style={[s.ladderStep, { height: 8 + i * 5 }, i < peak && { backgroundColor: C.ink, borderColor: C.ink }, i === peak && { backgroundColor: hue, borderColor: C.ink }]} />
            ))}
          </View>
          <View style={s.streak}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.streakDot, i < (r.info?.streak ?? 0) && { backgroundColor: C.accent }]} />
            ))}
            <T v="small" style={{ flex: 1 }}>
              {peak >= PEAKS.length - 1
                ? 'Top of the range. Keep the streak.'
                : `${3 - (r.info?.streak ?? 0)} more ${3 - (r.info?.streak ?? 0) === 1 ? 'summit' : 'summits'} in a row to reach ${PEAKS[peak + 1]}`}
            </T>
          </View>
          {r.info?.patches ? <T v="small">{`Team patches earned: ${r.info.patches}`}</T> : null}
          <View style={s.row}>
            <Pressable accessibilityRole="button" onPress={() => setListing(mk)}>
              <T style={s.link}>What counts</T>
            </Pressable>
            {locked || !canPick ? <T v="small">Locked for this week</T> : null}
          </View>
          {mk === 'night' ? (
            <T v="small">
              {meet ? `Meet-up check-ins: ${checkedCount} of ${on.length}. The summit counts once everyone checks in.` : 'Suggest a meet-up below. The summit counts once everyone checks in there.'}
            </T>
          ) : null}
        </View>
      )}

      {mk ? (
        <View style={s.fold}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMoves }} onPress={() => setShowMoves((v) => !v)} style={s.foldHead}>
            <T style={[s.chev, { color: hue }]}>{showMoves ? '▾' : '▸'}</T>
            <T v="semi" style={{ flex: 1, fontSize: 15 }}>{`Moves that count this week, ${openCounted.length} open to you`}</T>
          </Pressable>
          {showMoves ? (
            <View style={{ gap: 4, paddingBottom: 10 }}>
              {(mk === 'night' ? openCounted.slice(0, 12) : openCounted).map((m) => (
                <Pressable key={m.id} accessibilityRole="button" onPress={() => onOpenMove(m.id)} style={({ pressed }) => [s.mmRow, { borderLeftColor: hue }, pressed && { backgroundColor: C.bgDeep }]}>
                  <T v="semi" style={{ fontSize: 15 }}>
                    {m.title}
                  </T>
                  <T v="small">{m.b === 'x' ? PLACES[m.place ?? 0].name : m.b === 'z' ? 'Side quest' : BRANCH[m.b].name}</T>
                </Pressable>
              ))}
              <T v="small">
                {mk === 'night' ? 'Every move counts on this mountain. These are a few to start with.' : `${lockedCount > 0 ? `${lockedCount} more count once you open them. ` : ''}Tap one to open it.`}
              </T>
            </View>
          ) : null}
        </View>
      ) : null}

      {mk ? (
        <>
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
        </>
      ) : null}

      <View style={{ gap: 10 }}>
        {roster.map((m) => {
          const me = m.member === n.uid;
          const c = count(m.member);
          const nudged = r.nudgedToday(m.member);
          const rs = me ? null : r.rescueWith(m.member);
          const canNudge = n.profiles[m.member]?.allow_nudges !== false;
          return (
            <View key={m.member} style={{ gap: 6 }}>
              <View style={s.member}>
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
                {m.status === 'in' ? <T style={[s.n, c < ROPE_MIN && { color: C.accentText }]}>{c < ROPE_MIN ? `${c} of ${ROPE_MIN}` : `${c} moves`}</T> : null}
              </View>
              {m.status === 'in' && !me && (c < ROPE_MIN || rs) ? (
                <View style={s.memExtra}>
                  {rs ? (
                    <T style={s.rescue}>{`You’re doing ${BY[rs.move]?.title ?? 'a move'} together. You both get credit once you’ve both logged it.`}</T>
                  ) : (
                    <>
                      {canNudge ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={nudged ? `Nudged ${nameOf(m.member)} today` : `Nudge ${nameOf(m.member)}`}
                          disabled={nudged || busy}
                          onPress={() => run(() => r.nudge(m.member))}
                          style={[s.nudge, nudged && { borderColor: C.line }]}>
                          <T style={[s.nudgeText, nudged && { color: C.muted }]}>{nudged ? 'Nudged' : 'Nudge'}</T>
                        </Pressable>
                      ) : null}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Do a move together with ${nameOf(m.member)}`}
                        disabled={busy || !(ropeMove ?? openCounted[0])}
                        onPress={() => run(() => r.rescue(m.member, (ropeMove ?? openCounted[0])!.id))}
                        style={s.nudge}>
                        <T style={s.nudgeText}>Do one together</T>
                      </Pressable>
                    </>
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {ropeMove ? (
        <View style={s.form}>
          <T v="eyebrow">Rope move this week</T>
          <T style={s.askTitle}>{ropeMove.title}</T>
          <T v="small">Everyone on the team does the same move, so you all have the same story to compare.</T>
          <Btn label="Open the move" small onPress={() => onOpenMove(ropeMove.id)} style={{ alignSelf: 'flex-start' }} />
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
            <T v="small">{`Check in when you’re there: ${checkedCount} of ${on.length} so far. It opens on ${meet.day} from an hour before ${meet.at_time}.`}</T>
            <Btn
              label={r.checkedIn(n.uid) ? 'You’re checked in' : checkOpen ? 'Check in' : `Check-in opens ${meet.day}`}
              small
              disabled={!checkOpen || r.checkedIn(n.uid) || busy}
              onPress={() => run(r.checkIn)}
              style={{ alignSelf: 'flex-start' }}
            />
            <View style={s.rules}>
              {['Public places only, in daylight or a busy evening spot', 'Only your rope team, friends who follow each other', 'Leave whenever you want. No one films anyone without asking'].map((x) => (
                <T key={x} v="small">{`•  ${x}`}</T>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      <View style={s.fold}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore((v) => !v)} style={s.foldHead}>
          <T style={s.chev}>{more ? '▾' : '▸'}</T>
          <T v="semi" style={{ flex: 1, fontSize: 15 }}>
            Team activity, meet-ups and settings
          </T>
        </Pressable>
        {more ? (
          <View style={{ gap: 12, paddingBottom: 12 }}>
            {mk ? (
              <T v="small">{`The team summits at ${goal} ${mtn!.name} moves (${per} each), and only if each of you logs at least ${ROPE_MIN}.${mk === 'night' ? ' This one also needs everyone to check in at the meet-up.' : ''} The climb restarts every Monday.`}</T>
            ) : null}
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

            {roster.length < 4 && freeFriends.length ? (
              <View style={{ gap: 6 }}>
                <T v="small">{`Room for ${4 - roster.length} more. They join the climb as soon as they accept.`}</T>
                <View style={s.chips}>
                  {freeFriends.map((id) => (
                    <Pressable key={id} accessibilityRole="button" disabled={busy} onPress={() => run(() => r.invite(id))} style={s.chip}>
                      <T style={s.chipText}>{`Invite ${n.nameOf(id)}`}</T>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
            <T v="small">Anyone who logs nothing for two climbs in a row comes off the rope quietly, and can be invited back any time.</T>

            <View style={[s.row, { gap: 18 }]}>
              <Pressable accessibilityRole="button" onPress={() => setReport(report ? null : { who: null, why: null, leave: true })}>
                <T style={s.link}>Report a problem</T>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => run(r.leave, () => setNotice('You left the team.'))}>
                <T style={s.link}>Leave the team</T>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      {listing ? <WhatCounts only={listing === 'all' ? null : listing} onClose={() => setListing(null)} /> : null}
    </View>
  );
}

// The full list of moves that count, by mountain and where they live.
function WhatCounts({ only, onClose }: { only: MountainKey | null; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.shade} accessibilityLabel="Close" onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.rowBetween}>
          <T v="h">What counts</T>
          <Btn label="Close" kind="quiet" small onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 32 }}>
          {(only ? [only] : MTN_KEYS).map((k) => {
            const groups: Record<string, string[]> = {};
            if (k !== 'night')
              for (const m of MOVES) {
                if (m.retired || !countsFor(k, m.id)) continue;
                const g = m.b === 'x' ? 'Places' : m.b === 'z' ? 'Side quests' : BRANCH[m.b].name;
                (groups[g] ??= []).push(m.title);
              }
            return (
              <View key={k} style={{ gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line }}>
                <T style={[s.mtnName, { color: MOUNTAINS[k].hue, fontSize: 18 }]}>{MOUNTAINS[k].name}</T>
                <T v="small">{MOUNTAINS[k].rule}</T>
                {k === 'night' ? <T v="small">Every move counts.</T> : null}
                {Object.entries(groups).map(([g, titles]) => (
                  <T key={g} v="small">
                    <T v="small" style={{ fontFamily: F.semi, color: C.ink }}>
                      {`${g} `}
                    </T>
                    {titles.join(', ')}
                  </T>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// The monthly expedition: everyone on Nerve climbs one mountain together.
export function ExpeditionCard() {
  const r = useRope();
  const e = r.expedition;
  if (!r.loaded || !e) return null;
  const goal = e.last_month > 0 ? Math.max(100, Math.round((e.last_month * 1.2) / 100) * 100) : Math.max(100, e.active * 10);
  const now = new Date();
  const month = now.toLocaleString('en-CA', { month: 'long' });
  const left = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
  const pct = (x: number) => `${Math.min(100, (x / goal) * 100)}%` as const;
  return (
    <View style={s.card} accessibilityLabel={`${month} expedition`}>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <T v="eyebrow">{`${month} expedition`}</T>
          <T style={s.title}>{`${goal.toLocaleString('en-CA')} moves with strangers`}</T>
        </View>
        <T style={s.private}>Everyone on Nerve</T>
      </View>
      <View style={s.expBar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: goal, now: e.this_month }}>
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: pct(e.this_month), backgroundColor: C.accent }} />
        {e.my_team ? <View style={{ position: 'absolute', top: 0, bottom: 0, left: pct(e.this_month - e.my_team), width: pct(e.my_team), backgroundColor: C.ink }} /> : null}
      </View>
      <T style={s.stat}>
        <T style={{ fontFamily: F.display }}>{`${e.this_month.toLocaleString('en-CA')} of ${goal.toLocaleString('en-CA')}`}</T>
        {` so far, ${left} ${left === 1 ? 'day' : 'days'} left`}
      </T>
      <T v="small">{`${e.my_team ? `Your rope team ${e.my_team}. ` : ''}You ${e.mine}.`}</T>
      <T v="small">
        {e.last_month > 0 ? `Goal set from last month’s ${e.last_month.toLocaleString('en-CA')}, plus a fifth.` : 'First expedition: the goal is ten for everyone who’s active.'} Every move with someone
        you don’t know counts, wherever you are on Nerve. No team needed.
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  mtnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mtnCard: { flexBasis: '47%', flexGrow: 1, gap: 4, padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, borderTopWidth: 5, backgroundColor: C.surface },
  mtnName: { fontFamily: F.semi, fontSize: 16, lineHeight: 21 },
  mtnPer: { fontFamily: F.semi, fontSize: 13, color: C.ink },
  mtnHead: { gap: 6, padding: 12, borderRadius: 8, backgroundColor: C.bg, borderLeftWidth: 5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  ladder: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  ladderStep: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderWidth: 1, borderColor: C.line, backgroundColor: C.bgDeep },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: C.ink },
  fold: { borderTopWidth: 1, borderTopColor: C.line },
  foldHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  chev: { fontSize: 14, width: 14, color: C.ink },
  mmRow: { gap: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, backgroundColor: C.bg, borderLeftWidth: 3 },
  memExtra: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingLeft: 40 },
  rescue: { flex: 1, fontFamily: F.semi, fontSize: 13, lineHeight: 18, color: C.accentText },
  expBar: { height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.bgDeep, overflow: 'hidden' },
  shade: { flex: 1, backgroundColor: 'rgba(20,28,24,0.45)' },
  sheet: { maxHeight: '86%', paddingHorizontal: 16, paddingTop: 16, gap: 8, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderTopWidth: 2, borderColor: C.ink, backgroundColor: C.surface },
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
