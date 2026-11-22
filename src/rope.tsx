import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useNerve } from './data';
import type { MountainKey } from './mountains';
import { supabase } from './supabase';

// Rope team: up to four friends who follow each other share one mountain for the week.
// Every write goes through a server function that checks the rules; the app only reads.
export const PER = 8;
export const ROPE_MIN = 3;
export const MEET_DAYS = ['Saturday', 'Sunday'] as const;
export const MEET_TIMES = ['10 am', '2 pm', '7 pm'] as const;
export const REPORT_WHY = ['Made me uncomfortable', 'Pressured me', 'Filmed without asking', 'Didn’t feel safe', 'Something else'] as const;

export type RopeMember = { team: string; member: string; status: 'invited' | 'in' | 'left' | 'declined'; invited_by: string | null; created_at: string };
export type RopeEvent = { id: number; team: string; actor: string; kind: string; target: string | null; note: string | null; created_at: string };
export type RopeMeet = { id: string; team: string; created_by: string; place: number; day: string; at_time: string; week_start: string; cancelled: boolean };
export type RopeRsvp = { meet: string; member: string; going: boolean };
export type RopeTeamRow = { id: string; created_by: string | null; peak: number; streak: number; patches: number };
export type RopeRescue = { team: string; week_start: string; a: string; b: string; move: string };
export type Expedition = { this_month: number; last_month: number; mine: number; my_team: number; active: number };

type State = {
  members: RopeMember[];
  events: RopeEvent[];
  meets: RopeMeet[];
  rsvps: RopeRsvp[];
  counts: Record<string, number>;
  teams: RopeTeamRow[];
  weeks: { team: string; week_start: string; mountain: MountainKey; picked_by: string | null }[];
  rescues: RopeRescue[];
  checkins: { meet: string; member: string }[];
  expedition: Expedition | null;
  loaded: boolean;
};
const EMPTY: State = { members: [], events: [], meets: [], rsvps: [], counts: {}, teams: [], weeks: [], rescues: [], checkins: [], expedition: null, loaded: false };

type Api = State & {
  team: string | null; // the team you're in
  invites: { team: string; from: string; others: string[] }[];
  roster: RopeMember[]; // your team's members who are in or invited
  meet: RopeMeet | null; // this week's meet-up
  info: RopeTeamRow | null; // your team: owner and ladder
  mountain: MountainKey | null; // this week's pick, if any
  rescueWith: (who: string) => RopeRescue | null;
  checkedIn: (who: string) => boolean;
  pick: (mountain: MountainKey) => Promise<string>;
  rescue: (who: string, move: string) => Promise<string>;
  checkIn: () => Promise<string>;
  invite: (who: string) => Promise<string>;
  mutuals: string[];
  unseen: number; // events for you since you last looked
  markSeen: () => void;
  create: (invitees: string[]) => Promise<string>;
  answer: (team: string, accept: boolean) => Promise<string>;
  leave: () => Promise<string>;
  nudge: (who: string) => Promise<string>;
  suggest: (place: number, day: string, time: string) => Promise<string>;
  rsvp: (going: boolean) => Promise<string>;
  cancelMeet: () => Promise<string>;
  report: (who: string, reason: string, leave: boolean) => Promise<string>;
  nudgedToday: (who: string) => boolean;
};

const Ctx = createContext<Api | null>(null);
const SEEN_KEY = 'nerve.rope.seen';

// Monday 00:00 in Toronto, the same week the server uses.
export function weekStartIso(): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'));
  const d = new Date(Date.UTC(Number(get('year')), Number(get('month')) - 1, Number(get('day')) - Math.max(0, days)));
  return d.toISOString().slice(0, 10);
}
export function daysLeft(): number {
  const wd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', weekday: 'short' }).format(new Date());
  return 7 - Math.max(0, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(wd));
}
function torontoDay(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(new Date(iso));
}

function problem(error: { message?: string } | null): string {
  if (!error) return '';
  const m = error.message ?? '';
  // Server checks raise plain sentences; pass those through, hide anything technical.
  return /^[A-Z][^{}<>]{3,120}$/.test(m) ? m : 'That didn’t go through. Check your connection and try again.';
}

