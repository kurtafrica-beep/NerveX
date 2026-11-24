import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Before and after a move: how nervous you were, what you feared, and whether it happened.
// Reflections are private. Only the author can read them (row level security on public.reflections).

export const NERVE_WORDS = ['Calm', 'A little', 'Nervous', 'Very', 'Dreading'] as const;
export type Went = 'well' | 'mixed' | 'rough';
export type Feared = 'no' | 'partly' | 'yes';
export const WENT: [Went, string][] = [['well', 'Went well'], ['mixed', 'Mixed'], ['rough', 'Rough']];
export const FEARED: [Feared, string][] = [['no', 'No'], ['partly', 'Partly'], ['yes', 'Yes']];

export type Step = 'do' | 'after';
export type Flow = { step: Step; before: number; fear: string; went: Went | ''; after: number; feared: Feared | ''; at: number };
export const freshFlow = (at: number): Flow => ({ step: 'do', before: 0, fear: '', went: '', after: 0, feared: '', at });

export type Reflection = {
  id: string;
  move: string;
  upgrade: boolean;
  nerve_before: number | null;
  nerve_after: number | null;
  went: Went | null;
  fear: string | null;
  feared: Feared | null;
  created_at: string;
};

// Answers in progress are kept on the phone for 18 hours, so you can leave to do the move and come back.
const FLOW_KEY = 'nerve.flow';
const FLOW_HOURS = 18;

export async function loadFlow(key: string): Promise<Flow | null> {
  try {
    const all = JSON.parse((await AsyncStorage.getItem(FLOW_KEY)) ?? '{}') as Record<string, Flow>;
    const f = all[key];
    return f && Date.now() - f.at < FLOW_HOURS * 3600000 ? { ...f, step: f.step === 'after' ? 'after' : 'do' } : null;
  } catch {
    return null;
  }
}

export async function saveFlow(key: string, flow: Flow | null) {
  try {
    const all = JSON.parse((await AsyncStorage.getItem(FLOW_KEY)) ?? '{}') as Record<string, Flow>;
    const now = Date.now();
    for (const k of Object.keys(all)) if (now - all[k].at > FLOW_HOURS * 3600000) delete all[k];
    if (flow) all[key] = { ...flow, at: now };
    else delete all[key];
    await AsyncStorage.setItem(FLOW_KEY, JSON.stringify(all));
  } catch {
    // Not saved on this phone. The answers still hold while the screen is open.
  }
}

export async function myReflections(): Promise<Reflection[]> {
  const { data } = await supabase
    .from('reflections')
    .select('id,move,upgrade,nerve_before,nerve_after,went,fear,feared,created_at')
    .order('created_at', { ascending: true })
    .limit(400);
  return (data as Reflection[] | null) ?? [];
}

export async function addReflection(move: string, upgrade: boolean, f: Flow): Promise<Reflection | null> {
  const fear = f.fear.trim().slice(0, 120);
  const { data, error } = await supabase
    .from('reflections')
    .insert({
      move,
      upgrade,
      nerve_before: f.before || null,
      nerve_after: f.after || null,
      went: f.went || null,
      fear: fear || null,
      feared: fear && f.feared ? f.feared : null,
    })
    .select('id,move,upgrade,nerve_before,nerve_after,went,fear,feared,created_at')
    .single();
  return error ? null : (data as Reflection);
}

const WORD = ['', 'One', 'Two', 'Three', 'Four'];

// The analysis after you drop the line: this time, against what you expected, against your history.
export function analyse(r: Reflection, history: Reflection[], hasUpgrade: boolean) {
  const out: { nerves?: { b: number; a: number; text: string }; fear?: { said: string; text: string }; pattern?: string; last?: string; next: string; upgrade: boolean } = {
    next: '',
    upgrade: false,
  };
  const b = r.nerve_before ?? 0;
  const a = r.nerve_after ?? 0;
  if (b && a) {
    const d = b - a;
    out.nerves = {
      b,
      a,
      text: d > 0 ? `${WORD[d]} lower than you braced for. The dread was bigger than the thing.` : d === 0 ? 'About what you expected. That still counts as a rep.' : 'Harder than you expected. Hard ones do the most work.',
    };
  }
  if (r.fear && r.feared) {
    out.fear = {
      said: r.fear,
      text: r.feared === 'no' ? 'It didn’t happen.' : r.feared === 'partly' ? 'It partly happened, and you got through it.' : 'It happened, and you still did it. That’s the skill.',
    };
  }
  const all = [...history.filter((x) => x.id !== r.id), r];
  const both = all.filter((x) => x.nerve_before && x.nerve_after);
  const fears = all.filter((x) => x.fear && x.feared);
  const lines: string[] = [];
  if (both.length >= 2) {
    const avg = both.reduce((s, x) => s + ((x.nerve_before ?? 0) - (x.nerve_after ?? 0)), 0) / both.length;
    lines.push(avg > 0.05 ? `Across ${both.length} moves, your nerves came in ${avg.toFixed(1)} lower than you braced for.` : `Across ${both.length} moves, your nerves landed about where you expected.`);
  }
  if (fears.length >= 2) lines.push(`What you feared fully happened ${fears.filter((x) => x.feared === 'yes').length} of ${fears.length} times.`);
  if (lines.length) out.pattern = lines.join(' ');
  const prev = history.filter((x) => x.move === r.move && x.id !== r.id);
  if (prev.length) {
    const p = prev[prev.length - 1];
    const wentWord = { well: 'went well', mixed: 'mixed', rough: 'rough' };
    out.last = `${p.went ? `It was ${wentWord[p.went]}` : 'Logged'}${p.nerve_before && p.nerve_after ? `, nerves ${p.nerve_before} → ${p.nerve_after}` : ''}. This is time ${prev.length + 1}.`;
  }
  if (r.went === 'well' && a && a <= 2 && !r.upgrade && hasUpgrade) {
    out.next = 'That looked easy. The upgrade is the same move, one notch harder.';
    out.upgrade = true;
  } else if (r.went === 'rough') out.next = 'Do it again tomorrow. Repeating it is what shrinks it.';
  else out.next = 'One more rep here, then move on when it feels routine.';
  return out;
}
