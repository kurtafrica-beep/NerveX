import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { PATCH_ART } from '../artImages';
import { Emo } from './ArtIcon';
import { SvgXml } from 'react-native-svg';
import { PLACE_ART, branchPoster, patchSvg, placeArt, posterArt } from '../art';
import { useNerve } from '../data';
import { BRANCH, type BranchKey } from '../moves';
import { CARD_MASTER, CARD_USE_XP, FLOW, HUE, PLACE_HUE, cardHow, cardMove } from '../progress';
import { CARDS, PLACES, type Card } from '../rpgData';
import { C, F } from '../theme';
import { Btn, T } from '../ui';

export type PatchMode = 'locked' | 'earned' | 'mastered';

// An embroidered trail patch: shape = branch, peaks and sun = level, gold thread = mastered.
export function Patch({ card, mode, size }: { card: Card; mode: PatchMode; size: number }) {
  const art = PATCH_ART[card.id];
  const xml = useMemo(() => (art ? '' : patchSvg(card, mode, size)), [art, card, mode, size]);
  if (!art) return <SvgXml xml={xml} width={size} height={size} />;
  // Locked: faded and grey, with a lock. Mastered: a gold ring and a star.
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {mode === 'mastered' ? (
        <View style={[pa.ring, { width: size * 0.96, height: size * 0.96, borderRadius: size * 0.48, borderWidth: Math.max(2, size * 0.03) }]} />
      ) : null}
      <Image
        source={art}
        style={[{ width: size * 0.9, height: size * 0.9 }, mode === 'locked' && pa.locked]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      {mode === 'locked' ? (
        <View style={pa.lock}>
          <Emo e="🔒" size={Math.round(size * 0.22)} />
        </View>
      ) : null}
      {mode === 'mastered' ? (
        <View style={[pa.star, { right: 0, top: 0, width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13 }]}>
          <T style={{ color: '#FFF6D6', fontSize: Math.round(size * 0.15), lineHeight: Math.round(size * 0.2) }}>★</T>
        </View>
      ) : null}
    </View>
  );
}

const pa = StyleSheet.create({
  ring: { position: 'absolute', borderColor: '#D9A521', backgroundColor: 'rgba(217,165,33,0.14)' },
  locked: { opacity: 0.38, filter: [{ grayscale: 1 }] },
  lock: { position: 'absolute' },
  star: { position: 'absolute', backgroundColor: '#C9971C', borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
});

// A poster banner: deep colour, map contours, the blaze sun and one big glyph.
export function BranchBanner({ b, height, glyphX = 262, scale = 0.82 }: { b: BranchKey; height: number; glyphX?: number; scale?: number }) {
  const xml = useMemo(() => branchPoster(b, 390, height, glyphX, scale), [b, height, glyphX, scale]);
  return <SvgXml xml={xml} width="100%" height={height} preserveAspectRatio="xMidYMid slice" />;
}
export function PlaceBanner({ place, height }: { place: number; height: number }) {
  const pl = PLACES[place];
  const xml = useMemo(() => {
    const h = PLACE_HUE[pl.id];
    return posterArt(placeArtGlyph(pl.id), h[0], h[1], 390, height, 230, 1.15);
  }, [pl.id, height]);
  return <SvgXml xml={xml} width="100%" height={height} preserveAspectRatio="xMidYMid slice" />;
}
// The place glyph alone, for banners that use the poster frame.
function placeArtGlyph(id: string): string {
  return (PLACE_ART as Record<string, string>)[id] ?? '';
}
export function PlacePoster({ place, width, height }: { place: number; width: number; height: number }) {
  const xml = useMemo(() => placeArt(PLACES[place]), [place]);
  return <SvgXml xml={xml} width={width} height={height} preserveAspectRatio="xMidYMid slice" />;
}

export function cardHue(c: Card): [string, string] {
  if (c.u.b) return HUE[c.u.b as BranchKey];
  return PLACE_HUE[PLACES[c.u.place ?? 0].id] ?? ['#2B3A44', '#DCE2E5'];
}
export function cardSource(c: Card): string {
  return c.u.b ? `${BRANCH[c.u.b as BranchKey].name}, level ${c.u.k}` : PLACES[c.u.place ?? 0].name;
}

// The wall: every patch, earned or not.
export function PatchWall({ onOpen }: { onOpen: (c: Card) => void }) {
  const n = useNerve();
  const p = n.progress;
  const mode = (c: Card): PatchMode => (!p.cards.includes(c.id) ? 'locked' : (p.uses[c.id] ?? 0) >= CARD_MASTER ? 'mastered' : 'earned');
  const gold = CARDS.filter((c) => mode(c) === 'mastered').length;
  return (
    <View style={{ gap: 12 }}>
      <View style={w.meter} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: CARDS.length, now: p.cards.length }}>
        <View style={[w.fill, { width: `${Math.round((100 * p.cards.length) / CARDS.length)}%`, backgroundColor: C.accent }]} />
        <View style={[w.fill, { width: `${Math.round((100 * gold) / CARDS.length)}%`, backgroundColor: '#D9A521' }]} />
      </View>
      <T v="semi" style={{ fontSize: 15 }}>
        {p.cards.length} of {CARDS.length} patches earned{gold ? `, ${gold} in gold` : ''}
      </T>
      <View style={w.grid}>
        {CARDS.map((c) => {
          const m = mode(c);
          const used = p.uses[c.id] ?? 0;
          const body = (
            <>
              <View style={m === 'locked' ? null : m === 'mastered' ? w.goldShadow : w.shadow}>
                <Patch card={c} mode={m} size={88} />
              </View>
              <T style={[w.title, m === 'locked' && { color: C.muted, fontFamily: F.medium }]} numberOfLines={3}>
                {c.t}
              </T>
              {m === 'locked' ? (
                <T style={w.how}>{cardHow(c)}</T>
              ) : m === 'mastered' ? (
                <T style={w.gold}>Gold</T>
              ) : (
                <View style={w.pips} accessibilityLabel={`Used ${used} of ${CARD_MASTER}`}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[w.pip, i < used && w.pipOn]} />
                  ))}
                </View>
              )}
            </>
          );
          return m === 'locked' ? (
            <View key={c.id} style={w.cell} accessibilityLabel={`${c.t}, locked. ${cardHow(c)}.`}>
              {body}
            </View>
          ) : (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`${c.t}${m === 'mastered' ? ', gold' : `, used ${used} of ${CARD_MASTER}`}`}
              onPress={() => onOpen(c)}
              style={({ pressed }) => [w.cell, pressed && { transform: [{ scale: 0.96 }] }]}>
              {body}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// A playbook: the patch, then each step as a card you swipe through.
