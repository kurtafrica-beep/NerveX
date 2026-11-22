import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { PLACE_POSTER } from '../artImages';
import { levelMoves } from '../moves';
import { PLACES } from '../rpgData';
import { C, F } from '../theme';
import { Btn, T } from '../ui';

// Rope team preview: a squad climbs one mountain together over the week, then meets up on Saturday.
// Sample people for now; there's no team data model yet.
const GOAL = 30;
const MIN = 3;
const ENDS_IN = 3;
const TEAM = [
  { name: 'You', l: 'Y', n: 4, hue: C.accent, me: true },
  { name: 'Andre', l: 'A', n: 7, hue: '#1E5C9E', me: false },
  { name: 'Mina', l: 'M', n: 5, hue: '#2A6B44', me: false },
  { name: 'Jules', l: 'J', n: 2, hue: '#9A5F00', me: false },
];
const TRAIL: [number, number][] = [
  [30, 160], [120, 142], [72, 120], [176, 98], [124, 78], [200, 58], [172, 42], [196, 22],
];

// The point a fraction of the way along the trail, and the trail up to it.
function along(frac: number) {
  const segs = TRAIL.slice(1).map((p, i) => Math.hypot(p[0] - TRAIL[i][0], p[1] - TRAIL[i][1]));
  let left = segs.reduce((a, b) => a + b, 0) * frac;
  const done: [number, number][] = [TRAIL[0]];
  for (let i = 0; i < segs.length; i++) {
    const [a, b] = [TRAIL[i], TRAIL[i + 1]];
    if (left >= segs[i]) {
      done.push(b);
      left -= segs[i];
      continue;
    }
    const t = left / segs[i];
    done.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    break;
  }
  return done;
}

