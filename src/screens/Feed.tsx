import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { LineCard, TitleChip } from '../components/LineCard';
import { ExpeditionCard, RopeTeam } from '../components/RopeTeam';
import { useNerve } from '../data';
import { useStage } from '../stage';
import { C, F } from '../theme';
import { Avatar, Btn, Card, Seg, T } from '../ui';

export function Feed({ onOpenMove, onError }: { onOpenMove: (id: string) => void; onError: (message: string) => void }) {
  const n = useNerve();
  const { stage, roped } = useStage();
  const [refreshing, setRefreshing] = useState(false);
  const [scope, setScope] = useState<'all' | 'circle'>('all');
  const [period, setPeriod] = useState<'week' | 'all'>('week');
  const lines = scope === 'circle' ? n.lines.filter((x) => x.author === n.uid || n.isFollowing(x.author)) : n.lines;
  const rows = n.board(period, scope === 'circle');
  const meAt = rows.findIndex((r) => r.uid === n.uid);
  const shown = rows.slice(0, 10);
  if (meAt >= 10) shown.push(rows[meAt]);

  return (
    <FlatList
      data={lines}
      keyExtractor={(line) => line.id}
      contentContainerStyle={s.view}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
      }
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 12 }}>
          {/* The expedition, rope team and leaderboard show after three moves, so a first visit is just people's lines. */}
          {stage >= 2 ? <ExpeditionCard /> : null}
          {stage >= 2 || roped ? <RopeTeam onError={onError} onOpenMove={onOpenMove} /> : null}
          <T v="sub">Lines from your circle. React or say something.</T>
          <Seg
            tall
            value={scope}
            onChange={setScope}
            options={[
              { key: 'all', label: 'Everyone' },
              { key: 'circle', label: 'Your circle' },
            ]}
          />
          {stage < 2 ? null : (
          <Card style={{ gap: 10 }}>
            <View style={s.boardHead}>
              <T v="h" style={{ fontSize: 24, lineHeight: 28 }}>
                Leaderboard
              </T>
              <Seg
                value={period}
                onChange={setPeriod}
                options={[
                  { key: 'week', label: 'This week' },
                  { key: 'all', label: 'All time' },
                ]}
              />
            </View>
            {shown.map((r) => {
              const rank = rows.indexOf(r) + 1;
              const me = r.uid === n.uid;
              return (
                <View key={r.uid} style={[s.boardRow, me && s.boardMe, rank > 10 && { marginTop: 6 }]}>
                  <T style={s.rank}>{r.pts && rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : String(rank)}</T>
                  <Avatar name={n.nameOf(r.uid)} url={n.profiles[r.uid]?.avatar_url} size={36} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      <T v="semi" style={{ fontSize: 16 }}>
                        {n.nameOf(r.uid)}
                      </T>
                      <TitleChip uid={r.uid} />
                    </View>
                    <T v="small" style={{ fontSize: 13 }}>
                      {r.lines} {r.lines === 1 ? 'line' : 'lines'}, {r.reacts} {r.reacts === 1 ? 'reaction' : 'reactions'}
                    </T>
                  </View>
                  <T style={s.pts}>{r.pts} pts</T>
                </View>
              );
            })}
            <T v="small">
              {rows.length < 2 ? (scope === 'circle' ? 'Just you so far. Follow people from the feed to add them. ' : 'Just you so far. ') : ''}
              10 points per line you post, 20 if it has a recording, and 2 per reaction from someone else. Up to 5 lines a day count.
              {period === 'week' ? ' Resets every Monday.' : ''}
            </T>
          </Card>
          )}
          {n.error ? (
            <View style={s.notice}>
              <T v="small">{n.error}</T>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !n.loaded ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 32 }} />
        ) : n.error ? undefined : (
          <Card>
            <T v="h">No lines yet</T>
            <T v="sub">The first one is yours. Open tonight’s move, do it, and write what happened.</T>
            <Btn label="Open tonight’s move" kind="primary" onPress={() => onOpenMove(n.tonight.move.id)} style={{ alignSelf: 'flex-start' }} />
          </Card>
        )
      }
      renderItem={({ item }) => <LineCard line={item} onOpenMove={onOpenMove} onError={onError} />}
    />
  );
}

const s = StyleSheet.create({
  boardHead: { gap: 10 },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6 },
  boardMe: { backgroundColor: C.bg, borderWidth: 2, borderColor: C.ink },
  rank: { width: 26, textAlign: 'center', fontFamily: F.display, fontSize: 18 },
  pts: { fontFamily: F.display, fontSize: 18, color: C.ink },
  view: { padding: 16, paddingBottom: 32 },
  notice: { padding: 12, borderRadius: 6, borderWidth: 1, borderStyle: 'dashed', borderColor: C.muted },
});
