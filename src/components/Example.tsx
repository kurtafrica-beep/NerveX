import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { BRANCH, isPath, type Move } from '../moves';
import { C, F } from '../theme';
import { T } from '../ui';
import { levelVideo, mmss, searchUrl, upText, videoUrl, type Video } from '../videos';

const RED = '#FF0033';

function open(url: string) {
  Linking.openURL(url).catch(() => {});
}

// The level's example video with what to take from it, plus a search for more on this move.
export function ExampleCard({ move }: { move: Move }) {
  if (move.retired) return null;
  const v = levelVideo(move.b, move.lv);
  const q = `${move.title} ${BRANCH[move.b].name.toLowerCase()}${isPath(move.b) ? '' : ' communication'} example`;
  return (
    <View style={{ gap: 8 }}>
      {v ? (
        <View style={s.card}>
          <T v="eyebrow">Watch an example</T>
          <View style={{ gap: 2 }}>
            <T v="semi">{v.t}</T>
            <T v="small">
              {v.by} · {upText(v)}
            </T>
          </View>
          <T>{v.take}</T>
          <Pressable accessibilityRole="link" onPress={() => open(videoUrl(v))} style={({ pressed }) => [s.yt, pressed && { opacity: 0.85 }]}>
            <T style={s.ytText}>▶ Watch on YouTube{v.at ? ` from ${mmss(v.at)}` : ''}</T>
          </Pressable>
        </View>
      ) : null}
      <Pressable accessibilityRole="link" hitSlop={8} onPress={() => open(searchUrl(q))}>
        <T v="small" style={{ textDecorationLine: 'underline' }}>
          More examples from this year on YouTube ↗
        </T>
      </Pressable>
    </View>
  );
}

// A compact row under a level heading on Tonight.
export function LevelVideoRow({ v }: { v: Video }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`Example video: ${v.t}`} onPress={() => open(videoUrl(v))} style={({ pressed }) => [s.row, pressed && { opacity: 0.8 }]}>
      <View style={s.play}>
        <T style={{ color: '#fff', fontSize: 13, lineHeight: 16 }}>▶</T>
      </View>
      <View style={{ flex: 1 }}>
        <T style={{ fontFamily: F.semi, fontSize: 15, lineHeight: 19 }}>{v.t}</T>
        <T v="small" style={{ fontSize: 13, lineHeight: 17 }}>
          {v.by} · {upText(v)}
          {v.at ? ` · from ${mmss(v.at)}` : ''}
        </T>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { gap: 8, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  yt: { alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: 16, borderRadius: 999, backgroundColor: RED, justifyContent: 'center' },
  ytText: { fontFamily: F.semi, fontSize: 15, color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, paddingRight: 12, borderRadius: 12, backgroundColor: C.bg },
  play: { width: 34, height: 34, borderRadius: 17, backgroundColor: RED, alignItems: 'center', justifyContent: 'center' },
});
