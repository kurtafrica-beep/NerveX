import React from 'react';
import Svg, { Circle, G, Line as SvgLine, Path, Text as SvgText } from 'react-native-svg';
import { BRANCH, BRANCH_KEYS, LEVEL_NAMES, LEVELS, currentLevel, levelMoves, type BranchKey } from '../moves';
import { C, F } from '../theme';

const APEX = { x: 190, y: 16 };
// Branch ends sit on one line; labels alternate between two rows so neighbours never touch.
const ENDS: Record<BranchKey, { x: number; y: number }> = {
  c: { x: 22, y: 300 },
  t: { x: 106, y: 300 },
  q: { x: 190, y: 300 },
  v: { x: 274, y: 300 },
  s: { x: 358, y: 300 },
};
const LABELS: Record<BranchKey, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }> = {
  c: { x: 4, y: 324, anchor: 'start' },
  t: { x: 106, y: 356, anchor: 'middle' },
  q: { x: 190, y: 324, anchor: 'middle' },
  v: { x: 274, y: 356, anchor: 'middle' },
  s: { x: 376, y: 324, anchor: 'end' },
};
const R = 10;

// A pie slice inside a level node showing how much of that level is done.
function arc(x: number, y: number, frac: number): string {
  const a0 = -Math.PI / 2;
  const a1 = a0 + frac * 2 * Math.PI;
  const large = frac > 0.5 ? 1 : 0;
  return `M ${x} ${y} L ${x + R * Math.cos(a0)} ${y + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${x + R * Math.cos(a1)} ${y + R * Math.sin(a1)} Z`;
}

// Five branches, five levels each. A level node fills in once every move in it has a line.
export function Tree({ count, onOpenBranch }: { count: Record<string, number>; onOpenBranch: (b: BranchKey) => void }) {
  return (
    <Svg width="100%" viewBox="0 0 380 374" style={{ aspectRatio: 380 / 374 }}>
      {BRANCH_KEYS.map((b) => (
        <SvgLine key={b} x1={APEX.x} y1={APEX.y} x2={ENDS[b].x} y2={ENDS[b].y} stroke={C.line} strokeWidth={2} />
      ))}
      {BRANCH_KEYS.map((b) => {
        const cur = currentLevel(b, count);
        return (
          <G key={b}>
            {LEVELS.map((k) => {
              const f = 0.2 + 0.8 * (k / 5);
              const x = APEX.x + (ENDS[b].x - APEX.x) * f;
              const y = APEX.y + (ENDS[b].y - APEX.y) * f;
              const moves = levelMoves(b, k);
              const done = moves.filter((m) => count[m.id]).length;
              const complete = done === moves.length;
              const isCurrent = k === cur && !complete;
              const locked = k > cur;
              return (
                <G
                  key={k}
                  onPress={() => onOpenBranch(b)}
                  accessibilityLabel={`${BRANCH[b].name} level ${k}, ${LEVEL_NAMES[b][k - 1]}: ${done} of ${moves.length}${locked ? ', locked' : ''}`}>
                  <Circle cx={x} cy={y} r={16} fill="transparent" />
                  <Circle
                    cx={x}
                    cy={y}
                    r={R}
                    fill={complete ? C.accent : C.surface}
                    stroke={complete || isCurrent ? C.accent : locked ? C.line : C.muted}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                  />
                  {!complete && done > 0 ? <Path d={arc(x, y, done / moves.length)} fill={C.accentSoft} /> : null}
                  <SvgText
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontFamily={F.semi}
                    fontSize={11}
                    fill={complete ? C.accentInk : isCurrent ? C.accent : C.muted}>
                    {String(k)}
                  </SvgText>
                </G>
              );
            })}
            {LABELS[b].y > 340 ? (
              <SvgLine x1={ENDS[b].x} y1={ENDS[b].y + 12} x2={ENDS[b].x} y2={LABELS[b].y - 14} stroke={C.line} strokeWidth={2} />
            ) : null}
            <SvgText x={LABELS[b].x} y={LABELS[b].y} textAnchor={LABELS[b].anchor} fontFamily={F.displayBold} fontSize={14} fill={C.ink}>
              {BRANCH[b].name.toUpperCase()}
            </SvgText>
            <SvgText x={LABELS[b].x} y={LABELS[b].y + 15} textAnchor={LABELS[b].anchor} fontFamily={F.displayBold} fontSize={14} fill={C.accent}>
              {`LV ${cur}`}
            </SvgText>
          </G>
        );
      })}
      <Circle cx={APEX.x} cy={APEX.y} r={4} fill={C.ink} />
    </Svg>
  );
}
