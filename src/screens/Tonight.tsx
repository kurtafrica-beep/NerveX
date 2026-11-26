import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LevelVideoRow } from '../components/Example';
import { BranchBanner, Patch, PlaceBanner, PlacePoster } from '../components/Patches';
import { ArtImage, Emo } from '../components/ArtIcon';
import { BRANCH_ICON, PLACE_ICON, PLACE_POSTER } from '../artImages';
import { PLACES } from '../rpgData';
import { PLACE_HUE, REGULAR_XP, REP_BONUS, dayNum, placeCard } from '../progress';
import { useNerve } from '../data';
import { STAGE_NOTE, useStage } from '../stage';
import { BRANCH, BRANCH_KEYS, BY, CAP_REACTS, LEVELS, MOVES, PATH, PATH_KEYS, SOCIAL_PATHS, WORK_PATHS, isPath, label, levelDone, levelMoves, lvTitle, lvWord, type BranchKey, type PathKey } from '../moves';
import { lensed, moveKey } from '../placePaths';
import { MENTOR, MentorFace } from '../components/Mentor';
import { levelVideo } from '../videos';
import { HUE, TIERS, TIER_EMOJI, TITLES, branchState, levelBonus, moveXp, type Req } from '../progress';
import { C, F } from '../theme';
import { Btn, Card, Dots, Fold, Seg, Sheet, T } from '../ui';
import { useProSheet } from '../components/Pro';
import { WarmCard } from '../components/Warm';

