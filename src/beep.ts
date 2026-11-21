import { createAudioPlayer, type AudioPlayer, type AudioStatus } from 'expo-audio';

// One beep when a recording starts, two when it stops.
// Each sound file opens with a short stretch of silence: Android drops the first
// few dozen milliseconds while its audio output wakes up (worse on Bluetooth),
// and that used to eat the front of the start beep.
const SOUNDS = { start: require('../assets/sounds/beep-start.wav'), stop: require('../assets/sounds/beep-stop.wav') };
type Kind = keyof typeof SOUNDS;
const players: Partial<Record<Kind, AudioPlayer>> = {};

function player(kind: Kind) {
  return (players[kind] ??= createAudioPlayer(SOUNDS[kind]));
}

// Load both sounds ahead of time so the first beep isn't late.
export function warmBeeps() {
  try {
    player('start');
    player('stop');
  } catch {}
}
warmBeeps();

const waitFor = (p: AudioPlayer, test: (s: AudioStatus) => boolean, ms: number) =>
  new Promise<void>((done) => {
    const timer = setTimeout(finish, ms);
    const sub = p.addListener('playbackStatusUpdate', (s) => test(s) && finish());
    function finish() {
      clearTimeout(timer);
      sub.remove();
      done();
    }
  });

// Resolves once the beep has finished playing (or after a safety timeout), so
// callers can open the microphone without cutting the beep off or recording it.
export async function beep(kind: Kind): Promise<void> {
  try {
    const p = player(kind);
    if (!p.isLoaded) await waitFor(p, (s) => s.isLoaded, 800);
    await p.seekTo(0);
    const finished = waitFor(p, (s) => s.didJustFinish, 1200);
    p.play();
    await finished;
  } catch {
    // a missed beep shouldn't stop a recording
  }
}

// A little air after the beep before the microphone opens.
export const AFTER_BEEP_MS = 60;
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
