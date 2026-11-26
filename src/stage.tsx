import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNerve } from './data';
import { useRope } from './rope';

// What shows when. The app grows with what you have done, so day one is one move and nothing to study.
// 0: nothing logged yet. 1: a first move. 2: three moves. It never goes back down.
export type Stage = 0 | 1 | 2;

export const STAGE_NOTE = [
  'After your first move: the full list of moves.',
  'After three moves: places to practise, a rope team with friends and the leaderboard.',
];
const STAGE_NEW = [
  '',
  'Your full list of moves is now on Moves.',
  'Places are now on Moves. A rope team and the leaderboard are in Community, and paths and awards are under You.',
];

type Api = {
  stage: Stage;
  // On a rope team or invited to one: the rope team shows whatever the stage.
  roped: boolean;
  // Settings switch: see the first-day version of every tab for this visit.
  fresh: boolean;
  setFresh: (on: boolean) => void;
  intro: boolean;
  replayIntro: () => void;
  closeIntro: () => void;
  // What just opened, to say once on the result of the move that opened it.
  news: string;
  markNewsSeen: () => void;
};

const Ctx = createContext<Api | null>(null);
const num = (v: string | null) => (v == null ? null : Number(v) || 0);

export function StageProvider({ children }: { children: React.ReactNode }) {
  const n = useNerve();
  const rope = useRope();
  const logs = n.mine.length;
  const now: Stage = logs >= 3 ? 2 : logs >= 1 ? 1 : 0;
  // undefined: not read from the phone yet. null: read, nothing saved.
  const [seen, setSeen] = useState<number | null | undefined>(undefined);
  const [told, setTold] = useState<number | null | undefined>(undefined);
  const [introSeen, setIntroSeen] = useState<boolean | undefined>(undefined);
  const [fresh, setFresh] = useState(false);
  const [replay, setReplay] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['nerve.stage', 'nerve.stageTold', 'nerve.intro'])
      .then((rows) => {
        setSeen(num(rows[0][1]));
        setTold(num(rows[1][1]));
        setIntroSeen(rows[2][1] === '1');
      })
      .catch(() => {
        setSeen(null);
        setTold(null);
        setIntroSeen(false);
      });
  }, []);

  const kept = Math.max(now, seen ?? 0) as Stage;
  // Remember the highest stage reached, so deleting a line never takes things away.
  useEffect(() => {
    if (seen === undefined || !n.loaded || now <= (seen ?? 0)) return;
    AsyncStorage.setItem('nerve.stage', String(now))
      .then(() => setSeen(now))
      .catch(() => {});
  }, [now, seen, n.loaded]);
  // Someone who already has moves on a new phone: nothing is news to them.
  useEffect(() => {
    if (told !== null || !n.loaded) return;
    const base = logs > 0 ? kept : 0;
    AsyncStorage.setItem('nerve.stageTold', String(base))
      .then(() => setTold(base))
      .catch(() => setTold(base));
  }, [told, n.loaded, logs, kept]);

  const stage: Stage = fresh ? 0 : n.test ? 2 : kept;
  const closeIntro = useCallback(() => {
    setReplay(false);
    setIntroSeen(true);
    AsyncStorage.setItem('nerve.intro', '1').catch(() => {});
  }, []);
  const replayIntro = useCallback(() => setReplay(true), []);
  const markNewsSeen = useCallback(() => {
    setTold((t) => {
      if (typeof t !== 'number' || kept <= t) return t;
      AsyncStorage.setItem('nerve.stageTold', String(kept)).catch(() => {});
      return kept;
    });
  }, [kept]);

  const api = useMemo<Api>(
    () => ({
      stage,
      roped: !!rope.team || rope.invites.length > 0,
      fresh,
      setFresh,
      // Shown once, to someone whose feed has loaded and who has nothing logged.
      intro: replay || (n.loaded && !n.error && introSeen === false && logs === 0),
      replayIntro,
      closeIntro,
      news: !fresh && !n.test && typeof told === 'number' && kept > told ? STAGE_NEW[kept] : '',
      markNewsSeen,
    }),
    [stage, rope.team, rope.invites.length, fresh, replay, n.loaded, n.error, n.test, introSeen, logs, replayIntro, closeIntro, told, kept, markNewsSeen],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStage(): Api {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStage outside StageProvider');
  return v;
}
