import { Overpass_400Regular, Overpass_600SemiBold, Overpass_700Bold, Overpass_800ExtraBold, Overpass_900Black } from '@expo-google-fonts/overpass';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth';
import { VideoHost } from './src/components/VideoSheet';
import { RewardSheet, XpToast, diff, isBig, snap, type Reward, type Snap } from './src/components/Reward';
import { DataProvider, useNerve } from './src/data';
import type { BranchKey } from './src/moves';
import { Feed } from './src/screens/Feed';
import { MoveScreen } from './src/screens/MoveScreen';
import { SignIn } from './src/screens/SignIn';
import { Tonight } from './src/screens/Tonight';
import { You } from './src/screens/You';
import { QuickRecorder } from './src/components/QuickRecorder';
import { C, F } from './src/theme';
import { Icon, T, type IconName } from './src/ui';

type Tab = 'feed' | 'tonight' | 'you';

export default function App() {
  const [fontsReady] = useFonts({
    Overpass_400Regular,
    Overpass_600SemiBold,
    Overpass_700Bold,
    Overpass_800ExtraBold,
    Overpass_900Black,
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
  const [recOpen, setRecOpen] = useState(false);
  const [recMode, setRecMode] = useState<'idle' | 'manual' | 'auto'>('idle');
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

  // Celebrate what is new: compare progress with how it was a moment ago.
  const [reward, setReward] = useState<Reward | null>(null);
  const [xpText, setXpText] = useState('');
  const prev = useRef<Snap | null>(null);
  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { progress, test, loaded } = n;
  useEffect(() => {
    if (!loaded) return;
    const now = snap(progress, test);
    const before = prev.current;
    prev.current = now;
    if (!before) return;
    const r = diff(before, now);
    if (!r) return;
    if (isBig(r)) {
      setReward(r);
      return;
    }
    setXpText(`+${r.gained} XP`);
    if (xpTimer.current) clearTimeout(xpTimer.current);
    xpTimer.current = setTimeout(() => setXpText(''), 1800);
  }, [progress, test, loaded]);

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
        <View style={s.brand}>
          <View style={s.blaze} />
          <T style={s.wordmark}>nerve</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {recMode !== 'idle' ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Recording. Open quick take." onPress={() => setRecOpen(true)} style={s.recChip}>
              <View style={s.recDot} />
              <T style={[s.chipText, { color: '#FFFFFF' }]}>{recMode === 'auto' ? 'Listening' : 'Rec'}</T>
            </Pressable>
          ) : null}
          <View style={s.chip}>
            <T style={s.chipText}>{`Lv ${n.progress.level} · ${n.progress.xp} XP`}</T>
          </View>
        </View>
      </View>

      {toast ? (
        <View style={s.toast}>
          <T style={{ color: C.surface, fontSize: 15, lineHeight: 20 }}>{toast}</T>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        {tab === 'feed' ? <Feed onOpenMove={setMoveId} onError={showError} /> : null}
        {tab === 'tonight' ? <Tonight key={branch} initialBranch={branch} onOpenMove={setMoveId} onRecord={() => setRecOpen(true)} /> : null}
        {tab === 'you' ? (
          <You
            onOpenMove={setMoveId}
            onPreview={setReward}
            onOpenBranch={(b) => {
              setBranch(b);
              setTab('tonight');
            }}
            onError={showError}
          />
        ) : null}
      </View>

      <QuickRecorder visible={recOpen} onClose={() => setRecOpen(false)} onError={showError} onMode={setRecMode} />

      <View style={[s.nav, { paddingBottom: insets.bottom + 8 }]}>
        <NavItem icon="tonight" label="Tonight" on={tab === 'tonight'} onPress={() => setTab('tonight')} />
        <View style={s.navSlot}>
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="You"
            accessibilityState={{ selected: tab === 'you' }}
            onPress={() => setTab('you')}
            style={({ pressed }) => [s.you, tab === 'you' && s.youOn, pressed && { opacity: 0.85 }]}>
            <Icon name="you" size={26} color={C.accentInk} width={2.2} />
            <T style={s.youLv}>{`Lv ${n.progress.level}`}</T>
          </Pressable>
        </View>
        <NavItem icon="feed" label="Feed" on={tab === 'feed'} onPress={() => setTab('feed')} />
      </View>

      {xpText ? <XpToast text={xpText} /> : null}
      <VideoHost />
      {reward ? (
        <RewardSheet
          r={reward}
          onClose={() => setReward(null)}
          onWear={async (key) => {
            setReward(null);
            const problem = await n.wearTitle(key);
            if (problem) showError(problem);
          }}
        />
      ) : null}

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
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  blaze: { width: 9, height: 26, borderRadius: 2, backgroundColor: C.accent, borderWidth: 2, borderColor: C.ink },
  wordmark: { fontFamily: F.display, fontSize: 30, lineHeight: 38, letterSpacing: -0.6, color: C.ink },
  recChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: C.rec },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  chipText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.ink },
  toast: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: C.danger },
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
  // The You button sits fully inside the bar: Android ignores taps on anything drawn outside its parent.
  you: {
    width: 62,
    height: 60,
    borderRadius: 14,
    backgroundColor: C.accent,
    borderWidth: 2,
    borderColor: C.ink,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youOn: { backgroundColor: '#FF8A45' },
  youLv: { fontFamily: F.semi, fontSize: 11, lineHeight: 13, color: C.accentInk, letterSpacing: 0.5 },
});