export function RopeProvider({ children }: { children: React.ReactNode }) {
  const n = useNerve();
  const uid = n.uid;
  const [s, setS] = useState<State>(EMPTY);
  const [seen, setSeen] = useState<string>('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY).then((v) => setSeen(v ?? '')).catch(() => {});
  }, []);

  const reload = useCallback(async () => {
    const first = await supabase.from('rope_members').select('team,member,status,invited_by,created_at');
    const mineFirst = ((first.data ?? []) as RopeMember[]).find((x) => x.member === uid && x.status === 'in');
    // Close out finished weeks first, so the ladder and the activity are current.
    if (mineFirst) await supabase.rpc('rope_settle', { t: mineFirst.team });
    const [m, e, mt, r, tm, wk, rs, ci, ex] = await Promise.all([
      supabase.from('rope_members').select('team,member,status,invited_by,created_at'),
      supabase.from('rope_events').select('id,team,actor,kind,target,note,created_at').order('created_at', { ascending: false }).limit(60),
      supabase.from('rope_meets').select('id,team,created_by,place,day,at_time,week_start,cancelled'),
      supabase.from('rope_rsvps').select('meet,member,going'),
      supabase.from('rope_teams').select('id,created_by,peak,streak,patches'),
      supabase.from('rope_weeks').select('team,week_start,mountain,picked_by').eq('week_start', weekStartIso()),
      supabase.from('rope_rescues').select('team,week_start,a,b,move').eq('week_start', weekStartIso()),
      supabase.from('rope_checkins').select('meet,member'),
      supabase.rpc('rope_expedition'),
    ]);
    const members = (m.data ?? []) as RopeMember[];
    const mine = members.find((x) => x.member === uid && x.status === 'in');
    let counts: Record<string, number> = {};
    if (mine) {
      const c = await supabase.rpc('rope_counts', { t: mine.team });
      counts = Object.fromEntries(((c.data ?? []) as { member: string; moves: number }[]).map((x) => [x.member, x.moves]));
    }
    setS({
      members,
      events: (e.data ?? []) as RopeEvent[],
      meets: (mt.data ?? []) as RopeMeet[],
      rsvps: (r.data ?? []) as RopeRsvp[],
      counts,
      teams: (tm.data ?? []) as RopeTeamRow[],
      weeks: (wk.data ?? []) as State['weeks'],
      rescues: (rs.data ?? []) as RopeRescue[],
      checkins: (ci.data ?? []) as State['checkins'],
      expedition: ((ex.data ?? []) as Expedition[])[0] ?? null,
      loaded: true,
    });
  }, [uid]);

  useEffect(() => {
    const soon = (delay = 300) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(reload, delay);
    };
    soon(0);
    const channel = supabase
      .channel('nerve-rope')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rope_members' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rope_events' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rope_meets' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rope_rsvps' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rope_weeks' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rope_rescues' }, () => soon())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rope_checkins' }, () => soon())
      .subscribe();
    const app = AppState.addEventListener('change', (st) => {
      if (st === 'active') reload();
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      app.remove();
      supabase.removeChannel(channel);
    };
  }, [reload]);

  // Your own moves move the rope too: refresh the counts when you log one.
  const myLines = n.mine.length;
  useEffect(() => {
    const t = setTimeout(reload, 500);
    return () => clearTimeout(t);
  }, [myLines, reload]);

  const markSeen = useCallback(() => {
    const now = new Date().toISOString();
    setSeen(now);
    AsyncStorage.setItem(SEEN_KEY, now).catch(() => {});
  }, []);

  const api = useMemo<Api>(() => {
    const mine = s.members.find((x) => x.member === uid && x.status === 'in');
    const team = mine?.team ?? null;
    const roster = team ? s.members.filter((x) => x.team === team && (x.status === 'in' || x.status === 'invited')) : [];
    const invites = s.members
      .filter((x) => x.member === uid && x.status === 'invited')
      .map((x) => ({
        team: x.team,
        from: x.invited_by ?? '',
        others: s.members.filter((o) => o.team === x.team && o.member !== uid && o.member !== x.invited_by && (o.status === 'in' || o.status === 'invited')).map((o) => o.member),
      }));
    const week = weekStartIso();
    const meet = team ? s.meets.find((x) => x.team === team && !x.cancelled && x.week_start === week) ?? null : null;
    const followSet = new Set(n.following);
    const mutuals = Object.keys(n.profiles).filter((id) => id !== uid && followSet.has(id) && n.isFollowedBy(id));
    // Alerts: invites waiting, plus nudges at you and meet-up news since you last looked.
    const fresh = s.events.filter(
      (e) => e.actor !== uid && e.created_at > seen && ((e.kind === 'nudged' && e.target === uid) || e.kind === 'meet' || e.kind === 'joined'),
    ).length;
    const unseen = invites.length + fresh;

    const call = async (fn: string, args: Record<string, unknown>) => {
      const { error } = await supabase.rpc(fn, args);
      if (!error) reload();
      return problem(error);
    };

    const info = team ? s.teams.find((x) => x.id === team) ?? null : null;
    const mountain = team ? s.weeks.find((x) => x.team === team)?.mountain ?? null : null;
    return {
      ...s,
      team,
      invites,
      roster,
      meet,
      info,
      mountain,
      rescueWith: (who) => s.rescues.find((x) => x.team === team && ((x.a === uid && x.b === who) || (x.b === uid && x.a === who))) ?? null,
      checkedIn: (who) => !!meet && s.checkins.some((x) => x.meet === meet.id && x.member === who),
      pick: (mountain) => (team ? call('rope_pick', { t: team, mountain }) : Promise.resolve('')),
      rescue: (who, move) => (team ? call('rope_rescue', { t: team, who, move }) : Promise.resolve('')),
      checkIn: () => (meet ? call('rope_check_in', { m: meet.id }) : Promise.resolve('')),
      invite: (who) => (team ? call('rope_invite', { t: team, who }) : Promise.resolve('')),
      mutuals,
      unseen,
      markSeen,
      create: (invitees) => call('rope_create', { invitees }),
      answer: (t, accept) => call('rope_answer', { t, accept }),
      leave: () => (team ? call('rope_leave', { t: team }) : Promise.resolve('')),
      nudge: (who) => (team ? call('rope_nudge', { t: team, who }) : Promise.resolve('')),
      suggest: (place, day, time) => (team ? call('rope_meet', { t: team, place, day, at_time: time }) : Promise.resolve('')),
      rsvp: (going) => (meet ? call('rope_rsvp', { m: meet.id, going }) : Promise.resolve('')),
      cancelMeet: () => (meet ? call('rope_cancel_meet', { m: meet.id }) : Promise.resolve('')),
      report: (who, reason, leave) => (team ? call('rope_report', { t: team, who, reason, leave }) : Promise.resolve('')),
      nudgedToday: (who) => {
        const today = torontoDay(new Date().toISOString());
        return s.events.some((e) => e.team === team && e.actor === uid && e.target === who && e.kind === 'nudged' && torontoDay(e.created_at) === today);
      },
    };
  }, [s, uid, seen, n, reload, markSeen]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useRope(): Api {
  const api = useContext(Ctx);
  if (!api) throw new Error('useRope must be used inside RopeProvider');
  return api;
}
