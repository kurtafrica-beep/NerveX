import React, { useEffect, useState } from 'react';
import { Animated, BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNerve } from '../data';
import { C, F } from '../theme';
import { Btn, T } from '../ui';

// First run: three screens that say what Nerve is for, ending on your first move.
const SCREENS = [
  { t: 'Nervous around people?', p: 'Nerve is practice for that. Small, real things to do with real people, starting very small.' },
  { t: 'One move a day', p: 'Say how nervous you are, go do it, then say how it really felt. Most days the dread is bigger than the thing.' },
  { t: 'Then tell your circle', p: 'Post one line about what happened. Friends on Nerve see it and back you up. Nothing is shared until you post it.' },
];

export function Intro({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const n = useNerve();
  const insets = useSafeAreaInsets();
  const [at, setAt] = useState(0);
  const [fade] = useState(() => new Animated.Value(0));
  const last = at === SCREENS.length - 1;
  const move = n.tonight.move;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [at, fade]);
  // Android back: one screen back, or out of the intro from the first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (at > 0) setAt(at - 1);
      else onSkip();
      return true;
    });
    return () => sub.remove();
  }, [at, onSkip]);

  const sc = SCREENS[at];
  return (
    <View style={[s.screen, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 18 }]} accessibilityViewIsModal>
      <View style={s.brand}>
        <View style={s.blaze} />
        <T style={s.wordmark}>nerve</T>
      </View>
      <ScrollView contentContainerStyle={s.body}>
        <Animated.View style={{ gap: 14, opacity: fade, transform: [{ translateX: fade.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
          <T style={s.count}>{`${at + 1} of ${SCREENS.length}`}</T>
          <T style={s.title} accessibilityRole="header">
            {sc.t}
          </T>
          <T style={s.text}>{sc.p}</T>
          {at === 1 ? (
            <View style={s.bars} accessible accessibilityLabel="Example: nerves 4 before, 2 during">
              <View style={s.barCol}>
                <View style={[s.bar, { height: 72 }]} />
                <T v="small">Before</T>
              </View>
              <View style={s.barCol}>
                <View style={[s.bar, s.barNow, { height: 36 }]} />
                <T v="small">During</T>
              </View>
            </View>
          ) : null}
          {last ? (
            <View style={s.move}>
              <T v="small" style={{ fontFamily: F.semi }}>
                Your first move
              </T>
              <T style={s.moveTitle}>{move.title}</T>
              <T v="sub">{move.doIt}</T>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>
      <View style={{ gap: 10 }}>
        <Btn label={last ? 'Start my first move' : 'Next'} kind="primary" wide onPress={() => (last ? onStart() : setAt(at + 1))} />
        <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8} style={{ alignSelf: 'center', padding: 8 }}>
          <T style={{ color: C.muted, fontSize: 15, textDecorationLine: 'underline' }}>{last ? 'Look around first' : 'Skip the intro'}</T>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 40, elevation: 40, backgroundColor: C.bg, paddingHorizontal: 22, gap: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  blaze: { width: 9, height: 26, borderRadius: 2, backgroundColor: C.accent, borderWidth: 2, borderColor: C.ink },
  wordmark: { fontFamily: F.display, fontSize: 30, lineHeight: 38, letterSpacing: -0.6, color: C.ink },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 12 },
  count: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.muted },
  title: { fontFamily: F.display, fontSize: 50, lineHeight: 50, letterSpacing: -1.2, color: C.ink },
  text: { fontFamily: F.body, fontSize: 20, lineHeight: 28, color: C.ink },
  bars: { flexDirection: 'row', gap: 14, alignItems: 'flex-end', height: 104, marginTop: 6 },
  barCol: { alignItems: 'center', gap: 4 },
  bar: { width: 44, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.bgDeep },
  barNow: { backgroundColor: C.accent },
  move: { gap: 4, marginTop: 6, padding: 16, borderRadius: 10, borderWidth: 1.5, borderLeftWidth: 6, borderColor: C.ink, borderLeftColor: C.accent, backgroundColor: C.surface },
  moveTitle: { fontFamily: F.display, fontSize: 26, lineHeight: 28, letterSpacing: -0.4, color: C.ink },
});