export function RopeTeam() {
  const [place, setPlace] = useState(0);
  const [going, setGoing] = useState(false);
  const total = TEAM.reduce((a, m) => a + m.n, 0);
  const frac = Math.min(1, total / GOAL);
  const short = TEAM.filter((m) => m.n < MIN);
  const done = along(frac);
  const at = done[done.length - 1];
  const path = (pts: [number, number][]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  const climbers = TEAM.map(
    (m, i) =>
      `<g transform="translate(${(at[0] - 27 + i * 18).toFixed(1)} ${(at[1] - 16 + (i % 2) * 6).toFixed(1)})"><circle r="10" fill="${m.hue}" stroke="${C.ink}" stroke-width="2"/></g>`,
  ).join('');
  const xml = `<svg viewBox="0 0 340 170">
<path d="M6 164 L118 52 L150 70 L196 18 L262 86 L334 164 Z" fill="${C.bgDeep}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M196 18 L180 36 L190 34 L198 44 L206 32 L214 34 Z" fill="#FFFFFF" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="${path(TRAIL)}" fill="none" stroke="${C.line}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>
<path d="${path(done)}" fill="none" stroke="${C.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<line x1="196" y1="22" x2="196" y2="4" stroke="${C.ink}" stroke-width="2"/><path d="M196 4 L214 9 L196 14 Z" fill="${C.accent}" stroke="${C.ink}" stroke-width="1.5"/>
${climbers}</svg>`;
  const most = Math.max(MIN, ...TEAM.map((m) => m.n));
  const pl = PLACES[place];
  const mv = levelMoves('x', place + 1)[3];
  const coming = TEAM.filter((m) => (m.me ? going : m.name === 'Andre' || m.name === 'Mina'));

  return (
    <View style={s.card} accessibilityLabel="Rope team preview">
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <T v="eyebrow">Rope team</T>
          <T style={s.title}>Climb this week, meet on Saturday</T>
        </View>
        <T style={s.preview}>Preview</T>
      </View>
      <View accessible accessibilityRole="image" accessibilityLabel={`Your rope team is ${Math.round(frac * 100)} percent of the way up`}>
        <View style={{ width: '100%', aspectRatio: 2 }}>
          <SvgXml xml={xml} width="100%" height="100%" />
        </View>
        <View style={s.faces} pointerEvents="none">
          {TEAM.map((m, i) => (
            <T
              key={m.l}
              style={[
                s.climberText,
                { left: `${((at[0] - 27 + i * 18) / 340) * 100}%`, top: `${((at[1] - 16 + (i % 2) * 6) / 170) * 100}%`, marginTop: -9, color: m.me ? C.ink : '#FFFFFF' },
              ]}>
              {m.l}
            </T>
          ))}
        </View>
      </View>
      <T style={s.stat}>
        <T style={{ fontFamily: F.display }}>{`${total} of ${GOAL}`}</T>
        {` moves, ${ENDS_IN} days left${short.length ? `. ${short.map((m) => m.name).join(' and ')} still needs ${MIN - short[0].n} more` : ''}`}
      </T>
      <View style={{ gap: 8 }}>
        {TEAM.map((m) => (
          <View key={m.name} style={s.member}>
            <View style={[s.face, { backgroundColor: m.hue }]}>
              <T style={[s.faceText, { color: m.me ? C.ink : '#FFFFFF' }]}>{m.l}</T>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <T style={s.name}>{m.name}</T>
              <View style={s.bar}>
                <View style={{ width: `${Math.round((m.n / most) * 100)}%`, height: '100%', backgroundColor: m.hue }} />
              </View>
            </View>
            <T style={[s.n, m.n < MIN && { color: C.danger }]}>{m.n < MIN ? `${m.n} of ${MIN}` : `${m.n} moves`}</T>
          </View>
        ))}
      </View>
      <T v="small">
        Everyone climbs on the same rope. The team summits at {GOAL} moves, and only if each of you logs at least {MIN}. Summit, and the team meets up on
        Saturday.
      </T>

      <View style={s.summit}>
        {PLACE_POSTER[pl.id] ? <Image source={PLACE_POSTER[pl.id]} style={s.poster} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
        <View style={{ padding: 14, gap: 8 }}>
          <T v="eyebrow">Summit day, Saturday 2 pm</T>
          <T style={s.title}>{pl.name}</T>
          {mv ? <T>{`Together: ${mv.title}. Each of you does it, then you post one line as a team.`}</T> : null}
          <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel="Where to meet">
            {PLACES.slice(0, 3).map((p, k) => (
              <Pressable
                key={p.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: k === place }}
                onPress={() => setPlace(k)}
                style={[s.chip, k === place && s.chipOn]}>
                <T style={[s.chipText, k === place && { color: C.surface }]}>{p.name}</T>
              </Pressable>
            ))}
          </View>
          <T v="small">{`${coming.length} of ${TEAM.length} going`}</T>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Btn label={going ? 'You’re going' : 'I’m in'} kind={going ? 'outline' : 'primary'} small onPress={() => setGoing((v) => !v)} />
            <Btn label={frac < 1 ? 'Opens when you summit' : 'We met up'} kind="outline" small disabled onPress={() => {}} />
          </View>
          <View style={{ gap: 4 }}>
            {[
              'Public places only, in daylight or a busy evening spot',
              'Only your rope team, people you already follow',
              'Leave whenever you want. No one films anyone without asking',
            ].map((r) => (
              <T key={r} v="small">{`•  ${r}`}</T>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 8, padding: 16, gap: 12, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { fontFamily: F.display, fontSize: 22, lineHeight: 26, color: C.ink },
  preview: { fontFamily: F.semi, fontSize: 12, color: C.muted, borderWidth: 1.5, borderColor: C.line, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  faces: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  climberText: { position: 'absolute', width: 20, marginLeft: -10, textAlign: 'center', fontFamily: F.semi, fontSize: 11, lineHeight: 18 },
  stat: { fontFamily: F.semi, fontSize: 15, lineHeight: 21, color: C.ink },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  face: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.ink },
  faceText: { fontFamily: F.semi, fontSize: 13, lineHeight: 16 },
  name: { fontFamily: F.semi, fontSize: 14, lineHeight: 18 },
  bar: { height: 6, borderRadius: 3, backgroundColor: C.bgDeep, overflow: 'hidden' },
  n: { fontFamily: F.semi, fontSize: 13, color: C.muted, minWidth: 58, textAlign: 'right' },
  summit: { borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: C.ink, backgroundColor: C.bg },
  poster: { width: '100%', height: 110 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: C.ink },
  chipOn: { backgroundColor: C.ink },
  chipText: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.ink },
});