export function CardSheet({ card, onClose, onPractise, onError }: { card: Card; onClose: () => void; onPractise: (moveId: string) => void; onError: (m: string) => void }) {
  const n = useNerve();
  const used = n.progress.uses[card.id] ?? 0;
  const mode: PatchMode = used >= CARD_MASTER ? 'mastered' : 'earned';
  const [hue, soft] = cardHue(card);
  const steps: [string, string][] = card.flow.map((t, i) => [FLOW[i], t]);
  if (card.why) steps.push(['Why it works', card.why]);
  const width = Dimensions.get('window').width;
  const cardW = width - 24 - 46;
  const [at, setAt] = useState(0);
  const [busy, setBusy] = useState(false);
  const move = cardMove(card);
  const [pop] = useState(() => new Animated.Value(1));
  const prevUsed = useRef(used);
  useEffect(() => {
    if (used <= prevUsed.current) return;
    const gild = used === CARD_MASTER;
    prevUsed.current = used;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;
      pop.setValue(gild ? 0.7 : 0.9);
      Animated.spring(pop, { toValue: 1, friction: gild ? 3 : 4, tension: 120, useNativeDriver: true }).start();
    });
  }, [used, pop]);
  const spin = pop.interpolate({ inputRange: [0.7, 1], outputRange: ['-12deg', '0deg'] });

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose} statusBarTranslucent>
      <View style={sh.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={sh.sheet} accessibilityViewIsModal>
          <View style={sh.grab} />
          <View style={sh.head}>
            <Animated.View style={[mode === 'mastered' ? w.goldShadow : w.shadow, { transform: [{ scale: pop }, { rotate: spin }] }]}>
              <Patch card={card} mode={mode} size={96} />
            </Animated.View>
            <View style={{ flex: 1, gap: 2 }}>
              <T v="eyebrow">{cardSource(card)}</T>
              <T style={sh.title}>{card.t}</T>
            </View>
          </View>
          <T v="sub">{card.sit}</T>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardW + 10}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 10, paddingHorizontal: 12, paddingVertical: 6 }}
            style={{ marginHorizontal: -12 }}
            onScroll={(e) => setAt(Math.round(e.nativeEvent.contentOffset.x / (cardW + 10)))}
            scrollEventThrottle={32}>
            {steps.map(([head, text], i) => {
              const why = !!card.why && i === steps.length - 1;
              return (
                <View
                  key={i}
                  accessibilityLabel={`${i + 1} of ${steps.length}. ${head}. ${text}`}
                  style={[sh.step, { width: cardW, backgroundColor: why ? soft : hue }, why && { borderWidth: 2, borderColor: hue }]}>
                  <View style={[sh.sun, why && { backgroundColor: hue, opacity: 0.18 }]} />
                  <T style={[sh.stepN, { color: why ? C.ink : '#FFFFFF' }]}>{why ? '?' : String(i + 1)}</T>
                  <T style={[sh.stepH, { color: why ? C.ink : '#FFFFFF' }]}>{head}</T>
                  <T style={[sh.stepT, { color: why ? C.ink : '#FFFFFF' }]}>{text}</T>
                  <T style={[sh.stepFoot, { color: why ? C.ink : '#FFFFFF' }]}>
                    {i < steps.length - 1 ? `Swipe for ${steps[i + 1][0].toLowerCase()} →` : 'That’s the play.'}
                  </T>
                </View>
              );
            })}
          </ScrollView>
          <View style={sh.nav}>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {steps.map((_, i) => (
                <View key={i} style={[sh.dot, i === at && sh.dotOn]} />
              ))}
            </View>
            <T v="small" style={{ fontFamily: F.semi }}>
              {Math.min(at + 1, steps.length)} of {steps.length}
            </T>
          </View>
          <View style={sh.mastery}>
            <T v="small" style={{ color: C.ink }}>
              {used >= CARD_MASTER
                ? `Gold patch. You used this ${used} times in real conversations.`
                : used
                  ? `Used ${used} of ${CARD_MASTER}. ${CARD_MASTER - used} more and this patch turns gold.`
                  : `Use it in a real conversation, then tap “I used it” (+${CARD_USE_XP} XP). Three uses turn this patch gold.`}
            </T>
          </View>
          <View style={sh.btns}>
            {move ? (
              <Btn
                label="Practise it"
                small
                onPress={() => {
                  onClose();
                  onPractise(move.id);
                }}
              />
            ) : null}
            <Btn
              label="✓ I used it"
              kind="primary"
              small
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                const problem = await n.useCard(card.id);
                setBusy(false);
                if (problem) onError(problem);
              }}
            />
            <Btn label="Close" kind="quiet" small onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const w = StyleSheet.create({
  meter: { height: 10, borderRadius: 5, backgroundColor: C.bgDeep, overflow: 'hidden', borderWidth: 1.5, borderColor: C.line },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 },
  cell: { width: '33.33%', alignItems: 'center', gap: 6, paddingHorizontal: 3 },
  shadow: { shadowColor: C.ink, shadowOpacity: 0.35, shadowRadius: 0, shadowOffset: { width: 0, height: 2 } },
  goldShadow: { shadowColor: '#E8B836', shadowOpacity: 0.7, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  title: { fontFamily: F.semi, fontSize: 14, lineHeight: 17, color: C.ink, textAlign: 'center' },
  how: { fontFamily: F.body, fontSize: 12, lineHeight: 15, color: C.muted, textAlign: 'center' },
  gold: { fontFamily: F.displayBold, fontSize: 13, color: C.goldText },
  pips: { flexDirection: 'row', gap: 3 },
  pip: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.line },
  pipOn: { backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.ink },
});

const sh = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(20,32,27,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 12, paddingBottom: 28, gap: 10 },
  grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: C.line },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { fontFamily: F.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.4, color: C.ink },
  step: { minHeight: 230, borderRadius: 12, padding: 18, paddingBottom: 14, gap: 8, overflow: 'hidden', borderBottomWidth: 3, borderBottomColor: 'rgba(20,32,27,0.45)' },
  sun: { position: 'absolute', right: -40, top: -40, width: 130, height: 130, borderRadius: 65, backgroundColor: C.accent, opacity: 0.9 },
  stepN: { fontFamily: F.display, fontSize: 44, lineHeight: 46 },
  stepH: { fontFamily: F.displayBold, fontSize: 15, opacity: 0.85 },
  stepT: { fontFamily: F.semi, fontSize: 20, lineHeight: 27, flex: 1 },
  stepFoot: { fontFamily: F.semi, fontSize: 13, opacity: 0.7 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.line },
  dotOn: { width: 20, backgroundColor: C.ink },
  mastery: { padding: 10, borderRadius: 6, backgroundColor: C.bg },
  btns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
