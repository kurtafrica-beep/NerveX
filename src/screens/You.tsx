import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { MENTOR, MentorFace } from '../components/Mentor';
import { TitleChip } from '../components/LineCard';
import { BaseMountains, PathMountains } from '../components/Mountains';
import { BranchBanner, CardSheet, PatchWall } from '../components/Patches';
import { ArtImage, Emo } from '../components/ArtIcon';
import { BRANCH_ICON } from '../artImages';
import { SvgXml } from 'react-native-svg';
import type { Card as PlayCard } from '../rpgData';
import type { Reward } from '../components/Reward';
import { stamp, useNerve } from '../data';
import { ALL_KEYS, BRANCH, BY, MOVES, SOCIAL_PATHS, WORK_PATHS, isPath, lvTitle, type BranchKey, type PathKey } from '../moves';
import { myReflections, type Reflection } from '../reflect';
import { useStage } from '../stage';
import { ACH, ACH_XP, HUE, STATS, TIERS, TIER_EMOJI, TITLES, branchState, statLevel, statProgress, xpAt, type Progress } from '../progress';
import { Gate } from './Tonight';
import { C, F } from '../theme';
import { Avatar, Btn, Card, Fold, Seg, T } from '../ui';
import { Settings } from '../components/Settings';
import { useProSheet } from '../components/Pro';
import { Profile } from '../components/Profile';

