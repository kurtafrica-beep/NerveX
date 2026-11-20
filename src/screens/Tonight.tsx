import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNerve } from '../data';
import { BRANCH, BRANCH_KEYS, BY, LEVEL_NAMES, LEVELS, currentLevel, inLevel, label, levelDone, levelMoves, type BranchKey } from '../moves';
import { C, F } from '../theme';
import { Btn, Card, Seg, T } from '../ui';

export function Tonight({ onOpenMove, initialBranch = 'c' }: { onOpenMove: (id: string) => void; initialBranch?: BranchKey }) {
  const n = useNerve();
  const [branch, setBranch] = useState<BranchKey>(initialBranch);
  const [refreshing, setRefreshing] = useState(false);
  const move = n.tonight.move;
  const mates = n.partnersFor(move.id);

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
          <T v="sub">Five levels each. Finish every move in a level to open the next.</T>
        </View>
        <Seg
          tall
          value={branch}
          onChange={setBranch}
          options={BRANCH_KEYS.map((b) => ({ key: b, label: BRANCH[b].name, sub: `Lv ${currentLevel(b, n.count)}` }))}
        />
        <T v="sub">{BRANCH[branch].tag}</T>
        {LEVELS.map((k) => {
          const moves = levelMoves(branch, k);
          const open = k === 1 || levelDone(branch, k - 1, n.count);
          const done = moves.filter((m) => n.count[m.id]).length;
          return (
            <View key={k} style={{ gap: 8 }}>
              <View style={s.levelHead}>
                <T style={[s.levelName, !open && { color: C.muted }]}>
                  Level {k} · {LEVEL_NAMES[branch][k - 1]}
                </T>
                <T style={[s.count, !open && { color: C.muted }]}>{open ? `${done}/${moves.length}` : 'Locked'}</T>
              </View>
              {!open ? (
                <T v="small">
                  Drop a line on every Level {k - 1} move to open these {moves.length}.
                </T>
              ) : null}
              {moves.map((m) => {
                const lines = n.count[m.id] ?? 0;
                return (
                  <Pressable
                    key={m.id}
                    accessibilityRole="button"
                    accessibilityLabel={open ? undefined : `${m.title}, locked`}
                    onPress={() => onOpenMove(m.id)}
                    style={({ pressed }) => [s.moveRow, !open && { opacity: 0.55 }, pressed && { opacity: 0.8 }]}>
                    <View style={[s.tile, lines > 0 && { backgroundColor: C.accent }]}>
                      <T style={[s.tileText, lines > 0 && { color: C.accentInk }, !open && { fontSize: 18 }]}>{open ? inLevel(m.n) : '🔒'}</T>
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
                    {lines > 0 ? <T style={s.count}>{lines === 1 ? '1 line' : `${lines} lines`}</T> : null}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
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
