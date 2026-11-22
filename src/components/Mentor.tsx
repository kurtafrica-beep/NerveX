import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { BranchKey } from '../moves';
import { HUE } from '../progress';
import { C, F } from '../theme';
import { T } from '../ui';

// Each path has an original guide character who walks you through its moves.
// They are invented, not portraits of the real teachers a path draws on.
export const MENTOR: Partial<Record<BranchKey, { name: string; role: string; face: number }>> = {
  n: { name: 'Hal', role: 'the negotiator', face: require('../../assets/art/mentor/n.webp') },
  f: { name: 'Rosa', role: 'the founder', face: require('../../assets/art/mentor/f.webp') },
  m: { name: 'Kit', role: 'the creator', face: require('../../assets/art/mentor/m.webp') },
  p: { name: 'Dex', role: 'the door-knocker', face: require('../../assets/art/mentor/p.webp') },
  k: { name: 'June', role: 'the speaker', face: require('../../assets/art/mentor/k.webp') },
  b: { name: 'Theo', role: 'the coach', face: require('../../assets/art/mentor/b.webp') },
  h: { name: 'Gus', role: 'the late-night writer', face: require('../../assets/art/mentor/h.webp') },
  w: { name: 'Lena', role: 'the headliner', face: require('../../assets/art/mentor/w.webp') },
  g: { name: 'Mara', role: 'the host', face: require('../../assets/art/mentor/g.webp') },
  y: { name: 'Nico', role: 'the wingman', face: require('../../assets/art/mentor/y.webp') },
  a: { name: 'The Champ', role: 'the old fighter', face: require('../../assets/art/mentor/a.webp') },
};

export function MentorFace({ b, size }: { b: BranchKey; size: number }) {
  const m = MENTOR[b];
  if (!m) return null;
  return (
    <View style={[s.face, { width: size, height: size, borderRadius: size / 2, backgroundColor: HUE[b][1] }]}>
      <Image source={m.face} style={{ width: size, height: size }} accessibilityIgnoresInvertColors />
    </View>
  );
}

// The guide talking to you in a speech bubble.
export function MentorLine({ b, text }: { b: BranchKey; text: string }) {
  const m = MENTOR[b];
  if (!m) return null;
  return (
    <View style={s.row}>
      <MentorFace b={b} size={60} />
      <View style={s.bubble}>
        <View style={s.tail} />
        <T v="small" style={{ color: C.muted }}>
          <T v="small" style={{ fontFamily: F.semi, color: C.ink }}>{m.name}</T>, {m.role}
        </T>
        <T style={{ fontSize: 16, lineHeight: 22 }}>{text}</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  face: { overflow: 'hidden', borderWidth: 2, borderColor: C.ink },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bubble: { flex: 1, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.ink, borderRadius: 12, borderTopLeftRadius: 4, paddingVertical: 10, paddingHorizontal: 14, gap: 2 },
  tail: { position: 'absolute', left: -7, top: 14, width: 12, height: 12, backgroundColor: C.surface, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: C.ink, transform: [{ rotate: '45deg' }] },
});
