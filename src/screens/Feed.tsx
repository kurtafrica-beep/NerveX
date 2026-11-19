import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { LineCard } from '../components/LineCard';
import { useNerve } from '../data';
import { C } from '../theme';
import { Btn, Card, T } from '../ui';

export function Feed({ onOpenMove, onError }: { onOpenMove: (id: string) => void; onError: (message: string) => void }) {
  const n = useNerve();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <FlatList
      data={n.lines}
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
          <T v="sub">Lines from your circle. Give kudos or say something.</T>
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
  view: { padding: 16, paddingBottom: 32 },
  notice: { padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: C.muted },
});
