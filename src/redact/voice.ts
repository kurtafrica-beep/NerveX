import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { VoiceProfile } from './types';

// Your enrolled voice lives only on this device (AsyncStorage on Android,
// localStorage in a browser). It is a short list of numbers, not audio.
const KEY = 'nerve.voice.v1';
const MUTE_KEY = 'nerve.voice.mute';

let cached: VoiceProfile | null | undefined;
let mute: boolean | undefined;
const listeners = new Set<() => void>();
const ping = () => listeners.forEach((f) => f());

async function loadAll() {
  if (cached === undefined) {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      cached = raw ? (JSON.parse(raw) as VoiceProfile) : null;
    } catch {
      cached = null;
    }
  }
  if (mute === undefined) {
    try {
      mute = (await AsyncStorage.getItem(MUTE_KEY)) !== 'off';
    } catch {
      mute = true;
    }
  }
}

export async function saveVoice(p: VoiceProfile) {
  cached = p;
  mute = true;
  await AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
  await AsyncStorage.setItem(MUTE_KEY, 'on').catch(() => {});
  ping();
}

export async function forgetVoice() {
  cached = null;
  await AsyncStorage.removeItem(KEY).catch(() => {});
  ping();
}

export async function setMuteOthers(on: boolean) {
  mute = on;
  await AsyncStorage.setItem(MUTE_KEY, on ? 'on' : 'off').catch(() => {});
  ping();
}

// profile: undefined while loading, null when not set up.
// muteOthers: whether voice takes go through redaction before saving.
export function useVoice() {
  const [, tick] = useState(0);
  useEffect(() => {
    const f = () => tick((n) => n + 1);
    listeners.add(f);
    loadAll().then(f);
    return () => {
      listeners.delete(f);
    };
  }, []);
  return { profile: cached, muteOthers: !!cached && mute !== false };
}

// The passage you read to set up your voice: about 25 seconds aloud, with a
// spread of sounds so the description is a fair one.
export const PASSAGE =
  'I’m setting up Nerve so it knows my voice. When I talk to someone new, it keeps my side and mutes theirs. ' +
  'Yesterday I grabbed a coffee, walked the long way home and asked a stranger which bus goes north. ' +
  'She laughed, pointed at the stop across the road, and told me the number six is always late. ' +
  'That was my move for the day. Short, a little awkward, and better than saying nothing.';
