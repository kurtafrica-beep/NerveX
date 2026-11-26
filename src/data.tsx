import AsyncStorage from '@react-native-async-storage/async-storage';
import { readRecording } from './takeStore';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { BUCKET } from './config';
import { BRANCH, BY, MOVES, ORDER, isPath, unlocked, type BranchKey, type Move } from './moves';
import { computeProgress, type Progress } from './progress';
import type { ReactionKey } from './reactions';
import { supabase } from './supabase';

export type Profile = { id: string; name: string; avatar_url: string | null; title: string | null; allow_nudges?: boolean };
export type MediaKind = 'voice' | 'video';
export type Line = {
  id: string;
  author: string;
  move: string;
  line: string;
  upgrade: boolean;
  media_path: string | null;
  media_kind: MediaKind | null;
  media_seconds: number | null;
  // false while it is a private take in the author's log
  posted: boolean;
  // place lines done in a path's version: which path
  via?: string | null;
  created_at: string;
};
export type Comment = { id: string; line_id: string; author: string; body: string; created_at: string };
export type Kudos = { line_id: string; author: string; kind: ReactionKey };
export type Follow = { follower: string; followee: string };
export type BoardRow = { uid: string; pts: number; lines: number; reacts: number };
export type Challenge = { id: string; author: string; target: string; move: string; until: string; created_at: string };
// wav marks a hands-free take: the speech recognizer saves raw WAV audio.
export type Recording = { kind: MediaKind; uri: string; seconds: number; wav?: boolean };
// Toronto meetups. Only the host posts them. The exact address is never in this row.
export type IrlEvent = {
  id: string;
  title: string;
  theme: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  area: string;
  what: string;
  cap: number;
  off: boolean;
  created_by: string;
};
export type EventInput = { title: string; theme: string; start: number; end: number; venue: string; area: string; address: string; what: string; cap: number };
export type Rsvp = { event: string; member: string };
// Nerve Pro. A test switch for now: no payment is taken.
export type ProState = { on: boolean; plan?: 'year' | 'month'; since?: number; trialEnds?: number | null };
// A warm-up: a small thing on a day without a move. Kept on this phone only.
export type WarmKind = 'plan' | 'reflect' | 'back';
export type Warm = { k: WarmKind; at: number; move?: string; prompt?: string; text?: string; voice?: boolean; line?: string };
export type Plan = { day: string; move: string; when: string; where: string };
export const WARM_MAX = 2;

type Store = {
  profiles: Record<string, Profile>;
  lines: Line[];
  comments: Comment[];
  kudos: Kudos[];
  challenges: Challenge[];
  follows: Follow[];
  // when you used each playbook patch (private to you)
  cardUses: { card: string; created_at: string }[];
  events: IrlEvent[];
  rsvps: Rsvp[];
  // addresses you can see: the host's, or events you're going to
  addresses: Record<string, string>;
  host: boolean;
  loaded: boolean;
  error: string;
};

const EMPTY: Store = { profiles: {}, lines: [], comments: [], kudos: [], challenges: [], follows: [], cardUses: [], events: [], rsvps: [], addresses: {}, host: false, loaded: false, error: '' };

export type Tonight = { move: Move; together: boolean; path: boolean; own?: boolean };

