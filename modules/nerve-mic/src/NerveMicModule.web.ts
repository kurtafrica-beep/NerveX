// A browser records from whichever microphone the computer or phone has selected.
export type MicKind = 'phone' | 'bluetooth' | 'wired' | 'other';
export type MicStart = { kind: MicKind; name: string; connected: boolean; note: string };
export type MicInput = { id: string; type: number; kind: MicKind; name: string };

const none: { start(): Promise<MicStart>; stop(): boolean; inputs(): MicInput[]; recordingFrom(): MicKind | '' } | null = null;
export default none;