export function You({
  onOpenMove,
  onOpenBranch,
  onError,
  onPreview,
}: {
  onOpenMove: (id: string) => void;
  onPreview: (r: Reward) => void;
  onOpenBranch: (b: BranchKey) => void;
  onError: (message: string) => void;
}) {
  const n = useNerve();
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState('');
  const [card, setCard] = useState<PlayCard | null>(null);
  const { stage } = useStage();
  const { openPro } = useProSheet();
  // Paths is the first tab and opens by default once it's unlocked (three moves); until then Awards does.
  const [picked, setTab] = useState<'paths' | 'awards' | 'people' | null>(null);
  const tab = (() => {
    const t = picked ?? (stage >= 2 ? 'paths' : 'awards');
    return stage < 2 && t === 'paths' ? 'awards' : t;
  })();
  const [workOpen, setWorkOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [profile, setProfile] = useState('');
  const tonight = n.tonight.move;
  const p = n.progress;
  const into = p.xp - xpAt(p.level);
  const need = xpAt(p.level + 1) - xpAt(p.level);
  const wornKey = n.profiles[n.uid]?.title ?? '';
  const worn = p.earned.includes(wornKey) ? wornKey : '';
  const wear = async (key: string) => {
    const problem = await n.wearTitle(key);
    if (problem) onError(problem);
  };

  const workOn = WORK_PATHS.some((b) => p.paths[b].met || n.branch === b);
  // Titles only for what you have started, so the list stays about where you are.
  const started = (b: BranchKey) => b === n.branch || MOVES.some((m) => m.b === b && n.count[m.id]);
  const picked0 = ALL_KEYS.filter((b) => n.test || (started(b) && (!isPath(b) || p.paths[b as PathKey].open)));
  const rewardKeys: BranchKey[] = picked0.length ? picked0 : ['c'];
  const pathCard = (b: PathKey) => {
    const info = p.paths[b];
    const met = info.reqs.filter((r) => r.ok).length;
    return (
            <View key={b} style={[s.pathCard, { backgroundColor: info.open ? HUE[b][0] : '#3A423E' }]}>
              <View style={[s.pathArt, !info.open && { opacity: 0.35 }]}>
                {/* Paths without cel-shaded art yet show their drawn glyph instead. */}
                <BranchBanner b={b} height={96} glyphX={BRANCH_ICON[b] ? 900 : 262} />
                {BRANCH_ICON[b] ? <ArtImage src={BRANCH_ICON[b]} size={72} style={s.artTile} /> : null}
              </View>
              <View style={[s.pathHead, { marginTop: -34 }]}>
                <T style={s.pathName}>{BRANCH[b].name}</T>
                <T v="small" style={{ fontFamily: F.semi, color: 'rgba(255,255,255,0.8)' }}>
                  {info.open ? `${branchState(b, p)}${info.met ? '' : ', tester'}` : info.met ? 'Earned. Part of Nerve Pro.' : `${met} of ${info.reqs.length} met`}
                </T>
              </View>
              {MENTOR[b] ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MentorFace b={b} size={28} />
                  <T v="small" style={{ fontFamily: F.semi, color: 'rgba(255,255,255,0.88)' }}>{`Guide: ${MENTOR[b]!.name}, ${MENTOR[b]!.role}`}</T>
                </View>
              ) : null}
              <T v="small" style={{ color: 'rgba(255,255,255,0.86)' }}>
                {BRANCH[b].tag}
              </T>
              {info.open || info.met ? null : <Gate reqs={info.reqs} light />}
              {!info.open && info.met ? (
                <Btn label="Unlock with Pro" kind="primary" small onPress={() => openPro(b)} style={{ alignSelf: 'flex-start' }} />
              ) : (
                <Btn label={info.open ? 'Open the path' : 'See the moves'} kind="light" small onPress={() => onOpenBranch(b)} style={{ alignSelf: 'flex-start' }} />
              )}
            </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={s.view}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={C.accent}
          onRefresh={async () => {
            setRefreshing(true);
            await n.reload();
            setRefreshing(false);
          }}
        />
      }>
      <Card>
        <View style={s.head}>
          <View style={{ flex: 1, gap: 4 }}>
            <T style={s.name}>{n.nameOf(n.uid)}</T>
            {worn ? (
              <TitleChip uid={n.uid} />
            ) : (
              <T v="small">{p.earned.length ? 'Tap an earned title below to wear it.' : 'Finish a level to earn your first title.'}</T>
            )}
          </View>
          <View style={s.lvBadge}>
            <T style={s.lvWord}>Level</T>
            <T style={s.lvNum}>{p.level}</T>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Account settings" onPress={() => setSettings(true)} style={({ pressed }) => [s.gear, pressed && { opacity: 0.7 }]}>
            <SvgXml xml={GEAR} width={22} height={22} />
          </Pressable>
        </View>
        <Nerves logs={n.mine.length} />
        <View style={{ gap: 4 }}>
          <View style={s.xpBar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: need, now: into }}>
            <View style={{ width: `${Math.round((100 * into) / need)}%`, height: '100%', borderRadius: 5, backgroundColor: C.accent, borderRightWidth: 1.5, borderColor: C.ink }} />
          </View>
          <T v="small" style={{ fontFamily: F.semi }}>
            {p.xp} XP, {need - into} to Level {p.level + 1}
          </T>
        </View>
        <BaseMountains p={p} onOpen={onOpenBranch} />
        <View style={s.stats}>
          <Stat value={String(n.doneCount)} label="Moves done" />
          <Stat value={String(n.streak)} label="Streak" />
          <Stat value={String(n.kudosReceived)} label="Reactions" />
        </View>
      </Card>
      {stage > 0 ? (
        <Card>
          <T v="h">Stats</T>
          <StatsBlock p={p} />
          <T v="small">Every move trains one or two of these. Confidence builds Courage, Talk builds Warmth, Cues and Voice build Presence, Sell builds Persuasion.</T>
        </Card>
      ) : null}
      <Seg
        value={tab}
        onChange={setTab}
        options={[
          ...(stage < 2 ? [] : [{ key: 'paths' as const, label: 'Paths' }]),
          { key: 'awards' as const, label: 'Awards' },
          { key: 'people' as const, label: 'People' },
        ]}
      />
      {tab === 'awards' && stage === 0 ? (
        <View style={s.later}>
          <T v="sub" style={{ fontSize: 15, lineHeight: 21 }}>
            Your titles, patches and achievements show here after your first move.
          </T>
        </View>
      ) : null}
      {tab === 'awards' && stage > 0 ? (
        <>
      {stage >= 2 ? (
        <Card>
          <View style={{ gap: 4 }}>
            <T v="h">Patches</T>
            <T v="sub">
              Each patch is a playbook for a real situation: how to open, what to do if it goes flat or goes well, and how to leave. Finish a branch level or
              become a regular to earn one. Use it in three real conversations and it turns gold.
            </T>
          </View>
          <PatchWall onOpen={setCard} />
        </Card>
      ) : null}
      <Card>
        <View style={{ gap: 4 }}>
          <T v="eyebrow">Rewards</T>
          <T v="small">Finish a level to earn its title, badge and bonus XP. Tap an earned title to wear it next to your name.</T>
        </View>
        {rewardKeys.map((b) => (
          <View key={b} style={{ gap: 6 }}>
            <View style={s.pathHead}>
              <T style={[s.rwName, { color: HUE[b][0] }]}>{BRANCH[b].name}</T>
              <T v="small" style={{ fontFamily: F.semi }}>
                {p.levels[b]}/5 earned
              </T>
            </View>
            <View style={s.chips}>
              {TITLES[b].map((text, i) => {
                const key = `${b}${i + 1}`;
                const got = i < p.levels[b];
                const on = key === worn;
                return got ? (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${text}, ${TIERS[i]}${on ? ', wearing' : ', tap to wear'}`}
                    onPress={() => wear(on ? '' : key)}
                    style={[s.chip, { borderColor: HUE[b][0] }, on && { backgroundColor: HUE[b][1] }]}>
                    <T style={[s.chipText, { color: HUE[b][0] }]}>
                      {TIER_EMOJI[i]} {text}
                    </T>
                  </Pressable>
                ) : (
                  <View key={key} style={s.chip} accessibilityLabel={`${text}, locked. Finish ${lvTitle(b, i + 1)}.`}>
                    <T style={[s.chipText, { color: C.muted }]}>🔒 {text}</T>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        {rewardKeys.length < ALL_KEYS.length ? <T v="small">Titles for other branches and paths show here once you start them.</T> : null}
      </Card>
      <Card>
        <T v="eyebrow">
          Achievements, {ACH.filter((a) => p.ach[a.k].done).length}/{ACH.length}
        </T>
        <View style={s.achGrid}>
          {ACH.map((a) => {
            const st = p.ach[a.k];
            return (
              <View key={a.k} style={[s.ach, st.done && { borderColor: C.accent, backgroundColor: C.accentSoft }]}>
                <Emo e={a.e} size={34} dim={!st.done} />
                <T v="semi" style={{ fontSize: 15, lineHeight: 19 }}>
                  {a.t}
                </T>
                <T v="small" style={{ fontSize: 13, lineHeight: 17 }}>
                  {st.done ? `Earned, +${ACH_XP} XP` : a.d}
                </T>
                {st.done ? null : (
                  <T style={{ fontFamily: F.semi, fontSize: 12, color: C.muted }}>
                    {Math.min(st.n, a.of)}/{a.of}
                  </T>
                )}
              </View>
            );
          })}
        </View>
      </Card>
        </>
      ) : null}
      {tab === 'paths' ? (
        <>
      <Card>
        <View style={{ gap: 4 }}>
          <T v="h">Paths</T>
          <T v="small">
            Harder routes above base camp. A path opens when the branches it builds on are high enough and you have recordings to show for it. Each
            ends in a capstone that only counts with proof.
          </T>
        </View>
        <PathMountains p={p} onOpen={onOpenBranch} group="social" />
        {SOCIAL_PATHS.map(pathCard)}
        <Fold title="Paths for work and an audience" rule open={workOpen || workOn} onToggle={() => setWorkOpen((o) => !o)}>
          <View style={{ gap: 12 }}>
            <T v="small">Selling, negotiating and growing an audience. Same skills, pointed at work.</T>
            <PathMountains p={p} onOpen={onOpenBranch} group="work" />
            {WORK_PATHS.map(pathCard)}
          </View>
        </Fold>
      </Card>
        </>
      ) : null}

      {tab === 'people' ? (
        <>
      <Card>
        <View style={s.pathHead}>
          <T v="h">Your circle</T>
          <T v="small" style={{ fontFamily: F.semi }}>
            {n.followersOf(n.uid)} {n.followersOf(n.uid) === 1 ? 'follower' : 'followers'}
          </T>
        </View>
        {n.circle.length === 0 ? (
          <T v="sub">Nobody yet. Invite a friend from Account settings (the gear above), or tap Follow on someone’s line in Community.</T>
        ) : (
          n.circle.map((person, i) => {
            const shared = n.challengeWith(person.id);
            const mine = n.myChallengeTo(person.id);
            const last = n.lines.find((x) => x.author === person.id);
            return (
              <View key={person.id} style={[s.person, i > 0 && { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10 }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${person.name || 'Someone'}. Open profile`}
                  onPress={() => setProfile(person.id)}
                  style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, pressed && { opacity: 0.7 }]}>
                <Avatar name={person.name || 'Someone'} url={person.avatar_url} />
                <View style={{ flex: 1 }}>
                  <T v="semi" style={{ textDecorationLine: 'underline' }}>{person.name || 'Someone'}</T>
                  {shared ? (
                    <T v="small" style={{ color: C.accentText, fontFamily: F.semi }}>
                      Together: {BY[shared.move].title}
                    </T>
                  ) : (
                    <T v="small">{last ? `Last line ${stamp(last.created_at).toLowerCase()}` : 'No lines yet'}</T>
                  )}
                </View>
                </Pressable>
                <Btn
                  label="Unfollow"
                  kind="quiet"
                  small
                  disabled={busy === person.id}
                  onPress={async () => {
                    setBusy(person.id);
                    const problem = await n.toggleFollow(person.id);
                    setBusy('');
                    if (problem) onError(problem);
                  }}
                />
                <Btn
                  label={mine ? 'Undo' : 'Challenge'}
                  kind={mine ? 'quiet' : 'outline'}
                  small
                  disabled={busy === person.id}
                  onPress={async () => {
                    setBusy(person.id);
                    const problem = await n.toggleChallenge(person.id, mine ? mine.move : tonight.id);
                    setBusy('');
                    if (problem) onError(problem);
                  }}
                />
              </View>
            );
          })
        )}
        {n.circle.length > 0 ? <T v="small">Tap a name to see their titles, patches and lines. Challenge sends them your next move ({tonight.title}) until midnight.</T> : null}
      </Card>
        </>
      ) : null}
      {profile ? <Profile uid={profile} onClose={() => setProfile('')} onOpenMove={onOpenMove} onError={onError} /> : null}
      {settings ? <Settings onClose={() => setSettings(false)} onError={onError} onPreview={onPreview} /> : null}
      {card ? <CardSheet card={card} onClose={() => setCard(null)} onPractise={onOpenMove} onError={onError} /> : null}
    </ScrollView>
  );
}