type Api = Store & {
  uid: string;
  reload: () => Promise<void>;
  // derived
  mine: Line[];
  // moves with a line that counts; a capstone only counts once it has its proof
  count: Record<string, number>;
  progress: Progress;
  // tester switch: opens the paths without meeting the requirements
  test: boolean;
  setTest: (on: boolean) => void;
  wearTitle: (key: string) => Promise<string>;
  setName: (name: string) => Promise<string>;
  setAllowNudges: (on: boolean) => Promise<string>;
  deleteAccount: () => Promise<string>;
  doneCount: number;
  streak: number;
  kudosReceived: number;
  circle: Profile[];
  tonight: Tonight;
  skipTonight: () => void;
  // what you're training: a base branch or a path. Remembered between visits.
  branch: BranchKey;
  setBranch: (b: BranchKey) => void;
  nameOf: (id: string) => string;
  kudosFor: (lineId: string) => Kudos[];
  commentsFor: (lineId: string) => Comment[];
  partnersFor: (moveId: string) => string[];
  partnersOfLine: (line: Line) => string[];
  incoming: Challenge[];
  challengeWith: (other: string) => Challenge | null;
  myChallengeTo: (other: string, moveId?: string) => Challenge | null;
  // actions: resolve '' on success or a message to show
  dropLine: (input: { move: string; line: string; upgrade: boolean; recording: Recording | null; posted?: boolean; via?: string | null }) => Promise<string>;
  postLine: (line: Line, caption: string) => Promise<string>;
  deleteLine: (line: Line) => Promise<string>;
  react: (lineId: string, kind: ReactionKey) => Promise<string>;
  addComment: (lineId: string, body: string) => Promise<string>;
  deleteComment: (id: string) => Promise<string>;
  toggleChallenge: (target: string, moveId: string) => Promise<string>;
  // following: people you follow make up your circle
  following: string[];
  isFollowing: (other: string) => boolean;
  isFollowedBy: (other: string) => boolean;
  followersOf: (id: string) => number;
  toggleFollow: (other: string) => Promise<string>;
  redeemInvite: (code: string) => Promise<{ who?: string; problem?: string }>;
  board: (period: 'week' | 'all', circleOnly: boolean) => BoardRow[];
  useCard: (id: string) => Promise<string>;
  // Nerve Pro
  pro: ProState;
  isPro: boolean;
  setPro: (p: ProState) => void;
  // warm-ups
  warm: Record<string, Warm>;
  warmToday: Warm | null;
  saveWarm: (k: WarmKind, extra?: Partial<Warm>) => void;
  plan: Plan | null;
  savePlan: (p: Omit<Plan, 'day'>) => void;
  movedToday: boolean;
  lineToBack: Line | null;
  // In real life
  events: IrlEvent[];
  isHost: boolean;
  goingTo: (eventId: string) => string[];
  amGoing: (eventId: string) => boolean;
  addressOf: (eventId: string) => string;
  toggleGoing: (e: IrlEvent) => Promise<string>;
  saveEvent: (input: EventInput, id?: string) => Promise<string>;
  cancelEvent: (id: string) => Promise<string>;
};

const Ctx = createContext<Api | null>(null);

const SAVE_FAILED = 'That did not save. Check your connection and try again.';

export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function midnight(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
}
const ms = (iso: string) => new Date(iso).getTime();

async function uploadRecording(uid: string, rec: Recording): Promise<string> {
  const { body, ext, type } = await readRecording(rec.uri, rec.kind, rec.wav);
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: type, upsert: false });
  if (error) throw error;
  return path;
}

