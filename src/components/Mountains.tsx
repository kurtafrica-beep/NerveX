import React from 'react';
import Svg, { Circle, G, Line as SvgLine, Path, Text as SvgText } from 'react-native-svg';
import { BRANCH, BRANCH_KEYS, PATH_KEYS, isPath, levelMoves, lvTitle, type BranchKey } from '../moves';
import { GREY, HUE, TITLES, branchState, type Progress } from '../progress';
import { C, F } from '../theme';

type Geo = { w: number; h: number; base: number; half: number; peak: Partial<Record<BranchKey, number>>; cx: (i: number) => number; stagger?: number };

const BASE_RANGE: Geo = { w: 380, h: 258, base: 214, half: 64, peak: { c: 46, t: 74, q: 36, v: 80, s: 58 }, cx: (i) => 38 + i * 76 };
const PATH_RANGE: Geo = {
  w: 380, h: 284, base: 214, half: 64,
  peak: { n: 52, f: 70, m: 40, p: 76, k: 30, b: 34, h: 66, w: 28, g: 58, y: 46, a: 38 },
  cx: (i) => 38 + i * 76, stagger: 28,
};

// Six mountains on the first row: narrower and closer together.
const PATH_ROW6: Geo = { ...PATH_RANGE, half: 54, cx: (i) => 34 + i * 62.4 };

const f1 = (n: number) => n.toFixed(1);
const poly = (pts: number[][]) => 'M ' + pts.map((q) => `${f1(q[0])} ${f1(q[1])}`).join(' L ');

// A pie slice inside a camp showing how much of that level is done.
function arc(x: number, y: number, r: number, frac: number): string {
  const a0 = -Math.PI / 2;
  const a1 = a0 + frac * 2 * Math.PI;
  return `M ${x} ${y} L ${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)} Z`;
}