export function Tonight({ onOpenMove, onToast }: { onOpenMove: (id: string) => void; onToast?: (msg: string) => void }) {
  const n = useNerve();
  const { stage } = useStage();
  const { openPro } = useProSheet();
  const branch = n.branch;
  const [picking, setPicking] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [stagePick, setStagePick] = useState<Partial<Record<BranchKey, number>>>({});
  const scroller = useRef<{ scrollTo: (o: { y: number; animated: boolean }) => void } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const move = n.tonight.move;
  const mates = n.partnersFor(move.id);
  const p = n.progress;
  const path = isPath(branch);
  const pOpen = !path || !!p.open[branch];
  const [bc] = HUE[branch];
  const current = (() => {
    if (!pOpen) return 1;
    for (const k of LEVELS) if (!levelDone(branch, k, n.count)) return k;
    return 5;
  })();
  const shown = stagePick[branch] ?? current;
  // Earned but no Pro: the gate offers Pro instead of a list of requirements.
  const proWall = path && !n.test && !n.isPro;
  const earnedNoPro = proWall && !!p.paths[branch as PathKey]?.met;
  const pick = (b: BranchKey) => {
    if (isPath(b) && !n.test && !n.isPro && p.paths[b as PathKey]?.met) {
      setPicking(false);
      openPro(b);
      return;
    }
    n.setBranch(b);
    setPicking(false);
    scroller.current?.scrollTo({ y: 0, animated: true });
  };
  // Where you are in one line: this level, how many to go, a dot per move.
  const lvMoves = levelMoves(branch, current);
  const nextIdx = lvMoves.findIndex((m) => !n.count[m.id]);
  const left = lvMoves.filter((m) => !n.count[m.id]).length;

  return (
    <ScrollView
      ref={(el) => {
        scroller.current = el as unknown as { scrollTo: (o: { y: number; animated: boolean }) => void } | null;
      }}
      contentContainerStyle={s.view}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={C.accent}
          onRefresh={async () => {
            setRefreshing(true);
            await n.reload();
            setRefreshing(false);
          }}
        />
      }>
      {stage === 0 ? (
        <View style={s.firstDay}>
          <T v="h">Your first move</T>
          <T style={{ fontSize: 18, lineHeight: 25 }}>Nerve is practice for being less nervous around people. One small move a day.</T>
        </View>
      ) : null}

      {n.incoming.map((c) => (
        <View key={c.id} style={s.invite}>
          <T style={{ flex: 1, fontSize: 15, lineHeight: 20 }}>
            <T v="semi" style={{ fontSize: 15 }}>
              {n.nameOf(c.author)}
            </T>{' '}
            challenged you: {BY[c.move].title}. Until midnight.
          </T>
          <Btn label="Open" small onPress={() => onOpenMove(c.move)} />
        </View>
      ))}

      {/* One card: what you're training, where you are in it, and the one move to do next. */}
      <Card style={[s.branchCard, { borderLeftColor: bc }]}>
        <View style={s.movesHead}>
          <View style={{ flex: 1 }}>
            <T style={s.pathKicker}>{path ? 'Your path' : 'Your branch'}</T>
            <T style={[s.branchName, { color: bc }]} accessibilityRole="header">
              {BRANCH[branch].name}
              {path ? ' path' : ''}
            </T>
          </View>
          <Btn label="Change" small onPress={() => setPicking(true)} />
        </View>
        {MENTOR[branch] ? (
          <View style={s.mentorIntro}>
            <MentorFace b={branch} size={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <T v="semi">{`Your guide: ${MENTOR[branch]!.name}`}</T>
              <T v="sub">{BRANCH[branch].tag}</T>
            </View>
          </View>
        ) : null}
        {path && !pOpen ? (
          <View style={s.gate}>
            <T v="semi">Locked for now</T>
            {earnedNoPro ? (
              <>
                <T v="small">You’ve earned it. Paths are part of Nerve Pro.</T>
                <Btn label="Unlock with Pro" kind="primary" small onPress={() => openPro(branch)} />
              </>
            ) : (
              <>
                <T v="small">It opens when you have all of these:</T>
                <Gate reqs={p.paths[branch as PathKey].reqs} />
              </>
            )}
          </View>
        ) : (
          <View style={s.nextLine} accessibilityLabel={`${lvWord(branch)} ${current}${left ? `, ${left} more for ${TITLES[branch][current - 1]}` : ', done'}`}>
            <T v="semi" style={{ flex: 1, fontSize: 15 }}>
              {`${lvWord(branch)} ${current}${left ? `, ${left} more for ${TITLES[branch][current - 1]}` : ', done'}`}
            </T>
            <Dots done={lvMoves.map((m) => !!n.count[m.id])} now={nextIdx} color={bc} />
          </View>
        )}
        <TonightPoster onOpenMove={onOpenMove} mates={mates.map(n.nameOf)} />
        {stage >= 1 ? (
          <Fold title="See all moves" rule open={allOpen} onToggle={() => setAllOpen((o) => !o)}>
            <View style={{ gap: 12 }}>
                            <View style={s.tabs} accessibilityRole="tablist">
                {LEVELS.map((k) => {
                  const open = pOpen && (k === 1 || levelDone(branch, k - 1, n.count));
                  const done = pOpen && levelDone(branch, k, n.count);
                  const st = done ? 'Done' : open ? (k === current ? 'Now' : 'Open') : 'Locked';
                  const on = k === shown;
                  return (
                    <Pressable
                      key={k}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${lvWord(branch)} ${k}, ${st}`}
                      onPress={() => setStagePick((sp) => ({ ...sp, [branch]: k }))}
                      style={[s.tab, on && [s.tabOn, { borderBottomColor: bc }]]}>
                      <T style={[s.tabNum, !open && { color: C.muted }]}>{path && k === 5 ? '★' : String(k)}</T>
                      <T style={[s.tabSt, done && { color: bc }, on && { color: C.ink }]}>{st}</T>
                    </Pressable>
                  );
                })}
              </View>
              <LevelList k={shown} pOpen={pOpen} onOpenMove={onOpenMove} />
            </View>
          </Fold>
        ) : null}
      </Card>
      {stage === 0 ? null : <WarmCard onDone={(m) => onToast?.(m)} />}
      {stage >= 1 && path && pOpen ? <BaseRep onOpenMove={onOpenMove} /> : null}
      {stage >= 2 ? <Places onOpenMove={onOpenMove} lens={path && pOpen ? (branch as PathKey) : null} /> : null}

      <Sheet visible={picking} title="What to train" onClose={() => setPicking(false)}>
        <T v="sub">
          {stage < 2 ? 'Five branches with five levels each. Pick the one that feels most like you.' : 'Five branches with five levels each. Paths open once your base is strong enough.'}
        </T>
        <T v="eyebrow">Branches</T>
        <Seg tall value={branch} onChange={pick} color={HUE[branch][0]} options={BRANCH_KEYS.map((b) => ({ key: b, label: BRANCH[b].name, sub: branchState(b, p) }))} />
        {stage < 2 ? null : (
          <>
            <T v="eyebrow">Paths</T>
            <T v="small">Paths are part of Nerve Pro.</T>
            <Seg tall value={branch} onChange={pick} color={HUE[branch][0]} wrap options={SOCIAL_PATHS.map((b) => ({ key: b, label: BRANCH[b].name, sub: branchState(b, p) }))} />
            <Fold title="Paths for work and an audience" rule open={workOpen || (WORK_PATHS as BranchKey[]).includes(branch)} onToggle={() => setWorkOpen((o) => !o)}>
              <Seg tall value={branch} onChange={pick} color={HUE[branch][0]} wrap options={WORK_PATHS.map((b) => ({ key: b, label: BRANCH[b].name, sub: branchState(b, p) }))} />
            </Fold>
          </>
        )}
      </Sheet>

      {stage < 2 ? (
        <View style={s.later}>
          <T v="sub" style={{ fontSize: 15, lineHeight: 21 }}>
            {STAGE_NOTE[stage]}
          </T>
        </View>
      ) : null}
    </ScrollView>
  );
}

// One level of the branch: its moves, an example video, and what finishing it earns.
function LevelList({ k, pOpen, onOpenMove }: { k: number; pOpen: boolean; onOpenMove: (id: string) => void }) {
  const n = useNerve();
  const branch = n.branch;
  const p = n.progress;
  const path = isPath(branch);
  const [bc, bs] = HUE[branch];
  const moves = levelMoves(branch, k);
  const open = pOpen && (k === 1 || levelDone(branch, k - 1, n.count));
  const done = moves.filter((m) => n.count[m.id]).length;
  const earned = open && done === moves.length;
  const by = path ? PATH[branch as PathKey].by[k - 1] : '';
  return (
    <View style={{ gap: 8 }}>
      <View style={s.levelHead}>
        <T style={[s.levelName, !open && { color: C.muted }]}>{lvTitle(branch, k)}</T>
        <T style={[s.count, { color: open ? bc : C.muted }]}>{open ? `${done}/${moves.length}` : 'Locked'}</T>
      </View>
      {open ? (
        <View style={s.bar}>
          <View style={{ width: `${Math.round((100 * done) / moves.length)}%`, height: '100%', borderRadius: 3, backgroundColor: bc }} />
        </View>
      ) : null}
      {by ? <T v="small">Built on ideas from {by}.</T> : null}
      {open && levelVideo(branch, k) ? <LevelVideoRow v={levelVideo(branch, k)!} /> : null}
      {!open && pOpen ? (
        <T v="small">
          Do every {lvWord(branch)} {k - 1} move to open {moves.length === 1 ? 'the capstone' : `these ${moves.length}`}.
        </T>
      ) : null}
      {open && path && k === 5 ? <T v="small">The capstone counts once it is posted to Community and {CAP_REACTS} people react.</T> : null}
      {moves.map((m) => {
        const lines = n.count[m.id] ?? 0;
        const pend = p.pending[m.id];
        return (
          <Pressable
            key={m.id}
            accessibilityRole="button"
            accessibilityLabel={open ? undefined : `${m.title}, locked`}
            onPress={() => onOpenMove(m.id)}
            style={({ pressed }) => [s.moveRow, !open && { opacity: 0.55 }, pressed && { opacity: 0.8 }]}>
            <View style={[s.tile, { backgroundColor: lines > 0 ? bc : bs }]}>
              {open ? <T style={[s.tileText, { color: lines > 0 ? C.accentInk : bc }]}>{m.cap ? '★' : m.i}</T> : <Emo e="🔒" size={32} />}
            </View>
            <View style={{ flex: 1 }}>
              <T v="semi" style={{ lineHeight: 21 }}>
                {m.title}
              </T>
              {!open ? (
                <T v="eyebrow" style={{ fontSize: 12 }}>
                  Locked
                </T>
              ) : null}
            </View>
            {lines > 0 ? (
              <T style={[s.count, { color: bc }]}>{lines === 1 ? '1 line' : `${lines} lines`}</T>
            ) : pend ? (
              <T style={[s.count, { color: bc }]}>{pend.posted ? `${pend.reacts}/${CAP_REACTS} reactions` : 'Post it'}</T>
            ) : open ? (
              <T style={[s.count, { color: C.muted }]}>+{moveXp(m)} XP</T>
            ) : null}
          </Pressable>
        );
      })}
      <View style={[s.reward, { borderColor: open ? bc : C.line, backgroundColor: open ? bs : 'transparent', borderStyle: earned ? 'solid' : 'dashed' }, !open && { opacity: 0.7 }]}>
        <Emo e={open ? TIER_EMOJI[k - 1] : '🔒'} size={30} />
        <View style={{ flex: 1 }}>
          <T v="semi" style={{ fontSize: 16 }}>
            {earned ? 'Earned: ' : 'Reward: '}
            {TITLES[branch][k - 1]}
          </T>
          <T v="small" style={{ fontSize: 13 }}>
            Title, {TIERS[k - 1]} badge, +{levelBonus(k, branch)} XP
          </T>
        </View>
        {open ? <T style={[s.count, { color: earned ? bc : C.muted }]}>{earned ? '✓ Earned' : `${moves.length - done} to go`}</T> : null}
      </View>
    </View>
  );
}

// Base rep: on a path, one line that keeps the base branches moving toward the next path.
function BaseRep({ onOpenMove }: { onOpenMove: (id: string) => void }) {
  const n = useNerve();
  const p = n.progress;
  const [today] = useState(() => dayNum(Date.now()));
  const lv = (k: BranchKey) => Math.min(5, (p.levels[k] ?? 0) + 1);
  let best: { gap: number; p: PathKey; k: BranchKey; need: number } | null = null;
  for (const pk of PATH_KEYS) {
    const info = PATH[pk];
    if (p.paths[pk]?.met || pk === n.branch || (info.after && (p.levels[info.after] ?? 0) < 5)) continue;
    let gap = 0;
    let worst: BranchKey | null = null;
    for (const [k, need] of Object.entries(info.need) as [BranchKey, number][]) {
      const g = need - lv(k);
      if (g > 0) {
        gap += g;
        if (!worst || g > (info.need as Record<string, number>)[worst] - lv(worst)) worst = k;
      }
    }
    if (worst && (!best || gap < best.gap)) best = { gap, p: pk, k: worst, need: (info.need as Record<string, number>)[worst] };
  }
  const k = best ? best.k : [...BRANCH_KEYS].sort((a, b) => lv(a) - lv(b))[0];
  const pool = MOVES.filter((m) => m.b === k && !m.retired && (m.lv === 1 || levelDone(k, m.lv - 1, n.count)));
  const m = pool.find((x) => !n.count[x.id]) ?? pool[0];
  if (!m) return null;
  const why = best ? `${BRANCH[best.p].name} needs Level ${best.need}. You’re on ${lv(k)}.` : 'Your lowest base branch.';
  const done = !!p.repDays[today];
  const [bc] = HUE[k];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Extra: base rep. ${m.title}. ${why} ${done ? 'Bonus earned today.' : `Plus ${REP_BONUS} bonus XP on a day you also log a path move.`}`}
      onPress={() => onOpenMove(m.id)}
      style={({ pressed }) => [s.rep, pressed && { opacity: 0.85 }]}>
      <View style={[s.repDot, { backgroundColor: bc }]} />
      <View style={{ flex: 1 }}>
        <T style={[s.repK, { color: bc }]}>{`Extra: base rep, ${BRANCH[k].name}`}</T>
        <T v="semi" numberOfLines={1}>
          {m.title}
        </T>
        <T v="small" numberOfLines={1}>
          {why}
        </T>
      </View>
      <T style={s.repXp}>{done ? 'Bonus earned' : `+${moveXp(m) + REP_BONUS} XP`}</T>
    </Pressable>
  );
}

// Tonight's move as a poster: the branch's colour and picture, the title over it.
function TonightPoster({ onOpenMove, mates }: { onOpenMove: (id: string) => void; mates: string[] }) {
  const n = useNerve();
  const move = n.tonight.move;
  const tb: BranchKey | null = move.b === 'x' ? null : move.b === 'z' ? 'c' : move.b;
  const [deep] = tb ? HUE[tb] : PLACE_HUE[PLACES[move.place ?? 0].id];
  return (
    <View style={[s.poster, { backgroundColor: deep }]}>
      <View style={s.posterArt}>
        {tb ? <BranchBanner b={tb} height={150} glyphX={BRANCH_ICON[tb] ? 900 : 262} scale={1.15} /> : <PlaceBanner place={move.place ?? 0} height={150} />}
        {tb && !BRANCH_ICON[tb] ? null : <ArtImage src={tb ? BRANCH_ICON[tb] : PLACE_ICON[PLACES[move.place ?? 0].id]} size={100} style={s.posterTile} />}
        <View style={[s.fade, { backgroundColor: deep }]} />
      </View>
      <View style={s.pill}>
        <T style={s.pillText} numberOfLines={2}>
          {n.tonight.own && !n.tonight.together ? `Next up, ${move.i} of ${move.of}${move.cap ? ', capstone' : ''}` : label(move)}
        </T>
      </View>
      <View style={{ padding: 18, paddingTop: 0, gap: 12, marginTop: -40 }}>
        <T v="big" style={{ color: '#FFFFFF' }}>
          {move.title}
        </T>
        <T style={{ color: 'rgba(255,255,255,0.88)' }}>{move.doIt}</T>
        {mates.length ? <T style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>With {mates.join(', ')}. Until midnight.</T> : null}
        <View style={s.row}>
          <Btn label="Start" kind="primary" onPress={() => onOpenMove(move.id)} />
          {!n.tonight.together ? <Btn label="Another one" kind="light" onPress={n.skipTonight} /> : null}
        </View>
      </View>
    </View>
  );
}

// Places: poster cards in a swipeable cover-flow. The centred card is where you are tonight.
const CARD_W = 150;
const CARD_H = 198;
const STEP = 126;
function Places({ onOpenMove, lens }: { onOpenMove: (id: string) => void; lens: PathKey | null }) {
  const n = useNerve();
  const p = n.progress;
  const [at, setAt] = useState(0);
  const [x] = useState(() => new Animated.Value(0));
  const scroller = useRef<{ scrollTo: (o: { x: number; animated: boolean }) => void } | null>(null);
  const avail = Dimensions.get('window').width - 32;
  const pad = avail / 2 - STEP / 2;
  const onScroll = useMemo(() => Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: true }), [x]);
  const open = (k: number) => n.test || p.level >= PLACES[k].lv;
  const pl = PLACES[at];
  const moves = levelMoves('x', at + 1).map((m) => lensed(m, lens)!);
  const reg = p.regulars.includes(at);
  const left = moves.filter((m) => !n.count[m.id]).length;
  const card = placeCard(at);
  const nextUp = moves.find((m) => !n.count[m.id]);
  const [allOpen, setAllOpen] = useState(false);
  return (
    <Card>
      <View style={{ gap: 4 }}>
        <T v="h">Places</T>
        <T v="sub">Where are you today? Swipe to pick a place. Do all five there to become a regular.</T>
      </View>
      <Animated.ScrollView
        ref={scroller as never}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={STEP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setAt(Math.max(0, Math.min(PLACES.length - 1, Math.round(e.nativeEvent.contentOffset.x / STEP))))}
        style={{ marginHorizontal: -18 }}
        contentContainerStyle={{ paddingHorizontal: pad + 18 - 18, paddingTop: 6, paddingBottom: 26 }}>
        {PLACES.map((place, k) => {
          const isOpen = open(k);
          const done = levelMoves('x', k + 1).filter((m) => n.count[m.id]).length;
          const regular = p.regulars.includes(k);
          const range = [(k - 2) * STEP, (k - 1) * STEP, k * STEP, (k + 1) * STEP, (k + 2) * STEP];
          const t = {
            transform: [
              { perspective: 700 },
              { translateY: x.interpolate({ inputRange: range, outputRange: [28, 14, 0, 14, 28], extrapolate: 'clamp' }) },
              { rotateY: x.interpolate({ inputRange: range, outputRange: ['52deg', '26deg', '0deg', '-26deg', '-52deg'], extrapolate: 'clamp' }) },
              { scale: x.interpolate({ inputRange: range, outputRange: [0.74, 0.87, 1, 0.87, 0.74], extrapolate: 'clamp' }) },
            ],
          };
          return (
            <View key={place.id} style={{ width: STEP, height: CARD_H, zIndex: 10 - Math.abs(k - at), elevation: 10 - Math.abs(k - at) }}>
              <Animated.View style={[s.pcard, t, k === at && s.pcardOn, regular && s.pcardRegular]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: k === at }}
                  accessibilityLabel={`${place.name}${isOpen ? `, ${done} of 5 done${regular ? ', regular' : ''}` : `, opens at level ${place.lv}`}`}
                  onPress={() => {
                    setAt(k);
                    scroller.current?.scrollTo({ x: k * STEP, animated: true });
                  }}
                  style={StyleSheet.absoluteFill}>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: C.bg }, !isOpen && { opacity: 0.45 }]}>
                    {PLACE_POSTER[place.id] ? (
                      <Image source={PLACE_POSTER[place.id]} style={{ width: CARD_W, height: CARD_H }} resizeMode="cover" />
                    ) : (
                      <PlacePoster place={k} width={CARD_W} height={CARD_H} />
                    )}
                  </View>
                  <T style={[s.pcName, { color: C.ink }]} numberOfLines={2}>
                    {place.name}
                  </T>
                  <View style={[s.pcFoot, s.pcFootArt]}>
                    {isOpen ? (
                      <View style={{ flexDirection: 'row', gap: 3 }}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <View key={i} style={[s.pcPip, i < done && s.pcPipOn]} />
                        ))}
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Emo e="🔒" size={18} />
                        <T style={[s.pcN, { color: C.ink }]}>Level {place.lv}</T>
                      </View>
                    )}
                    {regular ? <T style={[s.pcReg, { color: C.goldText }]}>★ Regular</T> : isOpen ? <T style={[s.pcN, { color: C.ink }]}>{done}/5</T> : null}
                  </View>
                </Pressable>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>
      {!open(at) ? <T v="small">{`${pl.name} opens at Level ${pl.lv}. You are Level ${p.level}.`}</T> : null}
      {lens ? (
        <View style={s.lens}>
          <T v="small" style={{ color: C.muted }}>{`Tuned for ${BRANCH[lens].name}. Recordings here count toward that path. Pick another path or branch below to change it.`}</T>
        </View>
      ) : null}
      {open(at) ? (
        <View style={s.nextLine}>
          <T v="semi" style={{ flex: 1, fontSize: 15 }}>
            {reg ? 'You’re a regular here' : `${left} more to become a regular`}
          </T>
          <Dots done={moves.map((m) => !!n.count[m.id])} now={moves.findIndex((m) => !n.count[m.id])} color={PLACE_HUE[pl.id][0]} />
        </View>
      ) : null}
      {open(at) && nextUp ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`${nextUp.title}. ${nextUp.doIt} Start`} onPress={() => onOpenMove(moveKey(nextUp.id, lens))} style={({ pressed }) => [s.focusCard, pressed && { opacity: 0.85 }]}>
          <T v="semi" style={{ fontSize: 18, lineHeight: 23 }}>
            {nextUp.title}
          </T>
          <T v="sub">{nextUp.doIt}</T>
          <View style={{ alignSelf: 'flex-start', marginTop: 4 }} pointerEvents="none">
            <Btn label="Start" kind="primary" small onPress={() => {}} />
          </View>
        </Pressable>
      ) : null}
      <Fold title={open(at) ? `See all ${moves.length}` : 'See what’s in it'} rule open={allOpen} onToggle={() => setAllOpen((o) => !o)}>
        <View style={{ gap: 8 }}>
          {moves.map((m) => {
            const lines = n.count[m.id] ?? 0;
            const isOpen = open(at);
            return (
              <Pressable
                key={m.id}
                accessibilityRole="button"
                onPress={() => onOpenMove(moveKey(m.id, lens))}
                style={({ pressed }) => [s.moveRow, !isOpen && { opacity: 0.55 }, pressed && { opacity: 0.8 }]}>
                <View style={[s.tile, { backgroundColor: lines > 0 ? PLACE_HUE[pl.id][0] : PLACE_HUE[pl.id][1] }]}>
                  {isOpen ? <T style={[s.tileText, { color: lines > 0 ? '#FFFFFF' : PLACE_HUE[pl.id][0] }]}>{m.i}</T> : <Emo e="🔒" size={32} />}
                </View>
                <T v="semi" style={{ flex: 1, lineHeight: 21 }}>
                  {m.title}
                </T>
                {lines > 0 ? <T style={s.count}>{lines === 1 ? '1 line' : `${lines} lines`}</T> : isOpen ? <T style={[s.count, { color: C.muted }]}>+{moveXp(m)} XP</T> : null}
              </Pressable>
            );
          })}
          <View style={[s.reward, { borderColor: reg ? C.gold : C.line, borderStyle: reg ? 'solid' : 'dashed' }]}>
            <Patch card={card} mode={reg ? 'earned' : 'locked'} size={38} />
            <View style={{ flex: 1 }}>
              <T v="semi" style={{ fontSize: 16 }}>
                {reg ? 'You’re a regular here' : 'Become a regular'}
              </T>
              <T v="small" style={{ fontSize: 13 }}>
                Patch: {card.t}, +{REGULAR_XP} XP
              </T>
            </View>
            <T style={[s.count, { color: reg ? C.goldText : C.muted }]}>{reg ? '✓ Earned' : open(at) ? `${left} to go` : ''}</T>
          </View>
        </View>
      </Fold>
    </Card>
  );
}

