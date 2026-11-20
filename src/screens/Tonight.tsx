import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNerve } from '../data';
import { BRANCH, BRANCH_KEYS, BY, CAP_REACTS, LEVELS, PATH, PATH_KEYS, isPath, label, levelDone, levelMoves, lvTitle, lvWord, type BranchKey } from '../moves';
import { HUE, TIERS, TIER_EMOJI, TITLES, branchState, levelBonus, moveXp, type Req } from '../progress';
import { C, F } from '../theme';
import { Btn, Card, Seg, T } from '../ui';

export function Tonight({ onOpenMove, initialBranch = 'c' }: { onOpenMove: (id: string) => void; initialBranch?: BranchKey }) {
  const n = useNerve();
  const [branch, setBranch] = useState<BranchKey>(initialBranch);
  const [refreshing, setRefreshing] = useState(false);
  const move = n.tonight.move;
  const mates = n.partnersFor(move.id);
  const p = n.progress;
  const path = isPath(branch);
  const pOpen = !path || !!p.open[branch];
  const [bc, bs] = HUE[branch];

  return (
    <ScrollView
      contentContainerStyle={s.view}
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
      <T v="sub">Do the move. Drop the line.</T>

      {n.incoming.map((c) => (
        <View key={c.id} style={s.invite}>
          <T style={{ flex: 1, fontSize: 15, lineHeight: 20 }}>
            <T v="semi" style={{ fontSize: 15 }}>
              {n.nameOf(c.author)}
            </T>{' '}
            challenged you: {BY[c.move].title}. Until midnight.
          </T>
          <Btn label="Open" small onPress={() => onOpenMove(c.move)} />
        </View>
      ))}

      <Card strong>
        <T v="accent">Tonight · {label(move)}</T>
        <T v="big">{move.title}</T>
        <T>{move.doIt}</T>
        {mates.length ? <T v="sub">With {mates.map(n.nameOf).join(', ')}. Until midnight.</T> : null}
        <View style={s.row}>
          <Btn label="Drop the line" kind="primary" onPress={() => onOpenMove(move.id)} />
          {!n.tonight.together ? <Btn label="Another one" kind="quiet" onPress={n.skipTonight} /> : null}
        </View>
      </Card>

      <Card>
        <View>
          <T v="h">Five branches</T>
          <T v="sub">Five levels each. Finish every move in a level to open the next. Paths open once your base is strong enough.</T>
        </View>
        <Seg
          tall
          value={branch}
          onChange={setBranch}
          color={HUE[branch][0]}
          options={BRANCH_KEYS.map((b) => ({ key: b, label: BRANCH[b].name, sub: branchState(b, p) }))}
        />
        <T v="eyebrow">Paths</T>
        <Seg
          tall
          value={branch}
          onChange={setBranch}
          color={HUE[branch][0]}
          options={PATH_KEYS.map((b) => ({ key: b, label: BRANCH[b].name, sub: branchState(b, p) }))}
        />
        <T v="sub">{BRANCH[branch].tag}</T>
        {path && !pOpen ? (
          <View style={s.gate}>
            <T v="semi">This path is locked</T>
            <T v="small">It opens when you have all of these:</T>
            <Gate reqs={p.paths[branch as 'n' | 'f'].reqs} />
          </View>
        ) : null}
        {LEVELS.map((k) => {
          const moves = levelMoves(branch, k);
          const open = pOpen && (k === 1 || levelDone(branch, k - 1, n.count));
          const done = moves.filter((m) => n.count[m.id]).length;
          const earned = open && done === moves.length;
          const by = path ? PATH[branch as 'n' | 'f'].by[k - 1] : '';
          return (
            <View key={k} style={{ gap: 8 }}>
              <View style={s.levelHead}>
                <T style={[s.levelName, !open && { color: C.muted }]}>{lvTitle(branch, k)}</T>
                <T style={[s.count, { color: open ? bc : C.muted }]}>{open ? `${done}/${moves.length}` : 'Locked'}</T>
              </View>
              {open ? (
                <View style={s.bar}>
                  <View style={{ width: `${Math.round((100 * done) / moves.length)}%`, height: '100%', borderRadius: 3, backgroundColor: bc }} />
                </View>
              ) : null}
              {by ? <T v="small">Built on ideas from {by}.</T> : null}
              {!open && pOpen ? (
                <T v="small">
                  Drop a line on every {lvWord(branch)} {k - 1} move to open {moves.length === 1 ? 'the capstone' : `these ${moves.length}`}.
                </T>
              ) : null}
              {open && path && k === 5 ? (
                <T v="small">The capstone counts once it is posted to the feed and {CAP_REACTS} people react.</T>
              ) : null}
              {moves.map((m) => {
                const lines = n.count[m.id] ?? 0;
                const pend = p.pending[m.id];
                return (
                  <Pressable
                    key={m.id}
                    accessibilityRole="button"
                    accessibilityLabel={open ? undefined : `${m.title}, locked`}
                    onPress={() => onOpenMove(m.id)}
                    style={({ pressed }) => [s.moveRow, !open && { opacity: 0.55 }, pressed && { opacity: 0.8 }]}>
                    <View style={[s.tile, { backgroundColor: lines > 0 ? bc : bs }]}>
                      <T style={[s.tileText, { color: lines > 0 ? C.accentInk : bc }, !open && { fontSize: 18 }]}>{open ? (m.cap ? '★' : m.i) : '🔒'}</T>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="semi" style={{ lineHeight: 21 }}>
                        {m.title}
                      </T>
                      {!open ? (
                        <T v="eyebrow" style={{ fontSize: 12 }}>
                          Locked
                        </T>
                      ) : null}
                    </View>
                    {lines > 0 ? (
                      <T style={[s.count, { color: bc }]}>{lines === 1 ? '1 line' : `${lines} lines`}</T>
                    ) : pend ? (
                      <T style={[s.count, { color: bc }]}>{pend.posted ? `${pend.reacts}/${CAP_REACTS} reactions` : 'Post it'}</T>
                    ) : open ? (
                      <T style={[s.count, { color: C.muted }]}>+{moveXp(m)} XP</T>
                    ) : null}
                  </Pressable>
                );
              })}
              <View style={[s.reward, { borderColor: open ? bc : C.line, backgroundColor: open ? bs : 'transparent', borderStyle: earned ? 'solid' : 'dashed' }, !open && { opacity: 0.7 }]}>
                <T style={{ fontSize: 22, width: 30 }}>{open ? TIER_EMOJI[k - 1] : '🔒'}</T>
                <View style={{ flex: 1 }}>
                  <T v="semi" style={{ fontSize: 16 }}>
                    {earned ? 'Earned: ' : 'Reward: '}
                    {TITLES[branch][k - 1]}
                  </T>
                  <T v="small" style={{ fontSize: 13 }}>
                    Title · {TIERS[k - 1]} badge · +{levelBonus(k, branch)} XP
                  </T>
                </View>
                {open ? <T style={[s.count, { color: earned ? bc : C.muted }]}>{earned ? '✓ Earned' : `${moves.length - done} to go`}</T> : null}
              </View>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}

// What a path needs, ticked off as you get there.
export function Gate({ reqs }: { reqs: Req[] }) {
  return (
    <View style={{ gap: 6 }}>
      {reqs.map((r) => (
        <View key={r.text} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
          <T style={{ width: 16, color: r.ok ? C.muted : C.ink }}>{r.ok ? '✓' : '○'}</T>
          <T style={{ flex: 1, fontSize: 15, lineHeight: 20, color: r.ok ? C.muted : C.ink }}>
            {r.text}
            {r.ok ? ' (done)' : ''}
          </T>
          <T style={{ fontFamily: F.semi, fontSize: 13, color: C.muted }}>{r.now}</T>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  gate: { padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line, gap: 8 },
  bar: { height: 6, borderRadius: 3, backgroundColor: C.bgDeep, overflow: 'hidden' },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, paddingRight: 14, borderRadius: 14, borderWidth: 1.5 },
  view: { padding: 16, gap: 12, paddingBottom: 32 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  invite: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingLeft: 16, borderRadius: 14, backgroundColor: C.accentSoft },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    backgroundColor: C.surface,
  },
  tile: { width: 48, height: 48, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: F.display, fontSize: 30, lineHeight: 34, color: C.accent },
  count: { fontFamily: F.semi, fontSize: 13, color: C.accent },
  levelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingTop: 8 },
  levelName: { fontFamily: F.display, fontSize: 22, lineHeight: 26, color: C.ink, flexShrink: 1 },
});
