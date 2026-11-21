import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { inviteCode, sendInvite } from '../invite';
import { useAuth } from '../auth';
import { LineCard, TitleChip } from '../components/LineCard';
import { BaseMountains, PathMountains } from '../components/Mountains';
import { BranchBanner, CardSheet, PatchWall } from '../components/Patches';
import { ArtImage, Emo } from '../components/ArtIcon';
import { BRANCH_ICON } from '../artImages';
import { SvgXml } from 'react-native-svg';
import type { Card as PlayCard } from '../rpgData';
import type { Reward } from '../components/Reward';
import { stamp, useNerve } from '../data';
import { ALL_KEYS, BRANCH, BY, MOVES, PATH_KEYS, lvTitle, type BranchKey } from '../moves';
import { ACH, ACH_XP, HUE, STATS, TIERS, TIER_EMOJI, TITLES, branchState, statLevel, statProgress, xpAt, type Progress } from '../progress';
import { Gate } from './Tonight';
import { C, F } from '../theme';
import { Avatar, Btn, Card, T } from '../ui';

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
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState('');
  const [card, setCard] = useState<PlayCard | null>(null);
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
        </View>
        <View style={{ gap: 4 }}>
          <View style={s.xpBar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: need, now: into }}>
            <View style={{ width: `${Math.round((100 * into) / need)}%`, height: '100%', borderRadius: 5, backgroundColor: C.accent, borderRightWidth: 1.5, borderColor: C.ink }} />
          </View>
          <T v="small" style={{ fontFamily: F.semi }}>
            {p.xp} XP · {need - into} to Level {p.level + 1}
          </T>
        </View>
        <BaseMountains p={p} onOpen={onOpenBranch} />
        <View style={s.stats}>
          <Stat value={`${n.doneCount}/${MOVES.length}`} label="Moves" />
          <Stat value={String(n.streak)} label="Streak" />
          <Stat value={String(n.kudosReceived)} label="Reactions" />
        </View>
      </Card>

      <Card>
        <T v="h">Stats</T>
        <StatsBlock p={p} />
        <T v="small">Every move trains one or two of these. Confidence builds Courage, Talk builds Warmth, Cues and Voice build Presence, Sell builds Persuasion.</T>
      </Card>

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

      <Card>
        <View style={{ gap: 4 }}>
          <T v="h">Paths</T>
          <T v="small">
            Harder routes above base camp. A path opens when the branches it builds on are high enough and you have recordings to show for it. Each
            ends in a capstone that only counts with proof.
          </T>
        </View>
        <PathMountains p={p} onOpen={onOpenBranch} />
        {PATH_KEYS.map((b) => {
          const info = p.paths[b];
          const met = info.reqs.filter((r) => r.ok).length;
          return (
            <View key={b} style={[s.pathCard, { backgroundColor: info.open ? HUE[b][0] : '#3A423E' }]}>
              <View style={[s.pathArt, !info.open && { opacity: 0.35 }]}>
                <BranchBanner b={b} height={96} glyphX={900} />
                <ArtImage src={BRANCH_ICON[b]} size={72} style={s.artTile} />
              </View>
              <View style={[s.pathHead, { marginTop: -34 }]}>
                <T style={s.pathName}>{BRANCH[b].name}</T>
                <T v="small" style={{ fontFamily: F.semi, color: 'rgba(255,255,255,0.8)' }}>
                  {info.open ? `${branchState(b, p)}${info.met ? '' : ' · tester'}` : `${met} of ${info.reqs.length} met`}
                </T>
              </View>
              <T v="small" style={{ color: 'rgba(255,255,255,0.86)' }}>
                {BRANCH[b].tag}
              </T>
              {info.open ? null : <Gate reqs={info.reqs} light />}
              <Btn label={info.open ? 'Open the path' : 'See the moves'} kind="light" small onPress={() => onOpenBranch(b)} style={{ alignSelf: 'flex-start' }} />
            </View>
          );
        })}
        <View style={s.testRow}>
          <Switch
            value={n.test}
            accessibilityLabel="Tester switch"
            onValueChange={(on) => {
              n.setTest(on);
              const first = PATH_KEYS.find((b) => !p.paths[b].met);
              if (on && first) onPreview({ levels: [], level: 0, ach: [], gained: 0, paths: [first], preview: true });
            }}
          />
          <T v="small" style={{ flex: 1 }}>
            Tester mode opens every path, place and patch so you can try them. It comes off before launch.
          </T>
        </View>
      </Card>

      <Card>
        <View style={{ gap: 4 }}>
          <T v="eyebrow">Rewards</T>
          <T v="small">Finish a level to earn its title, badge and bonus XP. Tap an earned title to wear it next to your name.</T>
        </View>
        {ALL_KEYS.map((b) => (
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
      </Card>

      <Card>
        <T v="eyebrow">
          Achievements · {ACH.filter((a) => p.ach[a.k].done).length}/{ACH.length}
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
                  {st.done ? `Earned · +${ACH_XP} XP` : a.d}
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

      <Card>
        <View style={s.pathHead}>
          <T v="h">Your circle</T>
          <T v="small" style={{ fontFamily: F.semi }}>
            {n.followersOf(n.uid)} {n.followersOf(n.uid) === 1 ? 'follower' : 'followers'}
          </T>
        </View>
        {n.circle.length === 0 ? (
          <T v="sub">Nobody yet. Invite a friend below, or tap Follow on someone’s line in the feed.</T>
        ) : (
          n.circle.map((person, i) => {
            const shared = n.challengeWith(person.id);
            const mine = n.myChallengeTo(person.id);
            const last = n.lines.find((x) => x.author === person.id);
            return (
              <View key={person.id} style={[s.person, i > 0 && { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10 }]}>
                <Avatar name={person.name || 'Someone'} url={person.avatar_url} />
                <View style={{ flex: 1 }}>
                  <T v="semi">{person.name || 'Someone'}</T>
                  {shared ? (
                    <T v="small" style={{ color: C.accentText, fontFamily: F.semi }}>
                      Together · {BY[shared.move].title}
                    </T>
                  ) : (
                    <T v="small">{last ? `Last line ${stamp(last.created_at).toLowerCase()}` : 'No lines yet'}</T>
                  )}
                </View>
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
        {n.circle.length > 0 ? <T v="small">Challenge sends them tonight’s move ({tonight.title}) until midnight.</T> : null}
        <Invite onError={onError} />
      </Card>

      {n.mine.some((x) => x.posted !== false) ? (
        <T v="eyebrow" style={{ paddingTop: 6, paddingHorizontal: 2 }}>
          Your lines
        </T>
      ) : null}
      {n.mine.filter((x) => x.posted !== false).map((line) => (
        <LineCard key={line.id} line={line} onOpenMove={onOpenMove} onError={onError} />
      ))}

      <Btn label="Sign out" kind="quiet" onPress={signOut} style={{ alignSelf: 'center', marginTop: 8 }} />
      {card ? <CardSheet card={card} onClose={() => setCard(null)} onPractise={onOpenMove} onError={onError} /> : null}
    </ScrollView>
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
  const labels = STATS.map((st, i) => {
    const [x, y] = pt(i, 1.22).split(',').map(Number);
    const anchor = i === 1 ? 'start' : i === 3 ? 'end' : 'middle';
    return `<text x="${x}" y="${y + (i === 0 ? -2 : i === 2 ? 10 : 4)}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="${st.c}">${st.name}</text>`;
  }).join('');
  const xml = `<svg viewBox="0 0 180 165">${ring(1)}${ring(0.66)}${ring(0.33)}<path d="M${pt(0, 1)} L${pt(2, 1)} M${pt(1, 1)} L${pt(3, 1)}" stroke="${C.line}"/><polygon points="${shape}" fill="rgba(255,106,26,0.22)" stroke="${C.accentText}" stroke-width="2" stroke-linejoin="round"/>${labels}</svg>`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <SvgXml xml={xml} width={150} height={138} />
      <View style={{ flex: 1, gap: 8 }}>
        {STATS.map((st) => {
          const v = p.stats[st.k];
          return (
            <View key={st.k} style={{ gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T style={{ fontFamily: F.displayBold, fontSize: 16, color: st.c }}>{st.name}</T>
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
      <T style={s.statNum}>{value}</T>
      <T v="eyebrow" style={{ fontSize: 12 }}>
        {label}
      </T>
    </View>
  );
}

function Invite({ onError }: { onError: (message: string) => void }) {
  const n = useNerve();
  const mine = inviteCode(n.uid);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState('');
  const send = async () => {
    const how = await sendInvite(mine);
    if (how === 'copied') setJoined('');
    setCopied(how === 'copied');
    if (how === 'failed') onError('Sharing didn’t open. Send your code instead: ' + mine);
  };
  const [copied, setCopied] = useState(false);
  const redeem = async () => {
    setBusy(true);
    const r = await n.redeemInvite(code);
    setBusy(false);
    if (r.problem) return onError(r.problem);
    setCode('');
    setJoined(r.who ?? 'your friend');
  };
  return (
    <View style={s.invite}>
      <View style={s.person}>
        <View style={{ flex: 1 }}>
          <T v="semi">Bring a friend</T>
          <T v="small">
            Your code is <T v="small" style={{ fontFamily: F.displayBold, color: C.ink, letterSpacing: 1 }}>{mine}</T>
          </T>
        </View>
        <Btn label="Invite friends" small onPress={send} />
      </View>
      <View style={s.person}>
        <TextInput
          accessibilityLabel="Friend's invite code"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().slice(0, 8))}
          placeholder="Got a code?"
          placeholderTextColor={C.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
          style={s.codeField}
        />
        <Btn label="Join" kind="outline" small disabled={busy || code.length !== 8} onPress={redeem} />
      </View>
      {copied ? <T v="small" style={{ color: C.accentText, fontFamily: F.semi }}>Invite copied. Paste it to a friend.</T> : null}
      {joined ? <T v="small" style={{ color: C.accentText, fontFamily: F.semi }}>You and {joined} are in each other’s circle now.</T> : null}
    </View>
  );
}

const s = StyleSheet.create({
  invite: { gap: 10, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12, marginTop: 4 },
  codeField: {
    flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontFamily: F.displayBold, fontSize: 15, letterSpacing: 2, color: C.ink, backgroundColor: C.bg,
  },
  view: { padding: 16, gap: 12, paddingBottom: 32 },
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
  stat: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: C.bg, gap: 2 },
  statNum: { fontFamily: F.display, fontSize: 30, lineHeight: 32, color: C.ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
