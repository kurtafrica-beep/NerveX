import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stamp, useNerve, type Line } from '../data';
import { ALL_KEYS, BRANCH, BY, PATH_KEYS } from '../moves';
import { ACH, HUE, TIERS, TIER_EMOJI, TITLES, computeProgress } from '../progress';
import { CARDS } from '../rpgData';
import { supabase } from '../supabase';
import { C, F } from '../theme';
import { Avatar, Btn, T } from '../ui';
import { Emo } from './ArtIcon';
import { BaseMountains } from './Mountains';
import { TitleChip } from './LineCard';
import { Patch } from './Patches';

type Logged = { id: string; move: string; posted: boolean; media_kind: string | null; upgrade: boolean; via?: string | null; created_at: string };

const dayKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

// A friend's profile: what they've done, from the lines they've posted. Private takes and reflections never show here.
export function Profile({ uid, onClose, onOpenMove, onError }: { uid: string; onClose: () => void; onOpenMove?: (id: string) => void; onError: (message: string) => void }) {
  const n = useNerve();
  const insets = useSafeAreaInsets();
  const [lines, setLines] = useState<Line[] | null>(null);
  // Every move they've logged, private takes included, without their words (for levels, titles and patches).
  const [moves, setMoves] = useState<Logged[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());

  // Their own posted lines, all of them, not just what's in the feed.
  useEffect(() => {
    let live = true;
    supabase
      .from('lines')
      .select('*')
      .eq('author', uid)
      .eq('posted', true)
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (!live) return;
        const fallback = n.lines.filter((x) => x.author === uid && x.posted !== false);
        setLines(error ? fallback : ((data ?? []) as Line[]).filter((x) => BY[x.move]));
      });
    supabase.rpc('profile_moves', { target: uid }).then(({ data, error }) => {
      if (!live) return;
      setMoves(error ? null : ((data ?? []) as Logged[]).filter((x) => BY[x.move]));
    });
    return () => {
      live = false;
    };
    // n.lines only serves as a fallback; reloading on every feed change isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const info = useMemo(() => {
    if (!lines) return null;
    // If the full list didn't load, fall back to what they've posted.
    const all = moves && moves.length >= lines.length ? moves : lines;
    const p = computeProgress(all, (id) => n.kudosFor(id).map((k) => k.author), uid, false, {});
    const days: Record<string, true> = {};
    for (const x of all) days[dayKey(new Date(x.created_at).getTime())] = true;
    let streak = 0;
    let cursor = now;
    if (!days[dayKey(cursor)]) cursor -= 86400000;
    while (days[dayKey(cursor)]) {
      streak++;
      cursor -= 86400000;
    }
    const reactions = lines.reduce((t, x) => t + n.kudosFor(x.id).filter((k) => k.author !== uid).length, 0);
    return { p, streak, reactions };
  }, [lines, moves, n, uid, now]);

  const person = n.profiles[uid];
  const name = n.nameOf(uid);
  const following = n.isFollowing(uid);
  const mine = n.myChallengeTo(uid);
  const tonight = n.tonight.move;

  const titles = info ? ALL_KEYS.flatMap((b) => TITLES[b].slice(0, info.p.levels[b]).map((text, i) => ({ key: `${b}${i + 1}`, b, text, i }))) : [];
  const patches = info ? CARDS.filter((c) => info.p.cards.includes(c.id)) : [];
  const achs = info ? ACH.filter((a) => info.p.ach[a.k].done) : [];
  const paths = info ? PATH_KEYS.filter((b) => info.p.paths[b].met) : [];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.shade} accessibilityLabel="Close" onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 12 }}>
          <View style={s.head}>
            <Avatar name={name} url={person?.avatar_url} size={60} />
            <View style={{ flex: 1, gap: 4 }}>
              <T style={s.name}>{name}</T>
              <TitleChip uid={uid} />
              {n.isFollowedBy(uid) ? <T v="small">Follows you</T> : null}
            </View>
            <Btn label="Close" kind="quiet" small onPress={onClose} />
          </View>

          {uid === n.uid ? null : (
            <View style={s.actions}>
              <Btn
                label={following ? 'Unfollow' : 'Follow'}
                kind={following ? 'quiet' : 'primary'}
                small
                disabled={busy}
                onPress={async () => {
                  setBusy(true);
                  const problem = await n.toggleFollow(uid);
                  setBusy(false);
                  if (problem) onError(problem);
                }}
              />
              {following ? (
                <Btn
                  label={mine ? 'Undo challenge' : `Challenge: ${tonight.title}`}
                  kind="outline"
                  small
                  disabled={busy}
                  onPress={async () => {
                    setBusy(true);
                    const problem = await n.toggleChallenge(uid, mine ? mine.move : tonight.id);
                    setBusy(false);
                    if (problem) onError(problem);
                  }}
                />
              ) : null}
            </View>
          )}

          {!info ? (
            <ActivityIndicator color={C.accent} style={{ marginVertical: 24 }} />
          ) : (
            <>
              <View style={s.stats}>
                <Stat value={String(info.p.level)} label="Level" />
                <Stat value={String(info.p.done)} label="Moves done" />
                <Stat value={String(info.streak)} label="Streak" />
                <Stat value={String(info.reactions)} label="Reactions" />
              </View>

              <BaseMountains p={info.p} onOpen={() => {}} />

              <Section title="Titles" count={titles.length}>
                {titles.length ? (
                  <View style={s.chips}>
                    {titles.map((t) => (
                      <View key={t.key} style={[s.chip, { borderColor: HUE[t.b][0], backgroundColor: HUE[t.b][1] }]} accessibilityLabel={`${t.text}, ${TIERS[t.i]} badge`}>
                        <T style={[s.chipText, { color: HUE[t.b][0] }]}>{`${TIER_EMOJI[t.i]} ${t.text}`}</T>
                      </View>
                    ))}
                  </View>
                ) : (
                  <T v="sub">None yet. A title comes with each finished level.</T>
                )}
              </Section>

              {paths.length ? (
                <Section title="Paths open" count={paths.length}>
                  <View style={s.chips}>
                    {paths.map((b) => (
                      <View key={b} style={[s.chip, { borderColor: HUE[b][0] }]}>
                        <T style={[s.chipText, { color: HUE[b][0] }]}>{BRANCH[b].name}</T>
                      </View>
                    ))}
                  </View>
                </Section>
              ) : null}

              <Section title="Patches" count={patches.length}>
                {patches.length ? (
                  <View style={s.patches}>
                    {patches.map((c) => (
                      <View key={c.id} style={s.patch}>
                        <Patch card={c} mode="earned" size={56} />
                        <T v="small" style={{ textAlign: 'center', fontSize: 12, lineHeight: 15 }} numberOfLines={2}>
                          {c.t}
                        </T>
                      </View>
                    ))}
                  </View>
                ) : (
                  <T v="sub">None yet.</T>
                )}
              </Section>

              <Section title="Achievements" count={achs.length}>
                {achs.length ? (
                  <View style={s.chips}>
                    {achs.map((a) => (
                      <View key={a.k} style={[s.chip, s.ach]}>
                        <Emo e={a.e} size={18} />
                        <T style={s.chipText}>{a.t}</T>
                      </View>
                    ))}
                  </View>
                ) : (
                  <T v="sub">None yet.</T>
                )}
              </Section>

              <Section title="Recent lines" count={lines?.length ?? 0}>
                {lines && lines.length ? (
                  <View style={{ gap: 10 }}>
                    {lines.slice(0, 5).map((x) => (
                      <Pressable
                        key={x.id}
                        accessibilityRole="button"
                        disabled={!onOpenMove}
                        onPress={() => {
                          onClose();
                          onOpenMove?.(x.move);
                        }}
                        style={s.line}>
                        <T v="semi" style={{ fontSize: 16 }}>
                          {BY[x.move].title}
                        </T>
                        {x.line ? <T style={{ fontSize: 16, lineHeight: 22 }}>{x.line}</T> : null}
                        <T v="small">{`${stamp(x.created_at)}${x.media_kind ? `, ${x.media_kind === 'voice' ? 'voice note' : 'video'}` : ''}`}</T>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <T v="sub">{`${name} hasn’t posted a line yet.`}</T>
                )}
              </Section>
              <T v="small">Levels and badges count every move they’ve done. What they wrote in private takes, and how they felt, stays private.</T>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <T style={s.h3}>{title}</T>
        <T v="semi" style={{ marginLeft: 'auto', color: C.muted }}>
          {count}
        </T>
      </View>
      {children}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.stat}>
      <T style={s.statNum} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </T>
      <T v="small" style={{ fontFamily: F.semi, fontSize: 12 }} numberOfLines={1}>
        {label}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  shade: { flex: 1, backgroundColor: 'rgba(20,28,24,0.45)' },
  sheet: { maxHeight: '92%', paddingHorizontal: 16, paddingTop: 18, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderTopWidth: 2, borderColor: C.ink, backgroundColor: C.surface },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: F.display, fontSize: 28, lineHeight: 32, color: C.ink },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stats: { flexDirection: 'row', gap: 6 },
  stat: { flex: 1, minWidth: 0, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, backgroundColor: C.bg, gap: 2 },
  statNum: { fontFamily: F.display, fontSize: 26, lineHeight: 30, color: C.ink },
  section: { gap: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line },
  h3: { fontFamily: F.display, fontSize: 20, lineHeight: 24, color: C.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: C.line },
  chipText: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.ink },
  ach: { borderColor: C.accent, backgroundColor: C.accentSoft },
  patches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  patch: { width: 72, alignItems: 'center', gap: 4 },
  line: { gap: 3, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg },
});
