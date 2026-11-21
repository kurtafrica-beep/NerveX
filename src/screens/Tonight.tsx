import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LevelVideoRow } from '../components/Example';
import { BranchBanner, Patch, PlaceBanner, PlacePoster } from '../components/Patches';
import { ArtImage, Emo } from '../components/ArtIcon';
import { BRANCH_ICON, PLACE_ICON, PLACE_POSTER } from '../artImages';
import { PLACES } from '../rpgData';
import { PLACE_HUE, QUEST_BONUS, REGULAR_XP, dayNum, placeCard, todaysQuest } from '../progress';
import { useNerve } from '../data';
import { BRANCH, BRANCH_KEYS, BY, CAP_REACTS, LEVELS, PATH, PATH_KEYS, isPath, label, levelDone, levelMoves, lvTitle, lvWord, type BranchKey } from '../moves';
import { levelVideo } from '../videos';
import { HUE, TIERS, TIER_EMOJI, TITLES, branchState, levelBonus, moveXp, type Req } from '../progress';
import { C, F } from '../theme';
import { Btn, Card, Icon, Seg, T } from '../ui';

export function Tonight({ onOpenMove, onRecord, initialBranch = 'c' }: { onOpenMove: (id: string) => void; onRecord: () => void; initialBranch?: BranchKey }) {
  const n = useNerve();
  const [branch, setBranch] = useState<BranchKey>(initialBranch);
  const [refreshing, setRefreshing] = useState(false);
  const move = n.tonight.move;
  const mates = n.partnersFor(move.id);
  const p = n.progress;
  const path = isPath(branch);
  const pOpen = !path || !!p.open[branch];
  const [bc, bs] = HUE[branch];

  return (
    <ScrollView
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
      <View style={s.topRow}>
        <T v="sub" style={{ flex: 1 }}>
          Do the move. Drop the line.
        </T>
        <Pressable accessibilityRole="button" accessibilityLabel="Quick take: record now, add it to a move later" onPress={onRecord} style={({ pressed }) => [s.plus, pressed && { transform: [{ translateY: 2 }], borderBottomWidth: 2 }]}>
          <Icon name="plus" size={26} color={C.ink} width={2.6} />
        </Pressable>
      </View>

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

      <TonightPoster onOpenMove={onOpenMove} mates={mates.map(n.nameOf)} />
      <QuestCard onOpenMove={onOpenMove} />
      <Places onOpenMove={onOpenMove} />

      <Card>
        <View>
          <T v="h">Five branches</T>
          <T v="sub">Five levels each. Finish every move in a level to open the next. Paths open once your base is strong enough.</T>
        </View>
        <Seg
          tall
          value={branch}
          onChange={setBranch}
          color={HUE[branch][0]}
          options={BRANCH_KEYS.map((b) => ({ key: b, label: BRANCH[b].name, sub: branchState(b, p) }))}
        />
        <T v="eyebrow">Paths</T>
        <Seg
          tall
          value={branch}
          onChange={setBranch}
          color={HUE[branch][0]}
          wrap
          options={PATH_KEYS.map((b) => ({ key: b, label: BRANCH[b].name, sub: branchState(b, p) }))}
        />
        <T v="sub">{BRANCH[branch].tag}</T>
        {path && !pOpen ? (
          <View style={s.gate}>
            <T v="semi">This path is locked</T>
            <T v="small">It opens when you have all of these:</T>
            <Gate reqs={p.paths[branch as 'n' | 'f'].reqs} />
          </View>
        ) : null}
        {LEVELS.map((k) => {
          const moves = levelMoves(branch, k);
          const open = pOpen && (k === 1 || levelDone(branch, k - 1, n.count));
          const done = moves.filter((m) => n.count[m.id]).length;
          const earned = open && done === moves.length;
          const by = path ? PATH[branch as 'n' | 'f'].by[k - 1] : '';
          return (
            <View key={k} style={{ gap: 8 }}>
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
                  Drop a line on every {lvWord(branch)} {k - 1} move to open {moves.length === 1 ? 'the capstone' : `these ${moves.length}`}.
                </T>
              ) : null}
              {open && path && k === 5 ? (
                <T v="small">The capstone counts once it is posted to the feed and {CAP_REACTS} people react.</T>
              ) : null}
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
                    Title · {TIERS[k - 1]} badge · +{levelBonus(k, branch)} XP
                  </T>
                </View>
                {open ? <T style={[s.count, { color: earned ? bc : C.muted }]}>{earned ? '✓ Earned' : `${moves.length - done} to go`}</T> : null}
              </View>
            </View>
          );
        })}
      </Card>
    </ScrollView>
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
        {tb ? <BranchBanner b={tb} height={150} glyphX={900} scale={1.15} /> : <PlaceBanner place={move.place ?? 0} height={150} />}
        <ArtImage src={tb ? BRANCH_ICON[tb] : PLACE_ICON[PLACES[move.place ?? 0].id]} size={100} style={s.posterTile} />
        <View style={[s.fade, { backgroundColor: deep }]} />
      </View>
      <View style={s.pill}>
        <T style={s.pillText} numberOfLines={2}>
          Tonight · {label(move)}
        </T>
      </View>
      <View style={{ padding: 18, paddingTop: 0, gap: 12, marginTop: -40 }}>
        <T v="big" style={{ color: '#FFFFFF' }}>
          {move.title}
        </T>
        <T style={{ color: 'rgba(255,255,255,0.88)' }}>{move.doIt}</T>
        {mates.length ? <T style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>With {mates.join(', ')}. Until midnight.</T> : null}
        <View style={s.row}>
          <Btn label="Drop the line" kind="primary" onPress={() => onOpenMove(move.id)} />
          {!n.tonight.together ? <Btn label="Another one" kind="light" onPress={n.skipTonight} /> : null}
        </View>
      </View>
    </View>
  );
}

