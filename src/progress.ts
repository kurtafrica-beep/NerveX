// XP, levels, titles, achievements and paths, all worked out from what you have logged.
// Same rules as the web page.
import {
  ALL_KEYS,
  BRANCH,
  BRANCH_KEYS,
  BY,
  CAP_REACTS,
  MOVES,
  PATH,
  PATH_KEYS,
  isPath,
  levelDone,
  type BaseKey,
  type BranchKey,
  type Move,
  type PathKey,
} from './moves';

// Branch colour and its soft tint.
export const HUE: Record<BranchKey, [string, string]> = {
  c: ['#2F4DF5', '#E7EBFF'],
  t: ['#7C3AED', '#EFE7FF'],
  q: ['#C2255C', '#FDE8EF'],
  v: ['#087F78', '#DDF3F0'],
  s: ['#A85800', '#FBEBD5'],
  n: ['#232A3B', '#E4E7EE'],
  f: ['#2E7D32', '#E2F2E1'],
  m: ['#C92A2A', '#FFE3E3'],
  p: ['#7A5212', '#F3EAD9'],
  k: ['#9C36B5', '#F6E5FA'],
};
export const GREY: [string, string] = ['#8D929B', '#F0F0EC'];

// Finishing level k of a branch earns its title, a badge and bonus XP.
export const TITLES: Record<BranchKey, string[]> = {
  c: ['Icebreaker', 'Bold', 'Open', 'Fearless', 'Unshakeable'],
  t: ['Good Listener', 'Engaging', 'Storyteller', 'Connector', 'Master Conversationalist'],
  q: ['Friendly Face', 'Warm', 'Present', 'Magnetic', 'Charismatic'],
  v: ['Found My Voice', 'Clear', 'Expressive', 'Commanding', 'Master Speaker'],
  s: ['Helper', 'Prospector', 'Closer', 'Rainmaker', 'Master Salesman'],
  n: ['Sharp Ear', 'Tactical Empath', 'Calibrator', 'Dealmaker', 'Negotiator'],
  f: ['Door Opener', 'Problem Finder', 'Positioner', 'Frame Setter', 'Founder'],
  m: ['Camera Ready', 'Hook Setter', 'Story Cutter', 'Public Face', 'Creator'],
  p: ['Dialer', 'Door Knocker', 'Follow-Up Pro', 'Meeting Setter', 'Prospector'],
  k: ['Stage Ready', 'Structured', 'Story Sharp', 'Room Reader', 'Keynote Speaker'],
};
export const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
export const TIER_EMOJI = ['🥉', '🥈', '🥇', '💠', '💎'];

// Harder levels pay more; path moves pay more again, and a capstone the most.
export function moveXp(m: Move): number {
  return m.cap ? 250 : isPath(m.b) ? 50 + 10 * m.lv : 10 * m.lv;
}
export function levelBonus(k: number, b?: BranchKey): number {
  return (b && isPath(b) ? 100 : 50) * k;
}
// Total XP needed to reach overall level L.
export function xpAt(L: number): number {
  return 50 * L * (L - 1);
}

export const ACH_XP = 25;
export type AchKey =
  | 'first' | 'streak3' | 'streak7' | 'allround' | 'record10' | 'post5' | 'react10'
  | 'upgrade' | 'base5' | 'moves25' | 'moves75' | 'master' | 'path';
export const ACH: { k: AchKey; e: string; t: string; d: string; of: number }[] = [
  { k: 'first', e: '🌱', t: 'First Step', d: 'Log your first move', of: 1 },
  { k: 'streak3', e: '🔥', t: 'Three-Day Run', d: 'Log moves 3 days in a row', of: 3 },
  { k: 'streak7', e: '⚡', t: 'Seven-Day Run', d: 'Log moves 7 days in a row', of: 7 },
  { k: 'allround', e: '🧭', t: 'All-Rounder', d: 'Do a move in every branch', of: 5 },
  { k: 'record10', e: '🎙️', t: 'On the Record', d: 'Save 10 recordings', of: 10 },
  { k: 'post5', e: '📣', t: 'Out Loud', d: 'Post 5 lines to the feed', of: 5 },
  { k: 'react10', e: '❤️', t: 'Crowd Favourite', d: 'Get 10 reactions', of: 10 },
  { k: 'upgrade', e: '⏫', t: 'One Notch Harder', d: 'Log an upgrade', of: 1 },
  { k: 'base5', e: '🏕️', t: 'Base Camp', d: 'Finish every base level', of: 5 },
  { k: 'moves25', e: '🎯', t: 'Twenty-Five', d: 'Do 25 different moves', of: 25 },
  { k: 'moves75', e: '⛰️', t: 'Halfway', d: 'Do 75 different moves', of: 75 },
  { k: 'master', e: '👑', t: 'Master', d: 'Finish Level 5 in a branch', of: 1 },
  { k: 'path', e: '🧗', t: 'Pathfinder', d: 'Open your first path', of: 1 },
];

export type Req = { text: string; now: string; ok: boolean };
export type PathInfo = { reqs: Req[]; met: boolean; open: boolean };
export type Pending = { lines: number; posted: boolean; reacts: number };
export type Progress = {
  // moves with a line that counts (a capstone only once it has its proof)
  count: Record<string, number>;
  pending: Record<string, Pending>;
  done: number;
  levels: Record<BranchKey, number>;
  earned: string[];
  paths: Record<PathKey, PathInfo>;
  open: Partial<Record<BranchKey, boolean>>;
  ach: Record<AchKey, { n: number; done: boolean }>;
  xp: number;
  level: number;
};

