import React from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';
import { EMOJI_ICON } from '../artImages';
import { T } from '../ui';

// An art icon, or the emoji it stands for until there's art for it.
export function Emo({ e, size = 26, dim, style }: { e: string; size?: number; dim?: boolean; style?: StyleProp<ImageStyle> }) {
  const src = EMOJI_ICON[e];
  if (!src) return <T style={{ fontSize: size * 0.8, lineHeight: size, width: size, textAlign: 'center', opacity: dim ? 0.45 : 1 }}>{e}</T>;
  return <ArtImage src={src} size={size} dim={dim} style={style} />;
}

export function ArtImage({ src, size, dim, style }: { src: ImageSourcePropType; size: number; dim?: boolean; style?: StyleProp<ImageStyle> }) {
  return <Image source={src} style={[{ width: size, height: size, borderRadius: size > 40 ? 12 : 6 }, dim && { opacity: 0.4 }, style]} accessibilityIgnoresInvertColors />;
}