// How nervous you expected to be against how it felt, across every move you reflected on.
function Nerves({ logs }: { logs: number }) {
  const [list, setList] = useState<Reflection[] | null>(null);
  useEffect(() => {
    let live = true;
    myReflections().then((rows) => {
      if (live) setList(rows);
    });
    return () => {
      live = false;
    };
  }, [logs]);
  const both = (list ?? []).filter((x) => x.nerve_before && x.nerve_after);
  const fears = (list ?? []).filter((x) => x.fear && x.feared);
  if (!both.length) {
    return (
      <View style={s.nerves}>
        <T v="small" style={{ fontFamily: F.semi }}>
          Your nerves
        </T>
        <T v="sub">After your first move, this shows how nervous you expected to be next to how it really felt.</T>
      </View>
    );
  }
  const avg = (k: 'nerve_before' | 'nerve_after') => both.reduce((t, x) => t + (x[k] ?? 0), 0) / both.length;
  const b = avg('nerve_before');
  const a = avg('nerve_after');
  const one = both.length === 1;
  const fmt = (v: number) => (one ? String(v) : v.toFixed(1));
  const hit = fears.filter((x) => x.feared === 'yes').length;
  return (
    <View style={s.nerves}>
      <T v="small" style={{ fontFamily: F.semi }}>
        Your nerves
      </T>
      <View style={s.nervesRow}>
        <View style={s.bars} accessible accessibilityLabel={`Nerves out of 5: ${fmt(b)} before, ${fmt(a)} during`}>
          <View style={s.barCol}>
            <View style={[s.bar, { height: Math.round(b * 15) }]} />
            <T v="small">Before</T>
          </View>
          <View style={s.barCol}>
            <View style={[s.bar, s.barNow, { height: Math.round(a * 15) }]} />
            <T v="small">During</T>
          </View>
        </View>
        <T style={s.nervesBig} numberOfLines={1} adjustsFontSizeToFit>{`${fmt(b)} → ${fmt(a)}`}</T>
      </View>
      <T>
        {`${one ? 'One move in: you' : `Across ${both.length} moves you`} braced for ${fmt(b)} and felt ${fmt(a)}.${b - a > 0.05 ? ' The dread keeps being bigger than the thing.' : ''}`}
      </T>
      {fears.length ? <T v="small">{`What you feared fully happened ${hit} of ${fears.length} ${fears.length === 1 ? 'time' : 'times'}.`}</T> : null}
    </View>
  );
}

