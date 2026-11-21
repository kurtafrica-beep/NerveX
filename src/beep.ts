import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

// One beep when a recording starts, two when it stops.
const SOUNDS = { start: require('../assets/sounds/beep-start.wav'), stop: require('../assets/sounds/beep-stop.wav') };
const players: Partial<Record<keyof typeof SOUNDS, AudioPlayer>> = {};

export function beep(kind: keyof typeof SOUNDS) {
  try {
    const p = (players[kind] ??= createAudioPlayer(SOUNDS[kind]));
    p.seekTo(0);
    p.play();
  } catch {
    // a missed beep shouldn't stop a recording
  }
}

// Let the start beep finish before the microphone opens, so it isn't in the take.
export const START_BEEP_MS = 220;
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
