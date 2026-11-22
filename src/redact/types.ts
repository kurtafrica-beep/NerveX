// Shared shapes for redaction.

export type Span = [number, number]; // seconds

// What the engine reports for one take.
export type Analysis = {
  duration: number;
  you: Span[]; // kept
  them: Span[]; // someone else talking: muted
  youSec: number;
  themSec: number;
  quality: 'good' | 'unsure' | 'one-you' | 'one-them' | 'empty';
  note: string;
};

// Your voice, as numbers. Stays on this phone or browser; never uploaded.
export type VoiceProfile = { v: 1; mu: (number | null)[]; sd: number[]; n: number; sec: number };

// Saved with a redacted take so playback can show the muted stretches and
// what the person said in them (written by you, optional).
export type Redaction = { v: 1; them: { s: number; e: number; cap?: string }[] };

export type Engine = {
  ready: boolean;
  load: (uri: string) => Promise<{ seconds: number }>;
  enroll: () => Promise<{ profile?: VoiceProfile; error?: string }>;
  analyze: (profile: VoiceProfile) => Promise<Analysis & { error?: string }>;
  // Writes the redacted WAV and returns a URI the recorder flow can save.
  render: (keep: Span[]) => Promise<string>;
  clear: () => void;
};
