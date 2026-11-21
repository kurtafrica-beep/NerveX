import React, { useEffect, useSyncExternalStore } from 'react';
import { BackHandler, Linking, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { C, F } from '../theme';
import { Icon, T } from '../ui';
import { mmss, upText, videoUrl, type Video } from '../videos';

// Which video is open in the mini player. Anything can open one; the host in App shows it.
let current: Video | null = null;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
export function openVideo(v: Video) {
  current = v;
  emit();
}
export function closeVideo() {
  current = null;
  emit();
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// YouTube's embedded player wants to know which app it is playing in, so the page says it comes from the app's own address.
const ORIGIN = 'https://com.nervex.app';
function playerHtml(v: Video): string {
  const src = `https://www.youtube.com/embed/${v.id}?playsinline=1&autoplay=1&rel=0&modestbranding=1${v.at ? `&start=${v.at}` : ''}&origin=${encodeURIComponent(ORIGIN)}`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin">
<style>html,body{margin:0;height:100%;background:#000}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head>
<body><iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></body></html>`;
}

export function VideoHost() {
  const v = useSyncExternalStore(subscribe, () => current);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!v) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeVideo();
      return true;
    });
    return () => sub.remove();
  }, [v]);

  if (!v) return null;
  const playerH = Math.round(((width - 24) * 9) / 16);
  return (
    <Modal transparent animationType="slide" visible onRequestClose={closeVideo} statusBarTranslucent>
      <Pressable style={s.scrim} onPress={closeVideo} accessibilityLabel="Close the video" />
      <View style={[s.sheet, { paddingBottom: insets.bottom + 14 }]} accessibilityViewIsModal>
        <View style={s.grab} />
        <View style={[s.player, { height: playerH }]}>
          <WebView
            key={v.id}
            source={{ html: playerHtml(v), baseUrl: ORIGIN }}
            style={{ backgroundColor: '#000' }}
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            // Taps that would leave the player (the YouTube logo, "watch on YouTube") open the YouTube app instead.
            onShouldStartLoadWithRequest={(req) => {
              const u = req.url;
              if (u.startsWith(ORIGIN) || u.startsWith('about:') || u.includes('youtube.com/embed/') || !req.isTopFrame) return true;
              Linking.openURL(u).catch(() => {});
              return false;
            }}
            setSupportMultipleWindows={false}
          />
        </View>
        <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={{ gap: 6, paddingTop: 12 }}>
          <T v="semi">{v.t}</T>
          <T v="small">
            {v.by} · {upText(v)}
            {v.at ? ` · starts at ${mmss(v.at)}` : ''}
          </T>
          <T style={{ fontSize: 16, lineHeight: 22 }}>{v.take}</T>
        </ScrollView>
        <View style={s.row}>
          <Pressable accessibilityRole="link" hitSlop={8} onPress={() => Linking.openURL(videoUrl(v)).catch(() => {})}>
            <T v="small" style={{ textDecorationLine: 'underline' }}>
              {"Won't play? Open in YouTube"}
            </T>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={closeVideo} style={({ pressed }) => [s.close, pressed && { opacity: 0.8 }]}>
            <Icon name="back" size={18} color={C.ink} />
            <T style={{ fontFamily: F.semi, fontSize: 15 }}>Close</T>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(13,14,18,0.5)' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 12, paddingTop: 8 },
  grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: C.line, marginBottom: 10 },
  player: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#000' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingHorizontal: 4 },
  close: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: C.line },
});