export function DataProvider({ uid, children }: { uid: string; children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(EMPTY);
  const [skip, setSkip] = useState(0);
  const [branch, setBranchState] = useState<BranchKey>('c');
  useEffect(() => {
    AsyncStorage.getItem('nerve.branch')
      .then((v) => {
        if (v && v in BRANCH) setBranchState(v as BranchKey);
      })
      .catch(() => {});
  }, []);
  const setBranch = useCallback((b: BranchKey) => {
    setBranchState(b);
    setSkip(0);
    AsyncStorage.setItem('nerve.branch', b).catch(() => {});
  }, []);
  const [clock, setClock] = useState(() => Date.now());
  const [test, setTestState] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem('nerve.test').then((v) => setTestState(v === '1')).catch(() => {});
  }, []);
  const setTest = useCallback((on: boolean) => {
    setTestState(on);
    AsyncStorage.setItem('nerve.test', on ? '1' : '0').catch(() => {});
  }, []);
  const [pro, setProState] = useState<ProState>({ on: false });
  const [warm, setWarm] = useState<Record<string, Warm>>({});
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    const read = async (k: string) => {
      try {
        const v = await AsyncStorage.getItem(k);
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    };
    read('nerve.pro').then((v) => v && typeof v === 'object' && setProState({ ...v, on: !!v.on }));
    read('nerve.warm').then((v) => v && typeof v === 'object' && setWarm(v));
    read('nerve.plan').then((v) => v && typeof v === 'object' && setPlan(v));
  }, []);
  const setPro = useCallback((p: ProState) => {
    setProState(p);
    AsyncStorage.setItem('nerve.pro', JSON.stringify(p)).catch(() => {});
  }, []);
  const saveWarm = useCallback((k: WarmKind, extra: Partial<Warm> = {}) => {
    setWarm((prev) => {
      const now = Date.now();
      const cut = now - 60 * 86400000;
      const next: Record<string, Warm> = {};
      for (const [day, w] of Object.entries(prev)) if (w && w.at >= cut) next[day] = w;
      next[dayKey(now)] = { ...extra, k, at: now };
      AsyncStorage.setItem('nerve.warm', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);
  const savePlan = useCallback((p: Omit<Plan, 'day'>) => {
    const next = { ...p, day: dayKey(Date.now()) };
    setPlan(next);
    AsyncStorage.setItem('nerve.plan', JSON.stringify(next)).catch(() => {});
  }, []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(async () => {
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const [p, l, c, k, ch, fo, cu, ev, rs, ad, ho] = await Promise.all([
      supabase.from('profiles').select('id,name,avatar_url,title,allow_nudges'),
      supabase.from('lines').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('comments').select('*').order('created_at', { ascending: true }).limit(3000),
      supabase.from('kudos').select('line_id,author,kind').limit(10000),
      supabase.from('challenges').select('*').gt('until', since),
      supabase.from('follows').select('follower,followee').limit(10000),
      supabase.from('card_uses').select('card,created_at').limit(2000),
      supabase.from('irl_events').select('id,title,theme,starts_at,ends_at,venue,area,what,cap,off,created_by').order('starts_at').limit(200),
      supabase.from('irl_rsvps').select('event,member').limit(5000),
      supabase.rpc('irl_addresses'),
      supabase.rpc('is_host'),
    ]);
    if (p.error || l.error || c.error || k.error || ch.error) {
      setStore((prev) => ({ ...prev, loaded: true, error: 'Could not load Community. Pull down to try again.' }));
      return;
    }
    const profiles: Record<string, Profile> = {};
    for (const row of (p.data ?? []) as Profile[]) profiles[row.id] = row;
    setStore({
      profiles,
      lines: ((l.data ?? []) as Line[]).filter((row) => BY[row.move]),
      comments: (c.data ?? []) as Comment[],
      kudos: (k.data ?? []) as Kudos[],
      challenges: ((ch.data ?? []) as Challenge[]).filter((row) => BY[row.move]),
      // follows and patch uses are newer: if they fail to load, the rest still works
      follows: fo.error ? [] : ((fo.data ?? []) as Follow[]),
      cardUses: cu.error ? [] : ((cu.data ?? []) as { card: string; created_at: string }[]),
      events: ev.error ? [] : ((ev.data ?? []) as IrlEvent[]),
      rsvps: rs.error ? [] : ((rs.data ?? []) as Rsvp[]),
      addresses: ad.error ? {} : Object.fromEntries(((ad.data ?? []) as { event: string; address: string }[]).map((x) => [x.event, x.address])),
      host: !ho.error && ho.data === true,
      loaded: true,
      error: '',
    });
  }, []);

  useEffect(() => {
    const soon = (delay = 300) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(reload, delay);
    };
    soon(0);
    const channel = supabase
      .channel('nerve-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lines' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kudos' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'irl_events' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'irl_rsvps' }, () => soon())
      .subscribe();
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setClock(Date.now());
        reload();
      }
    });
    const tick = setInterval(() => setClock(Date.now()), 60000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      clearInterval(tick);
      app.remove();
      supabase.removeChannel(channel);
    };
  }, [reload]);

  const api = useMemo<Api>(() => {
    const { profiles, lines, comments, kudos, challenges, follows, cardUses, events, rsvps, addresses, host } = store;
    // Your log includes private takes; the feed only shows posted lines.
    const mine = lines.filter((x) => x.author === uid);
    const feed = lines.filter((x) => x.posted !== false);
    const days: Record<string, true> = {};
    for (const x of mine) days[dayKey(ms(x.created_at))] = true;
    const reactors: Record<string, string[]> = {};
    for (const k of kudos) (reactors[k.line_id] ??= []).push(k.author);
    const useCount: Record<string, number> = {};
    for (const u of cardUses) useCount[u.card] = (useCount[u.card] ?? 0) + 1;
    const isPro = !!pro.on;
    const progress = computeProgress(mine, (id) => reactors[id] ?? [], uid, test, useCount, isPro);
    const count = progress.count;
    const open = progress.open;
    const mineIds = new Set(mine.map((x) => x.id));
    const kudosReceived = kudos.filter((x) => mineIds.has(x.line_id)).length;

    // A day counts with a move or a warm-up, but warm-ups alone hold it for at most two days in a row.
    let streak = 0;
    let cursor = clock;
    let warmRun = 0;
    if (!days[dayKey(cursor)] && !warm[dayKey(cursor)]) cursor -= 86400000;
    while (days[dayKey(cursor)] || warm[dayKey(cursor)]) {
      if (days[dayKey(cursor)]) warmRun = 0;
      else if (++warmRun > WARM_MAX) break;
      streak++;
      cursor -= 86400000;
    }
    const movedToday = !!days[dayKey(clock)];
    const warmToday = warm[dayKey(clock)] ?? null;
    const planToday = plan && plan.day === dayKey(clock) ? plan : null;
    // The newest line from someone else in the last two days that you haven't reacted to.
    const reacted = new Set(kudos.filter((x) => x.author === uid).map((x) => x.line_id));
    const lineToBack = feed.find((x) => x.author !== uid && ms(x.created_at) > clock - 2 * 86400000 && !reacted.has(x.id)) ?? null;

    const goingBy: Record<string, string[]> = {};
    for (const r of rsvps) (goingBy[r.event] ??= []).push(r.member);
    const toggleGoing: Api['toggleGoing'] = async (e) => {
      const on = (goingBy[e.id] ?? []).includes(uid);
      const { error } = on
        ? await supabase.from('irl_rsvps').delete().eq('event', e.id).eq('member', uid)
        : await supabase.from('irl_rsvps').insert({ event: e.id, member: uid });
      if (error) return /full/i.test(error.message) ? 'This event is full.' : /no longer open/i.test(error.message) ? 'This event is no longer open.' : SAVE_FAILED;
      await reload();
      return '';
    };
    const saveEvent: Api['saveEvent'] = async (input, id) => {
      const row = {
        title: input.title.slice(0, 60),
        theme: input.theme,
        starts_at: new Date(input.start).toISOString(),
        ends_at: new Date(input.end).toISOString(),
        venue: input.venue.slice(0, 60),
        area: input.area.slice(0, 40),
        what: input.what.slice(0, 300),
        cap: Math.max(2, Math.min(200, Math.round(input.cap) || 16)),
      };
      let eventId = id;
      if (id) {
        const { error } = await supabase.from('irl_events').update(row).eq('id', id);
        if (error) return SAVE_FAILED;
      } else {
        const { data, error } = await supabase.from('irl_events').insert(row).select('id').single();
        if (error || !data) return SAVE_FAILED;
        eventId = (data as { id: string }).id;
      }
      const { error: e2 } = await supabase.from('irl_event_private').upsert({ event: eventId, address: input.address.slice(0, 100) });
      if (e2) return 'The event saved, but the address did not. Edit it to try again.';
      await reload();
      return '';
    };
    const cancelEvent: Api['cancelEvent'] = async (id) => {
      const { error } = await supabase.from('irl_events').update({ off: true }).eq('id', id);
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };

    const active = challenges.filter((x) => ms(x.until) > clock);
    const loggedSince = (moveId: string, at: string) => mine.some((x) => x.move === moveId && ms(x.created_at) >= ms(at));
    const incoming = active.filter((x) => x.target === uid);
    const outgoing = active.filter((x) => x.author === uid);

    const pendingIn = incoming.find((x) => !loggedSince(x.move, x.created_at) && unlocked(BY[x.move], count, open));
    const pendingOut = outgoing.find((x) => !loggedSince(x.move, x.created_at));
    let tonight: Tonight;
    if (pendingIn) tonight = { move: BY[pendingIn.move], together: true, path: false };
    else if (pendingOut) tonight = { move: BY[pendingOut.move], together: true, path: false };
    else {
      // On an open path, tonight's move comes from that path. Otherwise from the base branches.
      // Tonight's move comes from what you're training: a base branch, or a path once it's open.
      const onPath = isPath(branch) && !!open[branch];
      const own = !isPath(branch) || onPath;
      // The next one in your branch or open path, in order, so the card at the top always matches it.
      let pool = own
        ? MOVES.filter((m) => m.b === branch && !m.retired)
            .sort((x, y) => x.lv - y.lv || x.i - y.i)
            .map((m) => m.id)
        : ORDER;
      let ready = pool.filter((id) => !count[id] && unlocked(BY[id], count, open));
      if (!ready.length) ready = pool.filter((id) => unlocked(BY[id], count, open));
      if (!ready.length) {
        pool = ORDER;
        ready = ORDER.filter((id) => !count[id] && unlocked(BY[id], count, open));
        if (!ready.length) ready = ORDER.filter((id) => unlocked(BY[id], count, open));
      }
      const m = BY[ready[skip % ready.length]];
      tonight = { move: m, together: false, path: onPath && m.b === branch, own: own && pool !== ORDER };
    }

    const nameOf = (id: string) => (id === uid ? profiles[id]?.name || 'You' : profiles[id]?.name || 'Someone');
    // Your circle is the people you follow.
    const followed = new Set(follows.filter((f) => f.follower === uid).map((f) => f.followee));
    const circle = Object.values(profiles)
      .filter((x) => x.id !== uid && followed.has(x.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    const partnersFor = (moveId: string) => {
      const out = new Set<string>();
      for (const x of outgoing) if (x.move === moveId) out.add(x.target);
      for (const x of incoming) if (x.move === moveId) out.add(x.author);
      return [...out];
    };
    const partnersOfLine = (line: Line) => {
      const out = new Set<string>();
      const at = ms(line.created_at);
      for (const x of challenges) {
        if (x.move !== line.move || at < ms(x.created_at) || at > ms(x.until)) continue;
        if (x.author === line.author) out.add(x.target);
        else if (x.target === line.author) out.add(x.author);
      }
      return [...out];
    };
    const challengeWith = (other: string) =>
      active.find((x) => (x.author === uid && x.target === other) || (x.author === other && x.target === uid)) ?? null;
    const myChallengeTo = (other: string, moveId?: string) =>
      outgoing.find((x) => x.target === other && (!moveId || x.move === moveId)) ?? null;

    const dropLine: Api['dropLine'] = async ({ move, line, upgrade, recording, posted = true, via = null }) => {
      let path: string | null = null;
      try {
        if (recording) path = await uploadRecording(uid, recording);
      } catch {
        return 'The recording did not upload. Check your connection and try again.';
      }
      const { error } = await supabase.from('lines').insert({
        move,
        line: line.slice(0, 400),
        upgrade,
        media_path: path,
        media_kind: recording ? recording.kind : null,
        media_seconds: recording ? Math.min(1830, Math.round(recording.seconds)) : null,
        posted,
        via: via && move.startsWith('x') ? via : null,
      });
      if (error) {
        if (path) supabase.storage.from(BUCKET).remove([path]);
        return SAVE_FAILED;
      }
      setSkip(0);
      await reload();
      return '';
    };

    // Turns a private take into a post in the feed, with an optional caption.
    const postLine: Api['postLine'] = async (line, caption) => {
      const { error } = await supabase
        .from('lines')
        .update({ posted: true, line: caption.trim().slice(0, 400) || line.line })
        .eq('id', line.id);
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };

    const deleteLine: Api['deleteLine'] = async (line) => {
      const { error } = await supabase.from('lines').delete().eq('id', line.id);
      if (error) return SAVE_FAILED;
      if (line.media_path) supabase.storage.from(BUCKET).remove([line.media_path]);
      await reload();
      return '';
    };

    // Same reaction again takes it back; a different one replaces it.
    const react: Api['react'] = async (lineId, kind) => {
      const current = kudos.find((x) => x.line_id === lineId && x.author === uid);
      // Show it straight away; the reload confirms or corrects it.
      setStore((prev) => {
        const rest = prev.kudos.filter((x) => !(x.line_id === lineId && x.author === uid));
        return { ...prev, kudos: current?.kind === kind ? rest : [...rest, { line_id: lineId, author: uid, kind }] };
      });
      const { error } = !current
        ? await supabase.from('kudos').insert({ line_id: lineId, kind })
        : current.kind === kind
          ? await supabase.from('kudos').delete().eq('line_id', lineId).eq('author', uid)
          : await supabase.from('kudos').update({ kind }).eq('line_id', lineId).eq('author', uid);
      await reload();
      return error ? SAVE_FAILED : '';
    };

    const addComment: Api['addComment'] = async (lineId, body) => {
      const { error } = await supabase.from('comments').insert({ line_id: lineId, body: body.slice(0, 500) });
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };

    const deleteComment: Api['deleteComment'] = async (id) => {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };

    const toggleChallenge: Api['toggleChallenge'] = async (target, moveId) => {
      const existing = outgoing.find((x) => x.target === target && x.move === moveId);
      const { error } = existing
        ? await supabase.from('challenges').delete().eq('id', existing.id)
        : await supabase.from('challenges').insert({ target, move: moveId, until: midnight() });
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };

    const following = follows.filter((f) => f.follower === uid).map((f) => f.followee);
    const followSet = new Set(following);
    const toggleFollow: Api['toggleFollow'] = async (other) => {
      const on = followSet.has(other);
      setStore((prev) => ({
        ...prev,
        follows: on ? prev.follows.filter((f) => !(f.follower === uid && f.followee === other)) : [...prev.follows, { follower: uid, followee: other }],
      }));
      const { error } = on
        ? await supabase.from('follows').delete().eq('follower', uid).eq('followee', other)
        : await supabase.from('follows').insert({ followee: other });
      await reload();
      return error ? SAVE_FAILED : '';
    };
    const redeemInvite: Api['redeemInvite'] = async (code) => {
      const clean = code.trim().toLowerCase().replace(/[^0-9a-f]/g, '');
      if (clean.length !== 8) return { problem: 'Invite codes are 8 letters and numbers.' };
      if (uid.replace(/-/g, '').startsWith(clean)) return { problem: 'That’s your own code. Send it to a friend instead.' };
      const { data, error } = await supabase.rpc('redeem_invite', { code: clean });
      if (error) return { problem: SAVE_FAILED };
      if (!data) return { problem: 'No one has that code. Check it and try again.' };
      await reload();
      return { who: data as string };
    };
    // Leaderboard: 10 points a posted line, 20 with a recording, 2 per reaction from someone else.
    // Up to five lines a day count. Private takes stay private, so they don't count.
    const board: Api['board'] = (period, circleOnly) => {
      const since = (() => {
        if (period === 'all') return 0;
        const x = new Date(clock);
        x.setHours(0, 0, 0, 0);
        x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
        return x.getTime();
      })();
      const by: Record<string, BoardRow & { days: Record<string, number> }> = {};
      const row = (u: string) => (by[u] ??= { uid: u, pts: 0, lines: 0, reacts: 0, days: {} });
      row(uid);
      [...feed]
        .sort((a, b) => ms(a.created_at) - ms(b.created_at))
        .forEach((x) => {
          if (ms(x.created_at) < since) return;
          if (circleOnly && x.author !== uid && !followSet.has(x.author)) return;
          const r = row(x.author);
          const day = dayKey(ms(x.created_at));
          r.days[day] = (r.days[day] ?? 0) + 1;
          if (r.days[day] <= 5) {
            r.pts += x.media_kind ? 20 : 10;
            r.lines++;
          }
          const n = (reactors[x.id] ?? []).filter((u) => u !== x.author).length;
          r.reacts += n;
          r.pts += 2 * n;
        });
      return Object.values(by)
        .map(({ days: _days, ...r }) => r)
        .sort((a, b) => b.pts - a.pts || b.lines - a.lines || (a.uid === uid ? -1 : 1));
    };
    const useCard: Api['useCard'] = async (id) => {
      setStore((prev) => ({ ...prev, cardUses: [...prev.cardUses, { card: id, created_at: new Date().toISOString() }] }));
      const { error } = await supabase.from('card_uses').insert({ card: id });
      await reload();
      return error ? SAVE_FAILED : '';
    };

    const wearTitle: Api['wearTitle'] = async (key) => {
      const { error } = await supabase.from('profiles').update({ title: key || null }).eq('id', uid);
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };
    const setName: Api['setName'] = async (name) => {
      const v = name.trim().replace(/\s+/g, ' ').slice(0, 40);
      if (!v) return 'Your name can’t be empty.';
      const { error } = await supabase.from('profiles').update({ name: v }).eq('id', uid);
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };
    const setAllowNudges: Api['setAllowNudges'] = async (on) => {
      const { error } = await supabase.from('profiles').update({ allow_nudges: on }).eq('id', uid);
      if (error) return SAVE_FAILED;
      await reload();
      return '';
    };
    // Recordings live in storage, which the database can't cascade into, so remove them first.
    const deleteAccount: Api['deleteAccount'] = async () => {
      for (let round = 0; round < 20; round++) {
        const { data, error } = await supabase.storage.from(BUCKET).list(uid, { limit: 100 });
        if (error) return 'Couldn’t delete your recordings. Check your connection and try again.';
        if (!data?.length) break;
        const { error: rmError } = await supabase.storage.from(BUCKET).remove(data.map((f) => `${uid}/${f.name}`));
        if (rmError) return 'Couldn’t delete your recordings. Check your connection and try again.';
      }
      const { error } = await supabase.rpc('delete_my_account');
      if (error) return 'Your account wasn’t deleted. Check your connection and try again.';
      await AsyncStorage.multiRemove(['nerve.branch', 'nerve.test', 'nerve.rope.seen']).catch(() => {});
      await supabase.auth.signOut();
      return '';
    };

    return {
      ...store,
      lines: feed,
      uid,
      reload,
      mine,
      count,
      progress,
      test,
      setTest,
      wearTitle,
      setName,
      setAllowNudges,
      deleteAccount,
      doneCount: progress.done,
      streak,
      kudosReceived,
      circle,
      tonight,
      skipTonight: () => setSkip((n) => n + 1),
      branch,
      setBranch,
      nameOf,
      kudosFor: (lineId) => kudos.filter((x) => x.line_id === lineId),
      commentsFor: (lineId) => comments.filter((x) => x.line_id === lineId),
      partnersFor,
      partnersOfLine,
      incoming,
      challengeWith,
      myChallengeTo,
      dropLine,
      postLine,
      deleteLine,
      react,
      addComment,
      deleteComment,
      toggleChallenge,
      following,
      isFollowing: (other) => followSet.has(other),
      isFollowedBy: (other) => follows.some((f) => f.follower === other && f.followee === uid),
      followersOf: (id) => follows.filter((f) => f.followee === id).length,
      toggleFollow,
      redeemInvite,
      board,
      useCard,
      pro,
      isPro,
      setPro,
      warm,
      warmToday,
      saveWarm,
      plan: planToday,
      savePlan,
      movedToday,
      lineToBack,
      events,
      isHost: host,
      goingTo: (id) => goingBy[id] ?? [],
      amGoing: (id) => (goingBy[id] ?? []).includes(uid),
      addressOf: (id) => addresses[id] ?? '',
      toggleGoing,
      saveEvent,
      cancelEvent,
    };
  }, [store, uid, skip, clock, reload, test, setTest, branch, setBranch, pro, setPro, warm, saveWarm, plan, savePlan]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useNerve(): Api {
  const api = useContext(Ctx);
  if (!api) throw new Error('useNerve must be used inside DataProvider');
  return api;
}

export async function signedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return error || !data ? null : data.signedUrl;
}

export function stamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000,
  );
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function clockText(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
