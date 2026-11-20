import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useAuth } from '../auth';
import { LineCard } from '../components/LineCard';
import { Tree } from '../components/Tree';
import { stamp, useNerve } from '../data';
import { BY, type BranchKey } from '../moves';
import { C, F } from '../theme';
import { Avatar, Btn, Card, T } from '../ui';

export function You({
  onOpenMove,
  onOpenBranch,
  onError,
}: {
  onOpenMove: (id: string) => void;
  onOpenBranch: (b: BranchKey) => void;
  onError: (message: string) => void;
}) {
  const n = useNerve();
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState('');
  const tonight = n.tonight.move;

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
          <View style={{ flex: 1 }}>
            <T v="eyebrow">Your tree</T>
            <T v="semi">{n.nameOf(n.uid)}</T>
          </View>
          <View style={s.log}>
            <T style={s.logNum}>{n.mine.length}</T>
            <T style={s.logWord}>LOG</T>
          </View>
        </View>
        <Tree count={n.count} onOpenBranch={onOpenBranch} />
        <View style={s.stats}>
          <Stat value={`${n.doneCount}/150`} label="Moves" />
          <Stat value={String(n.streak)} label="Streak" />
          <Stat value={String(n.kudosReceived)} label="Kudos" />
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

      {n.mine.length > 0 ? (
        <T v="eyebrow" style={{ paddingTop: 6, paddingHorizontal: 2 }}>
          Your lines
        </T>
      ) : null}
      {n.mine.map((line) => (
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
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  log: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  logNum: { fontFamily: F.display, fontSize: 64, lineHeight: 62, color: C.accent },
  logWord: { fontFamily: F.display, fontSize: 20, color: C.ink },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: C.bg, gap: 2 },
  statNum: { fontFamily: F.display, fontSize: 30, lineHeight: 32, color: C.ink },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
