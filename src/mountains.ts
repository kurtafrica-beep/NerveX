// Rope team mountains. Each week the team climbs one, and it decides which moves count.
// The patterns mirror public.rope_counts_for() on the server: change both together.
export type MountainKey = 'strangers' | 'friends' | 'stage' | 'night';
export const MTN_KEYS: MountainKey[] = ['strangers', 'friends', 'stage', 'night'];

export const MOUNTAINS: Record<MountainKey, { name: string; per: number; hue: string; rule: string }> = {
  strangers: { name: 'Strangers', per: 8, hue: '#B03A2E', rule: 'Only moves with people you don’t know count.' },
  friends: { name: 'Old friends', per: 6, hue: '#2A6B44', rule: 'Calls, voice notes, catch-ups and moves with people you already know.' },
  stage: { name: 'The stage', per: 5, hue: '#1E5C9E', rule: 'Speaking, stories, toasts and anything in front of a group.' },
  night: { name: 'Summit night', per: 4, hue: '#6B3FA0', rule: 'Any move counts, but the summit only counts once everyone checks in at the meet-up.' },
};

export const PEAKS = ['Foothill', 'Ridge', 'Crag', 'Spire', 'Summit of summits'];

const PATTERN: Record<MountainKey, RegExp> = {
  strangers: /^(c(?!16$|17$|18$|19$|23$|27$|28$|30$)\d+|x\d+|y(?!4$|15$)\d+|p(1|2|3|4|5|7|11|13|14|17)|f(1|17)|z(1|3|5|6|9|13|14|15|17|18)|t(10|26|27)|a16|h9|m13|g15)$/,
  friends: /^(z(4|7|10|11|12|19|20|21)|t(3|12|25|30)|c(18|30)|q(16|30)|v(28|30)|s(14|17|30)|g(2|4|14)|h2|a(10|11|13)|w16)$/,
  stage: /^((v|k|w|h)\d+|c(12|17|23|26)|g(7|11|13|16|17)|a(5|14|15|17)|s29|t(24|29)|z8|m16)$/,
  night: /.*/,
};

export function countsFor(mountain: MountainKey | null | undefined, moveId: string): boolean {
  return !!mountain && PATTERN[mountain].test(moveId.split('@')[0]);
}
