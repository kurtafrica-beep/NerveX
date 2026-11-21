// Trail-map identity: lichen paper, granite ink, contour-line borders and one
// hi-vis blaze orange for what you act on or earn. Overpass (road and trail
// signage lineage) in heavy weights, sentence case, no tracked caps.
export const C = {
  bg: '#E8EBE5',
  bgDeep: '#D9DED6',
  surface: '#F6F7F3',
  ink: '#14201B',
  muted: '#5A645E',
  line: '#C3CBC0',
  // blaze: fills only, with ink text on top
  accent: '#FF6A1A',
  accentInk: '#14201B',
  // blaze dark enough to read as text
  accentText: '#A33A00',
  accentSoft: '#FFE3D1',
  gold: '#C9971C',
  goldText: '#8A6400',
  danger: '#B3261E',
  rec: '#D92D20',
} as const;

export const F = {
  display: 'Overpass_900Black',
  displayBold: 'Overpass_800ExtraBold',
  body: 'Overpass_400Regular',
  medium: 'Overpass_600SemiBold',
  semi: 'Overpass_700Bold',
} as const;
