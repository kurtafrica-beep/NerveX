import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, Modal, StyleSheet, View } from 'react-native';
import { BRANCH, MOVES, isPath, levelMoves, lvTitle, lvWord, type PathKey } from '../moves';
import { ACH, ACH_XP, HUE, TIERS, TIER_EMOJI, TITLES, levelBonus, titleInfo, type AchKey, type Progress } from '../progress';
import { C, F } from '../theme';
import { Btn, T } from '../ui';
import { CARDS, PLACES } from '../rpgData';
import { Patch } from './Patches';

export type Reward = { levels: string[]; level: number; ach: AchKey[]; gained: number; paths: PathKey[]; cards?: string[]; regulars?: number[]; places?: number[]; preview?: boolean };
export type Snap = { xp: number; level: number; earned: string[]; ach: AchKey[]; paths: PathKey[]; cards: string[]; regulars: number[]; test: boolean };

export function snap(p: Progress, test: boolean): Snap {
  return {
    xp: p.xp,
    level: p.level,
    earned: p.earned,
    ach: ACH.filter((a) => p.ach[a.k].done).map((a) => a.k),
    paths: (Object.keys(p.paths) as PathKey[]).filter((b) => p.paths[b].met),
    cards: p.cards,
    regulars: p.regulars,
    test,
  };
}

// What changed between two snapshots, or null if nothing worth showing.
export function diff(prev: Snap, now: Snap): Reward | null {
  if (prev.test !== now.test) return null;
  const r: Reward = {
    gained: now.xp - prev.xp,
    levels: now.earned.filter((k) => !prev.earned.includes(k)),
    level: now.level > prev.level ? now.level : 0,
    ach: now.ach.filter((k) => !prev.ach.includes(k)),
    paths: now.paths.filter((b) => !prev.paths.includes(b)),
    cards: now.cards.filter((c) => !prev.cards.includes(c)),
    regulars: now.regulars.filter((k) => !prev.regulars.includes(k)),
    // places that open with the new overall level
    places: now.level > prev.level ? PLACES.map((_, k) => k).filter((k) => PLACES[k].lv > prev.level && PLACES[k].lv <= now.level) : [],
  };
  if (r.levels.length || r.level || r.ach.length || r.paths.length || r.cards?.length || r.regulars?.length || r.gained > 0) return r;
  return null;
}
export function isBig(r: Reward): boolean {
  return !!(r.levels.length || r.level || r.ach.length || r.paths.length || r.cards?.length || r.regulars?.length);
}

