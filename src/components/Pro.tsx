import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNerve, type ProState } from '../data';
import { BRANCH, SOCIAL_PATHS, WORK_PATHS, isPath, type BranchKey } from '../moves';
import { C, F } from '../theme';
import { Btn, Sheet, T } from '../ui';

// Nerve Pro: the base tree is free, paths are Pro. This build takes no payment:
// the button flips a flag on this phone. Real billing goes through Google Play.
type Ctx = { openPro: (b?: BranchKey) => void };
const ProCtx = createContext<Ctx>({ openPro: () => {} });
export const useProSheet = () => useContext(ProCtx);

const list = (keys: BranchKey[]) => {
  const names = keys.map((k) => BRANCH[k].name);
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

// What Pro is right now, in a line (Settings uses it too).
export function proText(p: ProState): string {
  if (!p.on) return 'Off. The base tree, warm-ups and your circle are free.';
  const trial = p.trialEnds && p.trialEnds > Date.now() ? ` Free trial until ${new Date(p.trialEnds).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.` : '';
  return `On, ${p.plan === 'month' ? 'monthly' : 'yearly'}.${trial}`;
}

export function ProProvider({ children }: { children: React.ReactNode }) {
  const n = useNerve();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<BranchKey | undefined>();
  const [plan, setPlan] = useState<'year' | 'month'>('year');
  const openPro = useCallback((b?: BranchKey) => {
    setFrom(b);
    setOpen(true);
  }, []);
  const ctx = useMemo(() => ({ openPro }), [openPro]);
  const on = n.isPro;
  const go = () => {
    n.setPro(on ? { on: false } : { on: true, plan, since: Date.now(), trialEnds: plan === 'year' ? Date.now() + 7 * 86400000 : null });
    setOpen(false);
  };
  return (
    <ProCtx.Provider value={ctx}>
      {children}
      <Sheet visible={open} title="Nerve Pro" onClose={() => setOpen(false)}>
        <T style={s.lead}>{from && isPath(from) ? `You’ve earned ${BRANCH[from].name}. Paths are part of Nerve Pro.` : 'Go further once the basics feel easy.'}</T>
        <View style={s.item}>
          <T v="semi">All 11 paths</T>
          <T v="sub">{`${list(SOCIAL_PATHS)}, plus ${list(WORK_PATHS)} for work. Each has a guide, four stages and a capstone.`}</T>
        </View>
        <View style={s.item}>
          <T v="semi">Path versions of every place</T>
          <T v="sub">The coffee shop, the gym and the rest, done the way each path does them.</T>
        </View>
        <T v="small">Free for good: all 125 base moves, warm-ups, your nerves history and your circle.</T>
        {on ? (
          <T v="sub">
            {proText(n.pro)}
          </T>
        ) : (
          <View style={s.plans} accessibilityRole="radiogroup" accessibilityLabel="Plan">
            {(
              [
                ['year', 'Yearly', '$59.99 a year, $5.00 a month', '7 days free'],
                ['month', 'Monthly', '$9.99 a month', ''],
              ] as const
            ).map(([k, t, price, tag]) => (
              <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: plan === k }} onPress={() => setPlan(k)} style={[s.plan, plan === k && s.planOn]}>
                <T v="semi">{t}</T>
                <T v="small">{price}</T>
                {tag ? <T style={s.tag}>{tag}</T> : null}
              </Pressable>
            ))}
          </View>
        )}
        <Btn label={on ? 'Turn Pro off (test)' : plan === 'year' ? 'Start 7 days free' : 'Start monthly'} kind={on ? 'outline' : 'primary'} wide onPress={go} />
        {on ? null : <T v="small">Cancel any time before the trial ends and you pay nothing. Test build: no payment is taken, this turns Pro on on this phone.</T>}
      </Sheet>
    </ProCtx.Provider>
  );
}

const s = StyleSheet.create({
  lead: { fontFamily: F.semi, fontSize: 18, lineHeight: 24 },
  item: { gap: 2, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: C.accent },
  plans: { flexDirection: 'row', gap: 10 },
  plan: { flex: 1, gap: 2, padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  planOn: { borderColor: C.ink, borderWidth: 2.5, backgroundColor: C.accentSoft },
  tag: { fontFamily: F.semi, fontSize: 13, color: C.accentText, marginTop: 2 },
});
