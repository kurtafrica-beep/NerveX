import React from 'react';
import Svg, { Circle, G, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { BRANCH, BRANCH_KEYS, MOVES, type BranchKey } from '../moves';
import { C, F } from '../theme';

const APEX = { x: 190, y: 16 };
const ENDS: Record<BranchKey, { x: number; y: number }> = {
  c: { x: 22, y: 248 },
  t: { x: 106, y: 262 },
  r: { x: 190, y: 268 },
  q: { x: 274, y: 262 },
  v: { x: 358, y: 248 },
};
const LABELS: Record<BranchKey, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }> = {
  c: { x: 4, y: 278, anchor: 'start' },
  t: { x: 106, y: 290, anchor: 'middle' },
  r: { x: 190, y: 296, anchor: 'middle' },
  q: { x: 274, y: 290, anchor: 'middle' },
  v: { x: 376, y: 278, anchor: 'end' },
};

// Five branches of ten. A node fills in once you have a line for that move.
export function Tree({ count, onOpenMove }: { count: Record<string, number>; onOpenMove: (id: string) => void }) {
  return (
    <Svg width="100%" viewBox="0 0 380 314" style={{ aspectRatio: 380 / 314 }}>
      {BRANCH_KEYS.map((b) => (
        <SvgLine key={b} x1={APEX.x} y1={APEX.y} x2={ENDS[b].x} y2={ENDS[b].y} stroke={C.line} strokeWidth={2} />
      ))}
      {BRANCH_KEYS.map((b) => {
        const moves = MOVES.filter((m) => m.b === b);
        const done = moves.filter((m) => count[m.id]).length;
        return (
          <G key={b}>
            {moves.map((m) => {
              const f = 0.2 + 0.8 * (m.n / 10);
              const x = APEX.x + (ENDS[b].x - APEX.x) * f;
              const y = APEX.y + (ENDS[b].y - APEX.y) * f;
              const on = !!count[m.id];
              return (
                <G key={m.id} onPress={() => onOpenMove(m.id)} accessibilityLabel={`${BRANCH[b].name} ${m.n}: ${m.title}${on ? ', done' : ''}`}>
                  <Circle cx={x} cy={y} r={12.5} fill="transparent" />
                  <Circle cx={x} cy={y} r={6.5} fill={on ? C.accent : C.surface} stroke={on ? C.accent : C.muted} strokeWidth={1.5} />
                </G>
              );
            })}
            <SvgText x={LABELS[b].x} y={LABELS[b].y} textAnchor={LABELS[b].anchor} fontFamily={F.displayBold} fontSize={14} fill={C.ink}>
              {BRANCH[b].name.toUpperCase()}
            </SvgText>
            <SvgText x={LABELS[b].x} y={LABELS[b].y + 16} textAnchor={LABELS[b].anchor} fontFamily={F.displayBold} fontSize={14} fill={C.accent}>
              {`${done}/10`}
            </SvgText>
          </G>
        );
      })}
      <Circle cx={APEX.x} cy={APEX.y} r={4} fill={C.ink} />
    </Svg>
  );
}
