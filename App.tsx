import { Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold } from '@expo-google-fonts/barlow';
import { BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth';
import { DataProvider, useNerve } from './src/data';
import type { BranchKey } from './src/moves';
import { Feed } from './src/screens/Feed';
import { MoveScreen } from './src/screens/MoveScreen';
import { SignIn } from './src/screens/SignIn';
import { Tonight } from './src/screens/Tonight';
import { You } from './src/screens/You';
import { C, F } from './src/theme';
import { Icon, T, type IconName } from './src/ui';

type Tab = 'feed' | 'tonight' | 'you';

export default function App() {
  const [fontsReady] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
  });
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>{fontsReady ? <Root /> : <View style={s.blank} />}</AuthProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const { session, ready } = useAuth();
  if (!ready) return <View style={s.blank} />;
  if (!session) return <SignIn />;
  return (
    <DataProvider key={session.user.id} uid={session.user.id}>
      <Shell />
    </DataProvider>
  );
}

function Shell() {
  const n = useNerve();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('tonight');
  const [branch, setBranch] = useState<BranchKey>('c');
  const [moveId, setMoveId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);
  const closeMove = useCallback(() => setMoveId(null), []);

  // Android back from Feed or You returns to Tonight; from Tonight it leaves the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab !== 'tonight') {
        setTab('tonight');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [tab]);

  return (
    <View style={s.app}>
      <View style={[s.bar, { paddingTop: insets.top + 8 }]}>
        <T style={s.wordmark}>NERVE</T>
        <View style={s.chip}>
          <T style={s.chipText}>{n.streak > 1 ? `${n.streak}-day streak` : `${n.mine.length} log`}</T>
        </View>
      </View>

      {toast ? (
        <View style={s.toast}>
          <T style={{ color: C.surface, fontSize: 15, lineHeight: 20 }}>{toast}</T>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        {tab === 'feed' ? <Feed onOpenMove={setMoveId} onError={showError} /> : null}
        {tab === 'tonight' ? <Tonight key={branch} initialBranch={branch} onOpenMove={setMoveId} /> : null}
        {tab === 'you' ? (
          <You
            onOpenMove={setMoveId}
            onOpenBranch={(b) => {
              setBranch(b);
              setTab('tonight');
            }}
            onError={showError}
          />
        ) : null}
      </View>

      <View style={[s.nav, { paddingBottom: insets.bottom + 8 }]}>
        <NavItem icon="feed" label="Feed" on={tab === 'feed'} onPress={() => setTab('feed')} />
        <NavItem icon="tonight" label="Tonight" on={tab === 'tonight'} onPress={() => setTab('tonight')} />
        <View style={s.navSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Drop a line for tonight’s move"
            onPress={() => setMoveId(n.tonight.move.id)}
            style={({ pressed }) => [s.plus, pressed && { opacity: 0.85 }]}>
            <Icon name="plus" size={32} color={C.accentInk} width={2.5} />
          </Pressable>
        </View>
        <NavItem icon="you" label="You" on={tab === 'you'} onPress={() => setTab('you')} />
      </View>

      {moveId ? (
        <MoveScreen
          key={moveId}
          moveId={moveId}
          onClose={closeMove}
          onPosted={() => {
            setMoveId(null);
            setTab('feed');
          }}
        />
      ) : null}
    </View>
  );
}

function NavItem({ icon, label, on, onPress }: { icon: IconName; label: string; on: boolean; onPress: () => void }) {
  const color = on ? C.ink : C.muted;
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={onPress} style={s.navSlot}>
      <Icon name={icon} color={color} />
      <T style={{ fontFamily: F.semi, fontSize: 13, lineHeight: 16, color }}>{label}</T>
    </Pressable>
  );
}

const s = StyleSheet.create({
  blank: { flex: 1, backgroundColor: C.bg },
  app: { flex: 1, backgroundColor: C.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  wordmark: { fontFamily: F.display, fontSize: 34, lineHeight: 36, color: C.ink },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  chipText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.ink },
  toast: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: C.danger },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.surface,
  },
  navSlot: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 2 },
  plus: {
    width: 66,
    height: 66,
    borderRadius: 33,
    marginTop: -30,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: C.accent,
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
  },
});