function QuestCard({ onOpenMove }: { onOpenMove: (id: string) => void }) {
  const n = useNerve();
  const [today] = useState(() => dayNum(Date.now()));
  const q = todaysQuest();
  const done = !!n.progress.questDays[today];
  return (
    <View style={s.quest}>
      <View style={s.questTag}>
        <T style={s.questTagText}>{done ? 'Side quest done ✓' : `Today’s side quest · +${QUEST_BONUS + moveXp(q)} XP`}</T>
      </View>
      <T style={s.questTitle}>{q.title}</T>
      <T style={{ color: 'rgba(255,255,255,0.85)' }}>{q.doIt}</T>
      <View style={[s.row, { alignItems: 'center' }]}>
        <Btn label={done ? 'Log it again' : 'Do it'} kind={done ? 'light' : 'primary'} small onPress={() => onOpenMove(q.id)} />
        <T style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, flex: 1 }}>The bonus only counts today.</T>
      </View>
    </View>
  );
}

// Places: poster cards in a swipeable cover-flow. The centred card is where you are tonight.
const CARD_W = 150;
const CARD_H = 198;
const STEP = 126;
function Places({ onOpenMove }: { onOpenMove: (id: string) => void }) {
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
  const moves = levelMoves('x', at + 1);
  const reg = p.regulars.includes(at);
  const left = moves.filter((m) => !n.count[m.id]).length;
  const card = placeCard(at);
  return (
    <Card>
      <View style={{ gap: 4 }}>
        <T v="h">Places</T>
        <T v="sub">Where are you tonight? Swipe to pick a place. Do all five actions there to become a regular and earn its patch.</T>
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
      {moves.map((m) => {
        const lines = n.count[m.id] ?? 0;
        const isOpen = open(at);
        return (
          <Pressable
            key={m.id}
            accessibilityRole="button"
            onPress={() => onOpenMove(m.id)}
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
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  plus: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.accent, borderWidth: 2, borderColor: C.ink, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center' },
  poster: { borderRadius: 8, overflow: 'hidden' },
  posterArt: { height: 150 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, opacity: 0.55 },
  pill: { position: 'absolute', top: 14, left: 16, maxWidth: '58%', backgroundColor: 'rgba(0,0,0,0.32)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: '#FFFFFF' },
  quest: { borderRadius: 8, padding: 18, gap: 10, backgroundColor: C.ink },
  questTag: { alignSelf: 'flex-start', backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  questTagText: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.ink },
  questTitle: { fontFamily: F.display, fontSize: 26, lineHeight: 29, letterSpacing: -0.4, color: '#FFFFFF' },
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
