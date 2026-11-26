import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { LineCard, TitleChip } from '../components/LineCard';
import { Irl } from '../components/Irl';
import { RopeTeam } from '../components/RopeTeam';
import { inviteCode, sendInvite } from '../invite';
import { useNerve } from '../data';
import { useStage } from '../stage';
import { Profile } from '../components/Profile';
import { C, F } from '../theme';
import { Avatar, Btn, Card, Seg, T } from '../ui';

export function Feed({ onOpenMove, onError }: { onOpenMove: (id: string) => void; onError: (message: string) => void }) {
  const n = useNerve();
  const { stage, roped } = useStage();
  const [refreshing, setRefreshing] = useState(false);
  // Feed: everyone's lines and the leaderboard. Your circle: the rope team with friends.
  const [scope, setScope] = useState<'feed' | 'circle'>('feed');
  const [copied, setCopied] = useState('');
  const [period, setPeriod] = useState<'week' | 'all'>('week');
  const [profile, setProfile] = useState('');
  const lines = scope === 'feed' ? n.lines : [];
  const rows = n.board(period, false);
  // Someone who follows you back. With none, Your circle says Nerve works solo and how to add a friend.
  const mutual = n.following.filter((u) => n.isFollowedBy(u)).length;
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
          <Irl onError={onError} />
          <Seg
            tall
            value={scope}
            onChange={setScope}
            options={[
              { key: 'feed', label: 'Feed' },
              { key: 'circle', label: 'Your circle' },
            ]}
          />
          <T v="sub">{scope === 'feed' ? 'Who’s moving most, and what people did. React or say something.' : 'Climb this week with friends.'}</T>
          {scope === 'circle' ? (
            mutual === 0 && !roped ? (
              <Card strong>
                <T v="h">Nerve works on your own</T>
                <T v="sub">Your moves, warm-ups and nerves are all on Moves and You. Add one friend and this tab fills with a rope team you climb with each week.</T>
                <Btn
                  label="Send an invite"
                  kind="primary"
                  style={{ alignSelf: 'flex-start' }}
                  onPress={async () => {
                    const r = await sendInvite(inviteCode(n.uid));
                    setCopied(r === 'copied' ? 'Invite copied. Paste it to a friend.' : r === 'failed' ? 'That didn’t work. Your code is in Account settings.' : '');
                  }}
                />
                {copied ? <T v="small">{copied}</T> : null}
              </Card>
            ) : (
              <RopeTeam onError={onError} onOpenMove={onOpenMove} />
            )
          ) : null}
          {stage < 2 || scope !== 'feed' ? null : (
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
                <Pressable key={r.uid} accessibilityRole="button" accessibilityLabel={`${rank}. ${n.nameOf(r.uid)}, ${r.pts} points. Open profile`} onPress={() => setProfile(r.uid)} style={[s.boardRow, me && s.boardMe, rank > 10 && { marginTop: 6 }]}>
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
                </Pressable>
              );
            })}
            <T v="small">
              {rows.length < 2 ? 'Just you so far. ' : ''}
              10 points per line you post, 20 if it has a recording, and 2 per reaction from someone else. Up to 5 lines a day count.
              {period === 'week' ? ' Resets every Monday.' : ''}
            </T>
          </Card>
          )}
          {profile ? <Profile uid={profile} onClose={() => setProfile('')} onOpenMove={onOpenMove} onError={onError} /> : null}
          {n.error ? (
            <View style={s.notice}>
              <T v="small">{n.error}</T>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        scope !== 'feed' ? undefined : !n.loaded ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 32 }} />
        ) : n.error ? undefined : (
          <Card>
            <T v="h">No lines yet</T>
            <T v="sub">The first one is yours. Open your next move, do it, and write what happened.</T>
            <Btn label="Open your next move" kind="primary" onPress={() => onOpenMove(n.tonight.move.id)} style={{ alignSelf: 'flex-start' }} />
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