// Four traits on a radar, each with its own level.
function StatsBlock({ p }: { p: Progress }) {
  const max = Math.max(100, ...STATS.map((st) => p.stats[st.k]));
  const cx = 90;
  const cy = 80;
  const R = 56;
  const ang = (i: number) => -Math.PI / 2 + (i * Math.PI) / 2;
  const pt = (i: number, f: number) => `${(cx + R * f * Math.cos(ang(i))).toFixed(1)},${(cy + R * f * Math.sin(ang(i))).toFixed(1)}`;
  const ring = (f: number) => `<polygon points="${STATS.map((_, i) => pt(i, f)).join(' ')}" fill="none" stroke="${C.line}" stroke-width="1"/>`;
  const shape = STATS.map((st, i) => pt(i, Math.max(0.06, Math.sqrt(p.stats[st.k] / max)))).join(' ');
  // Coloured dots mark each axis; the names sit in the list beside the chart, in the app font.
  const labels = STATS.map((st, i) => {
    const [x, y] = pt(i, 1.12).split(',').map(Number);
    return `<circle cx="${x}" cy="${y}" r="5" fill="${st.c}" stroke="${C.ink}" stroke-width="1.5"/>`;
  }).join('');
  const xml = `<svg viewBox="20 10 140 140">${ring(1)}${ring(0.66)}${ring(0.33)}<path d="M${pt(0, 1)} L${pt(2, 1)} M${pt(1, 1)} L${pt(3, 1)}" stroke="${C.line}"/><polygon points="${shape}" fill="rgba(255,106,26,0.22)" stroke="${C.accentText}" stroke-width="2" stroke-linejoin="round"/>${labels}</svg>`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <SvgXml xml={xml} width={130} height={130} />
      <View style={{ flex: 1, gap: 8 }}>
        {STATS.map((st) => {
          const v = p.stats[st.k];
          return (
            <View key={st.k} style={{ gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: st.c, borderWidth: 1.5, borderColor: C.ink }} />
                  <T style={{ fontFamily: F.displayBold, fontSize: 16, color: st.c }}>{st.name}</T>
                </View>
                <T style={{ fontFamily: F.semi, fontSize: 14 }}>Lv {statLevel(v)}</T>
              </View>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: C.bgDeep, overflow: 'hidden' }}>
                <View style={{ width: `${Math.round(100 * statProgress(v))}%`, height: '100%', backgroundColor: st.c }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.stat}>
      <T style={s.statNum} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </T>
      <T v="eyebrow" style={{ fontSize: 12 }} numberOfLines={1}>
        {label}
      </T>
    </View>
  );
}

const GEAR = `<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="none" stroke="${C.ink}" stroke-width="2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4 1 2-3.4Z" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/></svg>`;

const s = StyleSheet.create({
  gear: { width: 40, height: 40, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  invite: { gap: 10, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12, marginTop: 4 },
  codeField: {
    flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontFamily: F.displayBold, fontSize: 15, letterSpacing: 2, color: C.ink, backgroundColor: C.bg,
  },
  view: { padding: 16, gap: 12, paddingBottom: 32 },
  later: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  nerves: { gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
  nervesRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 18 },
  nervesBig: { fontFamily: F.display, fontSize: 42, lineHeight: 46, color: C.ink, marginBottom: 20 },
  bars: { flexDirection: 'row', gap: 12, alignItems: 'flex-end', height: 100 },
  barCol: { alignItems: 'center', gap: 4 },
  bar: { width: 40, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.bgDeep },
  barNow: { backgroundColor: C.accent },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: F.display, fontSize: 28, lineHeight: 30, color: C.ink },
  lvBadge: { width: 68, paddingVertical: 6, borderRadius: 8, backgroundColor: C.ink, alignItems: 'center' },
  lvWord: { fontFamily: F.semi, fontSize: 11, color: '#B8C2BC' },
  lvNum: { fontFamily: F.display, fontSize: 40, lineHeight: 42, color: C.surface },
  xpBar: { height: 10, borderRadius: 5, backgroundColor: C.bgDeep, overflow: 'hidden' },
  pathCard: { padding: 14, paddingTop: 0, borderRadius: 8, gap: 8, overflow: 'hidden' },
  pathArt: { marginHorizontal: -14, height: 96 },
  artTile: { position: 'absolute', right: 14, top: 10, borderWidth: 2, borderColor: C.ink },
  pathHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  pathName: { fontFamily: F.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.4, color: '#FFFFFF' },
  testRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rwName: { fontFamily: F.display, fontSize: 20, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: C.line },
  chipText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ach: { width: '48.5%', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: C.line, gap: 2 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, minWidth: 0, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, backgroundColor: C.bg, gap: 2 },
  statNum: { fontFamily: F.display, fontSize: 26, lineHeight: 30, color: C.ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