type Logged = { id: string; move: string; posted: boolean; media_kind: string | null; upgrade: boolean; created_at: string };

function dayNum(ms: number): number {
  const x = new Date(ms);
  return Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / 86400000;
}

export function titleInfo(key: string | null | undefined): { key: string; b: BranchKey; k: number; text: string } | null {
  if (typeof key !== 'string' || !/^[ctqvsnfmpk][1-5]$/.test(key)) return null;
  const b = key.charAt(0) as BranchKey;
  const k = Number(key.charAt(1));
  return { key, b, k, text: TITLES[b][k - 1] };
}

export function computeProgress(
  mine: Logged[],
  reactsOn: (lineId: string) => string[],
  uid: string,
  test: boolean,
): Progress {
  const count: Record<string, number> = {};
  for (const x of mine) count[x.move] = (count[x.move] ?? 0) + 1;

  // A path capstone only counts once it is posted and enough other people have reacted.
  const pending: Record<string, Pending> = {};
  for (const m of MOVES) {
    if (!m.cap || !count[m.id]) continue;
    const posted = mine.filter((x) => x.move === m.id && x.posted !== false);
    let reacts = 0;
    for (const p of posted) reacts = Math.max(reacts, reactsOn(p.id).filter((u) => u !== uid).length);
    if (test || reacts >= CAP_REACTS) continue;
    pending[m.id] = { lines: count[m.id], posted: posted.length > 0, reacts };
    delete count[m.id];
  }

  let xp = 0;
  for (const m of MOVES) {
    const c = count[m.id] ?? 0;
    if (c) xp += moveXp(m) + 2 * Math.min(c - 1, 5);
  }

  const levels = {} as Record<BranchKey, number>;
  const earned: string[] = [];
  for (const b of BRANCH_KEYS) {
    let k = 0;
    while (k < 5 && levelDone(b, k + 1, count)) k++;
    levels[b] = k;
    for (let i = 1; i <= k; i++) {
      earned.push(b + i);
      xp += levelBonus(i);
    }
  }

  const paths = {} as Record<PathKey, PathInfo>;
  const open: Partial<Record<BranchKey, boolean>> = {};
  for (const b of PATH_KEYS) {
    const need = PATH[b].need;
    const keys = Object.keys(need) as BaseKey[];
    const recs = mine.filter((x) => x.media_kind && BY[x.move] && keys.includes(BY[x.move].b as BaseKey)).length;
    const names = keys.map((k) => BRANCH[k].name);
    const reqs: Req[] = keys.map((k) => {
      const at = Math.min(5, levels[k] + 1);
      return { text: `Reach ${BRANCH[k].name} Level ${need[k]}`, now: `Level ${at}`, ok: at >= (need[k] ?? 1) };
    });
    reqs.push({
      text: `${PATH[b].recs} recordings in ${names.length > 1 ? `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}` : names[0]}`,
      now: `${Math.min(recs, PATH[b].recs)}/${PATH[b].recs}`,
      ok: recs >= PATH[b].recs,
    });
    const met = reqs.every((r) => r.ok);
    paths[b] = { reqs, met, open: met || test };
    open[b] = met || test;
    let k = 0;
    if (open[b]) while (k < 5 && levelDone(b, k + 1, count)) k++;
    levels[b] = k;
    for (let i = 1; i <= k; i++) {
      earned.push(b + i);
      xp += levelBonus(i, b);
    }
  }

  // Best run of days in a row.
  const nums = [...new Set(mine.map((x) => dayNum(new Date(x.created_at).getTime())))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  nums.forEach((n, i) => {
    run = i > 0 && n === nums[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  const done = MOVES.filter((m) => count[m.id]).length;
  const posted = mine.filter((x) => x.posted !== false);
  const reacts = posted.reduce((sum, p) => sum + reactsOn(p.id).filter((u) => u !== uid).length, 0);
  const n: Record<AchKey, number> = {
    first: mine.length,
    streak3: best,
    streak7: best,
    allround: BRANCH_KEYS.filter((b) => MOVES.some((m) => m.b === b && count[m.id])).length,
    record10: mine.filter((x) => x.media_kind).length,
    post5: posted.length,
    react10: reacts,
    upgrade: mine.filter((x) => x.upgrade).length,
    base5: BRANCH_KEYS.filter((b) => levels[b] >= 1).length,
    moves25: done,
    moves75: done,
    master: BRANCH_KEYS.filter((b) => levels[b] >= 5).length,
    path: PATH_KEYS.filter((b) => paths[b].met).length,
  };
  const ach = {} as Progress['ach'];
  for (const a of ACH) {
    const ok = n[a.k] >= a.of;
    ach[a.k] = { n: n[a.k], done: ok };
    if (ok) xp += ACH_XP;
  }
  let level = 1;
  while (xpAt(level + 1) <= xp) level++;
  return { count, pending, done, levels, earned, paths, open, ach, xp, level };
}

// Short status for a branch or path button.
export function branchState(b: BranchKey, p: Progress): string {
  if (!isPath(b)) return `Lv ${Math.min(5, p.levels[b] + 1)}`;
  if (!p.open[b]) return '🔒 Locked';
  return p.levels[b] >= 5 ? 'Summit' : p.levels[b] === 4 ? 'Capstone' : `Stage ${p.levels[b] + 1}`;
}

export const ALL_BRANCHES = ALL_KEYS;
