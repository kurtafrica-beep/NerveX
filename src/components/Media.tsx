import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { clockText, signedUrl, type MediaKind } from '../data';
import type { Redaction } from '../redact/types';
import { C } from '../theme';
import { Btn, Icon, T } from '../ui';

// Plays a voice note from a local file or a signed URL.
export function VoicePlayer({ uri, autoPlay, redaction }: { uri: string; autoPlay?: boolean; redaction?: Redaction | null }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (autoPlay && status.isLoaded && !started.current) {
      started.current = true;
      player.play();
    }
  }, [autoPlay, status.isLoaded, player]);

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.duration > 0 && status.currentTime >= status.duration - 0.25) player.seekTo(0);
    player.play();
  };
  const fraction = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const gap = redaction?.them.find((g) => status.currentTime >= g.s && status.currentTime < g.e);

  return (
    <View style={s.voice}>
      <Pressable accessibilityRole="button" accessibilityLabel={status.playing ? 'Pause' : 'Play'} onPress={toggle} style={s.round}>
        <Icon name={status.playing ? 'pause' : 'play'} size={22} color={C.surface} />
      </Pressable>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={s.track}>
          {redaction && status.duration > 0
            ? redaction.them.map((g, i) => (
                <View key={i} style={[s.mutedMark, { left: `${(g.s / status.duration) * 100}%`, width: `${((g.e - g.s) / status.duration) * 100}%` }]} />
              ))
            : null}
          <View style={[s.fill, { width: `${fraction * 100}%` }]} />
        </View>
        <T v="small">
          {clockText(status.currentTime)} / {status.duration > 0 ? clockText(status.duration) : '--:--'}
          {redaction ? '   Other voices muted' : ''}
        </T>
        {gap && status.playing ? (
          <View style={s.gap} accessibilityLiveRegion="polite">
            <T v="small" style={{ color: C.ink }}>
              {gap.cap ? `They said: ${gap.cap}` : 'Muted'}
            </T>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function VideoPlayer({ uri, autoPlay }: { uri: string; autoPlay?: boolean }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    if (autoPlay) p.play();
  });
  return <VideoView player={player} style={s.video} nativeControls contentFit="contain" />;
}

// A recording stored on the server. Nothing loads until the person asks for it.
export function RemoteMedia({ path, kind, seconds, redaction }: { path: string; kind: MediaKind; seconds: number | null; redaction?: Redaction | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={s.missing}>
        <T v="small">This {kind === 'voice' ? 'voice note' : 'video'} could not be loaded.</T>
      </View>
    );
  }
  if (!url) {
    const what = kind === 'voice' ? 'voice note' : 'video';
    return (
      <Btn
        label={busy ? 'Loading…' : `Play ${what}${seconds ? ` · ${clockText(seconds)}` : ''}`}
        icon={kind === 'voice' ? 'mic' : 'cam'}
        small
        wide
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          const next = await signedUrl(path);
          setBusy(false);
          if (next) setUrl(next);
          else setFailed(true);
        }}
      />
    );
  }
  return kind === 'voice' ? <VoicePlayer uri={url} autoPlay redaction={redaction} /> : <VideoPlayer uri={url} autoPlay />;
}

const s = StyleSheet.create({
  voice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, backgroundColor: C.bg },
  round: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: C.line, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: C.accent },
  mutedMark: { position: 'absolute', top: 0, bottom: 0, backgroundColor: C.muted, opacity: 0.45 },
  gap: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: C.bgDeep },
  video: { width: '100%', aspectRatio: 3 / 4, borderRadius: 6, backgroundColor: '#000' },
  missing: { padding: 16, borderRadius: 6, backgroundColor: C.bg, alignItems: 'center' },
});
