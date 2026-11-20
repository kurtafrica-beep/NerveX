import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useAuth } from '../auth';
import { LineCard, TitleChip } from '../components/LineCard';
import { BaseMountains, PathMountains } from '../components/Mountains';
import type { Reward } from '../components/Reward';
import { stamp, useNerve } from '../data';
import { ALL_KEYS, BRANCH, BY, MOVES, PATH_KEYS, lvTitle, type BranchKey } from '../moves';
import { ACH, ACH_XP, HUE, TIERS, TIER_EMOJI, TITLES, branchState, xpAt } from '../progress';
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
            <T style={s.lvWord}>LEVEL</T>
            <T style={s.lvNum}>{p.level}</T>
          </View>
        </View>
        <View style={{ gap: 4 }}>
          <View style={s.xpBar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: need, now: into }}>
            <View style={{ width: `${Math.round((100 * into) / need)}%`, height: '100%', borderRadius: 5, backgroundColor: C.accent }} />
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
        <View style={{ gap: 4 }}>
          <T v="eyebrow">Paths</T>
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
            <View key={b} style={[s.pathCard, info.open ? { backgroundColor: HUE[b][1] } : s.pathShut]}>
              <View style={s.pathHead}>
                <T style={[s.pathName, { color: info.open ? HUE[b][0] : C.ink }]}>{BRANCH[b].name}</T>
                <T v="small" style={{ fontFamily: F.semi }}>
                  {info.open ? `${branchState(b, p)}${info.met ? '' : ' · tester'}` : `${met} of ${info.reqs.length} met`}
                </T>
              </View>
              <T v="small">{BRANCH[b].tag}</T>
              {info.open ? null : <Gate reqs={info.reqs} />}
              <Btn label={info.open ? 'Open the path' : 'See the moves'} small onPress={() => onOpenBranch(b)} style={{ alignSelf: 'flex-start' }} />
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
            Tester switch: open the paths without meeting the requirements. For trying things out. It comes off before launch.
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
                <T style={{ fontSize: 24, opacity: st.done ? 1 : 0.4 }}>{a.e}</T>
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
        <T v="eyebrow">Circle</T>
        {n.circle.length === 0 ? (
          <T v="sub">Nobody here yet. Anyone who installs Nerve and signs in shows up in your circle.</T>
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
                    <T v="small" style={{ color: C.accent, fontFamily: F.semi }}>
                      Together · {BY[shared.move].title}
                    </T>
                  ) : (
                    <T v="small">{last ? `Last line ${stamp(last.created_at).toLowerCase()}` : 'No lines yet'}</T>
                  )}
                </View>
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
    </ScrollView>
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

const s = StyleSheet.create({
  view: { padding: 16, gap: 12, paddingBottom: 32 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: F.display, fontSize: 28, lineHeight: 30, color: C.ink },
  lvBadge: { width: 68, paddingVertical: 6, borderRadius: 14, backgroundColor: C.ink, alignItems: 'center' },
  lvWord: { fontFamily: F.semi, fontSize: 11, letterSpacing: 1, color: '#B8BAC2' },
  lvNum: { fontFamily: F.display, fontSize: 40, lineHeight: 42, color: C.surface },
  xpBar: { height: 10, borderRadius: 5, backgroundColor: C.bgDeep, overflow: 'hidden' },
  pathCard: { padding: 14, borderRadius: 14, gap: 8 },
  pathShut: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  pathHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  pathName: { fontFamily: F.display, fontSize: 24, lineHeight: 26 },
  testRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rwName: { fontFamily: F.display, fontSize: 20, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: C.line },
  chipText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ach: { width: '48.5%', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, gap: 2 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: C.bg, gap: 2 },
  statNum: { fontFamily: F.display, fontSize: 30, lineHeight: 32, color: C.ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
