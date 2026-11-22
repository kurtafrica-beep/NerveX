import type React from 'react';
import { useMemo } from 'react';
import { keep as keepTake, playable } from '../takeStore';
import { ENGINE_JS } from './engineSource';
import type { Engine, Span } from './types';

// Web: the same engine runs in the page itself. Decoding uses the browser's
// own audio decoder. Nothing is sent anywhere.

type NR = {
  decodeBuffer: (b: ArrayBuffer) => Promise<{ seconds: number }>;
  enroll: () => ReturnType<Engine['enroll']> extends Promise<infer R> ? R : never;
  analyze: (p: unknown) => Awaited<ReturnType<Engine['analyze']>>;
  render: (keep: Span[]) => ArrayBuffer;
  clear: () => void;
};

let nr: NR | null = null;
function get(): NR {
  if (!nr) {
    new Function(ENGINE_JS)();
    nr = (window as unknown as { NerveRedact: NR }).NerveRedact;
  }
  return nr;
}

// Let the spinner paint before a long synchronous step.
const breathe = () => new Promise((r) => setTimeout(r, 30));

export function useRedactEngine(): { engine: Engine; host: React.ReactNode } {
  const engine = useMemo<Engine>(
    () => ({
      ready: true,
      load: async (uri) => {
        const url = await playable(uri);
        const buf = await (await fetch(url)).arrayBuffer();
        return get().decodeBuffer(buf);
      },
      enroll: async () => {
        await breathe();
        return get().enroll();
      },
      analyze: async (profile) => {
        await breathe();
        return get().analyze(profile);
      },
      render: async (keep) => {
        await breathe();
        const blob = new Blob([get().render(keep)], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const kept = await keepTake(url);
        return kept;
      },
      clear: () => get().clear(),
    }),
    [],
  );
  return { engine, host: null };
}
