import type { useAudioRecorder } from 'expo-audio';
import { Platform } from 'react-native';

type Recorder = ReturnType<typeof useAudioRecorder>;
export type Mic = 'phone' | 'bluetooth' | 'wired';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Record from a headset when one is connected: Bluetooth first, then wired.
// Left alone, Android records from the phone's own mic even with earbuds in.
// Call this after prepareToRecordAsync and before record(). Android only;
// a browser uses whichever microphone the computer or phone has selected.
export async function pickHeadsetMic(recorder: Recorder): Promise<Mic> {
  if (Platform.OS !== 'android') return 'phone';
  try {
    const inputs = recorder.getAvailableInputs();
    const pick = inputs.find((i) => i.type === 'BluetoothSCO') ?? inputs.find((i) => i.type === 'MicrophoneWired');
    if (!pick) return 'phone';
    recorder.setInput(pick.uid);
    if (pick.type !== 'BluetoothSCO') return 'wired';
    // The Bluetooth mic link takes a moment to open; recording before it is up
    // loses the first words.
    await wait(700);
    return 'bluetooth';
  } catch {
    return 'phone';
  }
}

// Hand the headset back after a take. While its mic link is open, anything
// played through the headset sounds like a phone call.
export function releaseHeadsetMic(recorder: Recorder) {
  if (Platform.OS !== 'android') return;
  try {
    const builtIn = recorder.getAvailableInputs().find((i) => i.type === 'MicrophoneBuiltIn');
    if (builtIn) recorder.setInput(builtIn.uid);
  } catch {
    // nothing to hand back
  }
}

export const MIC_LABEL: Record<Mic, string> = {
  phone: 'Phone mic',
  bluetooth: 'Bluetooth mic',
  wired: 'Headset mic',
};
