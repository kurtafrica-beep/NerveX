// Feedback reactions on a line. One per person per line; tap the same one again to take it back.
export const REACTIONS = [
  { k: 'fire', e: '🔥', t: 'Badass' },
  { k: 'respect', e: '👏', t: 'Respect' },
  { k: 'inspiring', e: '💪', t: 'Inspiring' },
  { k: 'bigmove', e: '🚀', t: 'Big move' },
  { k: 'proud', e: '❤️', t: 'Proud of you' },
  { k: 'keepgoing', e: '⚡', t: 'Keep going' },
] as const;
export type ReactionKey = (typeof REACTIONS)[number]['k'];
export const REACT: Record<string, (typeof REACTIONS)[number]> = Object.fromEntries(REACTIONS.map((r) => [r.k, r]));