// Deterministic scatter so every piece of confetti lands differently without Math.random in render.
const rand = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Confetti({ colors }: { colors: string[] }) {
  const [t] = useState(() => new Animated.Value(0));
  const { width, height } = Dimensions.get('window');
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      Animated.timing(t, { toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [t]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 48 }, (_, i) => {
        const x0 = rand(i, 1) * width;
        const drift = (rand(i, 2) - 0.5) * 160;
        const fall = height * (0.6 + rand(i, 3) * 0.5);
        const spin = `${Math.round((rand(i, 4) - 0.5) * 1440)}deg`;
        const delay = rand(i, 5) * 0.25;
        const move = t.interpolate({ inputRange: [0, delay, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: x0,
              top: -20,
              width: 7,
              height: 11,
              borderRadius: 2,
              backgroundColor: colors[i % colors.length],
              opacity: t.interpolate({ inputRange: [0, 0.02, 0.85, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: move.interpolate({ inputRange: [0, 1], outputRange: [0, fall] }) },
                { translateX: move.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) },
                { rotate: move.interpolate({ inputRange: [0, 1], outputRange: ['0deg', spin] }) },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

// The celebration: a new title, a new path, a level-up or an achievement.
export function RewardSheet({ r, onClose, onWear }: { r: Reward; onClose: () => void; onWear: (key: string) => void }) {
  const first = titleInfo(r.levels[0]);
  const np = r.paths[0];
  const rows: [React.ReactNode, string][] = [];
  let badge: React.ReactNode = '⬆️';
  const newCards = (r.cards ?? []).map((id) => CARDS.find((c) => c.id === id)!).filter(Boolean);
  const reg = r.regulars?.[0];
  let eyebrow = 'Level up';
  let title = `You reached Level ${r.level}`;
  let hue: [string, string] | null = null;
  if (first) {
    hue = HUE[first.b];
    badge = TIER_EMOJI[first.k - 1];
    eyebrow = `${BRANCH[first.b].name} · ${isPath(first.b) && first.k === 5 ? 'Capstone' : `${lvWord(first.b)} ${first.k}`} complete`;
    title = `You earned “${first.text}”`;
    rows.push(['🏷️', `New title: ${first.text}`]);
    rows.push([TIER_EMOJI[first.k - 1], `${TIERS[first.k - 1]} ${BRANCH[first.b].name} badge`]);
    rows.push(['⚡', `+${levelBonus(first.k, first.b)} bonus XP`]);
    if (first.k < 5) {
      const nextN = levelMoves(first.b, first.k + 1).length;
      rows.push(['🔓', `${lvTitle(first.b, first.k + 1)} unlocked: ${nextN === 1 ? 'the final move' : `${nextN} new moves`}`]);
    } else rows.push(['👑', `${BRANCH[first.b].name}${isPath(first.b) ? ' path summited' : ' mastered'}`]);
    for (const key of r.levels.slice(1)) {
      const t = titleInfo(key);
      if (t) rows.push([TIER_EMOJI[t.k - 1], `Also earned: ${t.text}`]);
    }
    if (np) rows.push(['🧗', `New path unlocked: ${BRANCH[np].name}`]);
    if (r.level) rows.push(['⬆️', `You reached Level ${r.level}`]);
  } else if (np) {
    hue = HUE[np];
    badge = '🧗';
    eyebrow = r.preview ? 'Preview · New path' : 'New path';
    title = `${BRANCH[np].name} path unlocked`;
    rows.push(['⛰️', `Four stages and a capstone: ${MOVES.filter((m) => m.b === np).length} new moves`]);
    rows.push(['🎓', BRANCH[np].tag]);
    rows.push(['🏷️', `Five new titles, up to “${TITLES[np][4]}”`]);
    if (r.level) rows.push(['⬆️', `You reached Level ${r.level}`]);
  } else if (reg !== undefined) {
    badge = <Patch card={newCards[0] ?? CARDS[0]} mode="earned" size={84} />;
    eyebrow = PLACES[reg].name;
    title = 'You’re a regular';
    rows.push(['🏠', `All five actions at the ${PLACES[reg].name.toLowerCase()}`]);
  } else if (newCards.length && !r.level) {
    badge = <Patch card={newCards[0]} mode="earned" size={84} />;
    eyebrow = 'New patch';
    title = newCards[0].t;
  } else if (!r.level && r.ach.length) {
    const a0 = ACH.find((a) => a.k === r.ach[0])!;
    badge = a0.e;
    eyebrow = 'Achievement';
    title = a0.t;
    rows.push(['✅', a0.d]);
  }
  for (const c of newCards) rows.push([<Patch key={c.id} card={c} mode="earned" size={24} />, `New patch: ${c.t}`]);
  for (const k of r.places ?? []) rows.push(['📍', `New place: ${PLACES[k].name}`]);
  for (const a of ACH) {
    if (!r.ach.includes(a.k)) continue;
    rows.push([a.e, `${first || np || r.level ? `Achievement: ${a.t}` : 'Achievement bonus'} · +${ACH_XP} XP`]);
  }
  if (r.gained > 0) rows.push(['✨', `+${r.gained} XP in total`]);
  const bc = hue ? hue[0] : C.accent;
  const colors = hue ? [hue[0], C.ink, '#F2B705', hue[1]] : Object.values(HUE).map((h) => h[0]);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose} statusBarTranslucent>
      <View style={s.scrim}>
        <View style={s.card} accessibilityViewIsModal>
          <View style={[s.badge, { borderColor: bc }]}>
            {typeof badge === 'string' ? <T style={{ fontSize: 44, lineHeight: 52 }}>{badge}</T> : badge}
          </View>
          <T style={[s.eyebrow, { color: bc }]}>{eyebrow}</T>
          <T style={s.title} accessibilityRole="header">
            {title}
          </T>
          <View style={{ gap: 6, alignSelf: 'stretch' }}>
            {rows.map((row, i) => (
              <View key={i} style={s.row}>
                {typeof row[0] === 'string' ? <T style={{ fontSize: 18, width: 26 }}>{row[0]}</T> : <View style={{ width: 26, alignItems: 'center' }}>{row[0]}</View>}
                <T style={{ flex: 1, fontSize: 16, lineHeight: 21 }}>{row[1]}</T>
              </View>
            ))}
          </View>
          <View style={s.btns}>
            {first ? <Btn label="Wear this title" kind="primary" onPress={() => onWear(first.key)} /> : null}
            <Btn label={first ? 'Keep going' : 'Nice'} onPress={onClose} />
          </View>
        </View>
        <Confetti colors={colors} />
      </View>
    </Modal>
  );
}

export function XpToast({ text }: { text: string }) {
  return (
    <View pointerEvents="none" style={s.toast}>
      <T style={{ fontFamily: F.semi, fontSize: 16, color: C.surface }}>{text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(13,14,18,0.55)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { alignSelf: 'stretch', backgroundColor: C.surface, borderRadius: 14, padding: 20, gap: 10, alignItems: 'center' },
  badge: { width: 92, height: 92, borderRadius: 46, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  eyebrow: { fontFamily: F.semi, fontSize: 13, textAlign: 'center' },
  title: { fontFamily: F.display, fontSize: 34, lineHeight: 36, color: C.ink, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: C.bg },
  btns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingTop: 4 },
  toast: { position: 'absolute', alignSelf: 'center', bottom: 110, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: C.ink },
});
