import { Overpass_400Regular, Overpass_600SemiBold, Overpass_700Bold, Overpass_800ExtraBold, Overpass_900Black } from '@expo-google-fonts/overpass';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth';
import { VideoHost } from './src/components/VideoSheet';
import { RewardSheet, XpToast, diff, isBig, snap, type Reward, type Snap } from './src/components/Reward';
import { DataProvider, useNerve } from './src/data';
import { Intro } from './src/components/Intro';
import { RopeProvider, useRope } from './src/rope';
import { StageProvider, useStage } from './src/stage';
import { Feed } from './src/screens/Feed';
import { MoveScreen } from './src/screens/MoveScreen';
import { NewPassword } from './src/screens/NewPassword';
import { SignIn } from './src/screens/SignIn';
import { Tonight } from './src/screens/Tonight';
import { You } from './src/screens/You';
import { QuickRecorder } from './src/components/QuickRecorder';
import { takePendingInvite } from './src/invite';
import { C, F } from './src/theme';
import { Icon, T, type IconName } from './src/ui';

type Tab = 'feed' | 'tonight' | 'you';

if (Platform.OS === 'web' && typeof document !== 'undefined') document.body.style.backgroundColor = C.bg;

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
      {/* On a wide browser window, keep the app phone-width in the middle. */}
      <View style={Platform.OS === 'web' ? s.webFrame : s.fill}>
        <AuthProvider>{fontsReady ? <Root /> : <View style={s.blank} />}</AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

function Root() {
  const { session, ready, recovering } = useAuth();
  if (!ready) return <View style={s.blank} />;
  if (!session) return <SignIn />;
  if (recovering) return <NewPassword />;
  return (
    <DataProvider key={session.user.id} uid={session.user.id}>
      <RopeProvider>
        <StageProvider>
          <Shell />
        </StageProvider>
      </RopeProvider>
    </DataProvider>
  );
}

function Shell() {
  const n = useNerve();
  const rope = useRope();
  const stage = useStage();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('tonight');
  const [recOpen, setRecOpen] = useState(false);
  const [recMode, setRecMode] = useState<'idle' | 'manual' | 'auto'>('idle');
  const [moveId, setMoveId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);
  const closeMove = useCallback(() => setMoveId(null), []);
  const [note, setNote] = useState('');

  // Opened from a friend's invite link: put you both in each other's circle.
  const { redeemInvite } = n;
  const inviteChecked = useRef(false);
  // Looking at the Feed clears the rope team dot (invites stay until answered).
  const ropeEvents = rope.events.length;
  const markSeen = rope.markSeen;
  useEffect(() => {
    if (tab === 'feed') markSeen();
  }, [tab, ropeEvents, markSeen]);
  useEffect(() => {
    if (inviteChecked.current) return;
    inviteChecked.current = true;
    takePendingInvite().then(async (code) => {
      if (!code) return;
      const r = await redeemInvite(code);
      if (r.who) setNote(`You and ${r.who} are in each other’s circle.`);
      else if (r.problem) showError(r.problem);
    });
  }, [redeemInvite, showError]);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(''), 5000);
    return () => clearTimeout(t);
  }, [note]);

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
            <T style={s.chipText} numberOfLines={1}>
              {!n.mine.length ? 'Day one' : `Lv ${n.progress.level}, ${n.streak ? `${n.streak}-day streak` : `${n.progress.xp} XP`}`}
            </T>
          </View>
          {recMode === 'idle' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quick take: record voice or video now, add it to a move later"
              onPress={() => setRecOpen(true)}
              style={({ pressed }) => [s.plus, pressed && { transform: [{ translateY: 2 }], borderBottomWidth: 2 }]}>
              <Icon name="plus" size={22} color={C.ink} width={2.6} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {note ? (
        <Pressable style={s.note} onPress={() => setNote('')} accessibilityRole="alert">
          <T style={{ color: C.ink, fontSize: 15, lineHeight: 20, fontFamily: F.semi }}>{note}</T>
        </Pressable>
      ) : null}
      {toast ? (
        <View style={s.toast}>
          <T style={{ color: C.surface, fontSize: 15, lineHeight: 20 }}>{toast}</T>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        {tab === 'feed' ? <Feed onOpenMove={setMoveId} onError={showError} /> : null}
        {tab === 'tonight' ? <Tonight onOpenMove={setMoveId} /> : null}
        {tab === 'you' ? (
          <You
            onOpenMove={setMoveId}
            onPreview={setReward}
            onOpenBranch={(b) => {
              n.setBranch(b);
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
            <Icon name="you" size={26} color={C.surface} width={2.2} />
            <T style={s.youLv}>You</T>
          </Pressable>
        </View>
        <NavItem icon="feed" label="Feed" on={tab === 'feed'} dot={rope.unseen > 0} onPress={() => setTab('feed')} />
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

      {stage.intro && !moveId ? (
        <Intro
          onSkip={stage.closeIntro}
          onStart={() => {
            stage.closeIntro();
            setTab('tonight');
            setMoveId(n.tonight.move.id);
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

function NavItem({ icon, label, on, onPress, dot }: { icon: IconName; label: string; on: boolean; onPress: () => void; dot?: boolean }) {
  const color = on ? C.ink : C.muted;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={dot ? `${label}, new from your rope team` : label}
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={s.navSlot}>
      <View>
        <Icon name={icon} color={color} />
        {dot ? <View style={s.dot} /> : null}
      </View>
      <T style={{ fontFamily: F.semi, fontSize: 13, lineHeight: 16, color }}>{label}</T>
      <View style={[s.tabLine, on && s.tabLineOn]} />
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
  plus: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent, borderWidth: 2, borderColor: C.ink, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center' },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  chipText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.ink },
  fill: { flex: 1 },
  webFrame: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', overflow: 'hidden' },
  note: { marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: C.accent },
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
  tabLine: { width: 32, height: 4, marginTop: 2, borderRadius: 2, borderWidth: 1.5, borderColor: 'transparent' },
  tabLineOn: { backgroundColor: C.accent, borderColor: C.ink },
  dot: { position: 'absolute', top: -2, right: -6, width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.ink },
  navSlot: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 2 },
  // The You button sits fully inside the bar: Android ignores taps on anything drawn outside its parent.
  you: {
    width: 62,
    height: 60,
    borderRadius: 14,
    backgroundColor: C.ink,
    borderWidth: 2,
    borderColor: C.ink,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youOn: { borderBottomColor: C.accent },
  youLv: { fontFamily: F.semi, fontSize: 11, lineHeight: 13, color: C.surface, letterSpacing: 0.5 },
});