// What a path needs, ticked off as you get there.
export function Gate({ reqs, light }: { reqs: Req[]; light?: boolean }) {
  const ink = light ? '#FFFFFF' : C.ink;
  const dim = light ? 'rgba(255,255,255,0.7)' : C.muted;
  return (
    <View style={{ gap: 6 }}>
      {reqs.map((r) => (
        <View key={r.text} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
          <T style={{ width: 16, color: r.ok ? dim : ink }}>{r.ok ? '✓' : '○'}</T>
          <T style={{ flex: 1, fontSize: 15, lineHeight: 20, color: r.ok ? dim : ink }}>
            {r.text}
            {r.ok ? ' (done)' : ''}
          </T>
          <T style={{ fontFamily: F.semi, fontSize: 13, color: dim }}>{r.now}</T>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  branchCard: { borderLeftWidth: 6, gap: 14 },
  branchName: { fontFamily: F.display, fontSize: 26, lineHeight: 30 },
  nextLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  focusCard: { gap: 6, padding: 14, borderRadius: 8, borderWidth: 2, borderColor: C.ink, backgroundColor: C.surface },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  firstDay: { gap: 6, paddingHorizontal: 2, paddingTop: 4 },
  later: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  pathBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingRight: 12, paddingLeft: 10, borderRadius: 8, borderLeftWidth: 6, backgroundColor: C.surface },
  pathDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: C.ink },
  pathKicker: { fontFamily: F.semi, fontSize: 12, lineHeight: 15, color: C.muted },
  pathName: { fontFamily: F.display, fontSize: 19, lineHeight: 23 },
  pathSub: { fontSize: 12, lineHeight: 16, color: C.muted },
  pathChange: { fontFamily: F.semi, fontSize: 13, color: C.ink, textDecorationLine: 'underline' },
  rep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  repDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: C.ink },
  repK: { fontFamily: F.semi, fontSize: 12, lineHeight: 15 },
  repXp: { fontFamily: F.semi, fontSize: 13, color: C.muted },
  movesHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tabs: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 10, backgroundColor: C.bgDeep },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 7, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabOn: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.ink, borderBottomWidth: 3 },
  tabNum: { fontFamily: F.display, fontSize: 19, lineHeight: 23, color: C.ink },
  tabSt: { fontFamily: F.semi, fontSize: 11, lineHeight: 14, color: C.muted },
  sheetShade: { flex: 1, backgroundColor: 'rgba(20,28,24,0.45)' },
  sheet: { maxHeight: '86%', paddingHorizontal: 16, paddingTop: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderTopWidth: 2, borderColor: C.ink, backgroundColor: C.surface },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  plus: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.accent, borderWidth: 2, borderColor: C.ink, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center' },
  poster: { borderRadius: 8, overflow: 'hidden' },
  posterArt: { height: 150 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, opacity: 0.55 },
  pill: { position: 'absolute', top: 14, left: 16, maxWidth: '58%', backgroundColor: 'rgba(0,0,0,0.32)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: '#FFFFFF' },
  quest: { borderRadius: 8, padding: 18, gap: 10, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink },
  questTag: { alignSelf: 'flex-start', backgroundColor: C.bgDeep, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  questTagText: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.ink },
  questTitle: { fontFamily: F.display, fontSize: 26, lineHeight: 29, letterSpacing: -0.4, color: C.ink },
  pcard: { position: 'absolute', left: -12, top: 0, width: CARD_W, height: CARD_H, borderRadius: 14, overflow: 'hidden', backgroundColor: C.ink },
  pcardOn: { borderWidth: 2.5, borderColor: C.ink },
  pcardRegular: { borderWidth: 2.5, borderColor: '#D9A521' },
  pcName: { position: 'absolute', left: 12, right: 10, top: 10, fontFamily: F.display, fontSize: 20, lineHeight: 21, letterSpacing: -0.4, color: '#FFFFFF' },
  pcFoot: { position: 'absolute', left: 12, right: 10, bottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pcFootArt: { left: 8, right: 8, bottom: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(246,247,243,0.94)', borderWidth: 1.5, borderColor: C.ink },
  pcPip: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.line },
  pcPipOn: { backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.ink },
  posterTile: { position: 'absolute', right: 16, top: 16, borderWidth: 2, borderColor: C.ink },
  pcLock: { fontFamily: F.semi, fontSize: 12, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  pcReg: { fontFamily: F.semi, fontSize: 12, color: '#FCE9A8' },
  pcN: { fontFamily: F.semi, fontSize: 12, color: '#FFFFFF' },
  gate: { padding: 14, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line, gap: 8 },
  bar: { height: 6, borderRadius: 3, backgroundColor: C.bgDeep, overflow: 'hidden' },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, paddingRight: 14, borderRadius: 8, borderWidth: 1.5 },
  view: { padding: 16, gap: 12, paddingBottom: 32 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  invite: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingLeft: 16, borderRadius: 8, backgroundColor: C.accentSoft },
  mentorIntro: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  lens: { padding: 10, borderRadius: 8, backgroundColor: C.bg, borderLeftWidth: 3, borderLeftColor: C.accent },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    backgroundColor: C.surface,
  },
  tile: { width: 48, height: 48, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: F.display, fontSize: 28, lineHeight: 34, color: C.accentText },
  count: { fontFamily: F.semi, fontSize: 13, color: C.accentText },
  levelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingTop: 8 },
  levelName: { fontFamily: F.display, fontSize: 22, lineHeight: 26, color: C.ink, flexShrink: 1 },
});