// One mountain per branch: five camps on a switchback trail, the last on the summit.
// The trail fills in as you climb; the flag is planted in colour when you master it.
function Range({ keys, geo, p, onOpen }: { keys: BranchKey[]; geo: Geo; p: Progress; onOpen: (b: BranchKey) => void }) {
  const { base: BASE, half: HALF } = geo;
  const SC = HALF / 64;
  const order = [...keys].sort((x, y) => (geo.peak[x] ?? 0) - (geo.peak[y] ?? 0));
  const shapes = order.map((b) => {
    const cx = geo.cx(keys.indexOf(b));
    const py = geo.peak[b] ?? 0;
    const H = BASE - py;
    const shut = isPath(b) && !p.open[b];
    const [bc, bs] = shut ? GREY : HUE[b];
    const doneK = p.levels[b];
    const cur = Math.min(5, doneK + 1);
    const mastered = doneK >= 5;
    const curMoves = levelMoves(b, cur);
    const curDone = curMoves.filter((m) => p.count[m.id]).length;
    const pts: number[][] = [[cx - 30 * SC, BASE]];
    for (let k = 1; k <= 5; k++) {
      const y = BASE - H * (k / 5) * (k === 5 ? 1 : 0.9);
      const w = (BASE - y) / H;
      pts.push([k === 5 ? cx : cx + (k % 2 ? 1 : -1) * (6 + 22 * (1 - w)) * SC, k === 5 ? py + 3 : y]);
    }
    const reach = mastered ? 5 : doneK + curDone / curMoves.length;
    let climbed: number[][] | null = null;
    if (reach > 0) {
      const seg = Math.floor(reach);
      const fr = reach - seg;
      climbed = pts.slice(0, seg + 1);
      if (seg < 5 && fr > 0) climbed.push([pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * fr, pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * fr]);
    }
    const sy = py + H * 0.2;
    const sx = ((sy - py) / H) * HALF;
    return { b, cx, py, H, shut, bc, bs, doneK, cur, mastered, curMoves, pts, climbed, sy, sx };
  });

  return (
    <Svg width="100%" viewBox={`0 0 ${geo.w} ${geo.h}`} style={{ aspectRatio: geo.w / geo.h }}>
      <SvgLine x1={0} y1={BASE} x2={geo.w} y2={BASE} stroke={C.line} strokeWidth={1.5} />
      {shapes.map(({ b, cx, py, H, bc, bs, sy, sx }) => (
        <G key={`m${b}`} onPress={() => onOpen(b)}>
          <Path
            d={poly([[cx - HALF, BASE], [cx - HALF * 0.45, BASE - H * 0.52], [cx, py], [cx + HALF * 0.5, BASE - H * 0.46], [cx + HALF, BASE]]) + ' Z'}
            fill={bs}
            stroke={bc}
            strokeOpacity={0.35}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <Path d={poly([[cx, py], [cx + HALF * 0.5, BASE - H * 0.46], [cx + HALF, BASE], [cx + 6, BASE]]) + ' Z'} fill={bc} opacity={0.09} />
          <Path
            d={poly([[cx, py], [cx + sx * 0.95, sy], [cx + sx * 0.4, sy - 5], [cx, sy + 2], [cx - sx * 0.45, sy - 4], [cx - sx * 0.9, sy]]) + ' Z'}
            fill="#FFFFFF"
            stroke={bc}
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        </G>
      ))}
      {shapes.map(({ b, cx, py, shut, bc, doneK, cur, mastered, pts, climbed }) => {
        const ly = BASE + 20 + (geo.stagger && keys.indexOf(b) % 2 ? geo.stagger : 0);
        return (
        <G key={`t${b}`}>
          <Path d={poly(pts)} fill="none" stroke={bc} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="2 3" strokeLinecap="round" />
          {climbed ? <Path d={poly(climbed)} fill="none" stroke={bc} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
          <G opacity={mastered ? 1 : shut ? 0.18 : 0.28}>
            <SvgLine x1={cx} y1={py + 3} x2={cx} y2={py - 22} stroke={C.ink} strokeWidth={1.5} />
            <Path
              d={`M ${cx} ${py - 22} L ${cx + 15} ${py - 18} L ${cx} ${py - 13} Z`}
              fill={mastered ? bc : 'none'}
              stroke={mastered ? bc : C.ink}
              strokeWidth={1}
              strokeDasharray={mastered ? undefined : '2 2'}
            />
          </G>
          {[1, 2, 3, 4, 5].map((k) => {
            const [x, y] = pts[k];
            const r = k === 5 ? 8.5 : 8;
            const complete = k <= doneK;
            const isCur = k === cur && !complete && !shut;
            const moves = levelMoves(b, k);
            const done = moves.filter((m) => p.count[m.id]).length;
            return (
              <G
                key={k}
                onPress={() => onOpen(b)}
                accessibilityLabel={`${BRANCH[b].name}, ${lvTitle(b, k)}, ${TITLES[b][k - 1]}: ${complete ? 'earned' : isCur ? `${done} of ${moves.length}` : 'locked'}`}>
                <Circle cx={x} cy={y} r={13} fill="transparent" />
                {isCur ? <Circle cx={x} cy={y} r={r + 4} fill="none" stroke={bc} strokeOpacity={0.3} strokeWidth={2} /> : null}
                <Circle cx={x} cy={y} r={r} fill={complete ? bc : C.surface} stroke={complete || isCur ? bc : C.line} strokeWidth={isCur ? 2.5 : 1.5} />
                {isCur && done > 0 ? <Path d={arc(x, y, r, done / moves.length)} fill={HUE[b][1]} /> : null}
                <SvgText x={x} y={y + 3.5} textAnchor="middle" fontFamily={F.semi} fontSize={10} fill={complete ? '#FFFFFF' : isCur ? bc : C.muted}>
                  {isPath(b) && k === 5 ? '★' : String(k)}
                </SvgText>
              </G>
            );
          })}
          <SvgText x={cx} y={ly} textAnchor="middle" fontFamily={F.displayBold} fontSize={12} fill={C.ink}>
            {BRANCH[b].name}
          </SvgText>
          <SvgText x={cx} y={ly + 14} textAnchor="middle" fontFamily={F.displayBold} fontSize={12} fill={bc}>
            {mastered ? 'Summit' : isPath(b) ? branchState(b, p).replace('🔒 ', '') : `Lv ${cur}`}
          </SvgText>
        </G>
        );
      })}
    </Svg>
  );
}

export function BaseMountains({ p, onOpen }: { p: Progress; onOpen: (b: BranchKey) => void }) {
  return <Range keys={BRANCH_KEYS} geo={BASE_RANGE} p={p} onOpen={onOpen} />;
}
export function PathMountains({ p, onOpen }: { p: Progress; onOpen: (b: BranchKey) => void }) {
  // Six then five mountains so they still fit on a phone.
  return (
    <>
      <Range keys={PATH_KEYS.slice(0, 6)} geo={PATH_ROW6} p={p} onOpen={onOpen} />
      <Range keys={PATH_KEYS.slice(6)} geo={PATH_RANGE} p={p} onOpen={onOpen} />
    </>
  );
}
