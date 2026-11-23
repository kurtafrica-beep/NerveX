import NerveMic from '../modules/nerve-mic/src/NerveMicModule';

// 'missed' means a Bluetooth mic was there but the take is coming from the phone anyway.
export type Mic = 'phone' | 'bluetooth' | 'wired' | 'missed';

// Record from a headset when one is connected. Left alone, Android records
// from the phone's own mic even with Bluetooth earbuds in. Call this before
// record(): it resolves once the headset's mic is ready, which takes a second
// or two on Bluetooth. Android only (modules/nerve-mic); a browser uses
// whichever microphone the computer or phone has selected.
export async function openHeadsetMic(): Promise<Mic> {
  if (!NerveMic) return 'phone';
  try {
    const r = await NerveMic.start();
    const mic = r.kind === 'bluetooth' || r.kind === 'wired' ? r.kind : 'phone';
    last = `${MIC_LABEL[mic]}${r.name && mic !== 'phone' ? ` (${r.name})` : ''}${r.note ? `: ${r.note}` : ''}`;
    return mic;
  } catch (e) {
    last = `Phone mic: ${e instanceof Error ? e.message : 'the headset could not be opened'}`;
    return 'phone';
  }
}

// What happened the last time a take opened the mic, for the Account screen.
let last = '';
export const lastMic = () => last;

// Hand the headset back after a take. While its mic is open, anything played
// through it sounds like a phone call.
export function closeHeadsetMic() {
  try {
    NerveMic?.stop();
  } catch {
    // nothing to hand back
  }
}

// A second or so into a take, ask Android which mic the sound is really coming from.
export function micInUse(expected: Mic): Mic {
  try {
    const kind = NerveMic?.recordingFrom() ?? '';
    if (kind === 'bluetooth' || kind === 'wired') return kind;
    if (kind === 'phone') {
      if (expected !== 'bluetooth') return 'phone';
      last = `${last}. The sound still came from the phone`;
      return 'missed';
    }
  } catch {
    // keep what we expected
  }
  return expected;
}

// The microphones Android can see, for the Account screen.
export function micsSeen(): string[] {
  try {
    const seen = NerveMic?.inputs() ?? [];
    const label = { phone: 'Phone mic', bluetooth: 'Bluetooth mic', wired: 'Headset mic', other: 'Other input' } as const;
    const lines = seen.map((m) => `${label[m.kind]}${m.kind !== 'phone' && m.name ? ` (${m.name})` : ''}${m.kind === 'other' ? ` type ${m.type}` : ''}`);
    return [...new Set(lines)];
  } catch {
    return [];
  }
}

export const MIC_LABEL: Record<Mic, string> = {
  phone: 'Phone mic',
  bluetooth: 'Bluetooth mic',
  wired: 'Headset mic',
  missed: 'Phone mic. The headset’s mic didn’t connect',
};
