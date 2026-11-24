import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C, F } from './theme';

const ICONS = {
  feed: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  tonight: 'M3 20h5v-5h5v-5h5V5h3',
  plus: 'M12 5v14M5 12h14',
  you: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20c1.2-3.2 3.8-4.8 7-4.8s5.8 1.6 7 4.8',
  comment: 'M4 5h16v11H10l-5 4v-4H4z',
  back: 'M19 12H5M11 6l-6 6 6 6',
  chevron: 'M9 6l6 6-6 6',
  mic: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  cam: 'M4 7h11v10H4zM15 11l5-3v8l-5-3z',
  play: 'M8 5l11 7-11 7z',
  pause: 'M8 5v14M16 5v14',
  stop: 'M7 7h10v10H7z',
} as const;
export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 24, color = C.ink, width = 2 }: { name: IconName; size?: number; color?: string; width?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={ICONS[name]} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

type Variant = 'body' | 'sub' | 'small' | 'semi' | 'eyebrow' | 'accent' | 'h' | 'big' | 'error';

export function T({ v = 'body', style, ...rest }: TextProps & { v?: Variant }) {
  return <Text {...rest} style={[text[v], style]} />;
}

const text = StyleSheet.create({
  body: { fontFamily: F.body, fontSize: 17, lineHeight: 24, color: C.ink },
  sub: { fontFamily: F.body, fontSize: 16, lineHeight: 22, color: C.muted },
  small: { fontFamily: F.body, fontSize: 14, lineHeight: 19, color: C.muted },
  semi: { fontFamily: F.semi, fontSize: 17, lineHeight: 22, color: C.ink },
  eyebrow: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.muted },
  accent: { fontFamily: F.semi, fontSize: 14, lineHeight: 18, color: C.accentText },
  h: { fontFamily: F.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.5, color: C.ink },
  big: { fontFamily: F.display, fontSize: 42, lineHeight: 44, letterSpacing: -0.8, color: C.ink },
  error: { fontFamily: F.semi, fontSize: 15, lineHeight: 20, color: C.danger },
});

type BtnProps = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'outline' | 'quiet' | 'dark' | 'light';
  small?: boolean;
  wide?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function Btn({ label, onPress, kind = 'outline', small, wide, disabled, icon, style }: BtnProps) {
  const fg = kind === 'primary' ? C.accentInk : kind === 'dark' ? C.surface : kind === 'light' ? '#FFFFFF' : kind === 'quiet' ? C.muted : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        btn.base,
        small && btn.small,
        wide && btn.wide,
        kind === 'primary' && btn.primary,
        kind === 'dark' && btn.dark,
        kind === 'quiet' && btn.quiet,
        kind === 'light' && btn.onDark,
        (disabled || pressed) && { opacity: disabled ? 0.5 : 0.8 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
      <Text style={[btn.label, small && { fontSize: 15 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const btn = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  small: { minHeight: 40, paddingHorizontal: 16, paddingVertical: 6 },
  wide: { alignSelf: 'stretch' },
  primary: { backgroundColor: C.accent, borderColor: C.ink, borderBottomWidth: 3.5 },
  dark: { backgroundColor: C.ink, borderColor: C.ink },
  quiet: { borderColor: C.line },
  label: { fontFamily: F.semi, fontSize: 17 },
  onDark: { borderColor: 'rgba(255,255,255,0.7)' },
});

export function Card({ children, strong, style }: { children: React.ReactNode; strong?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[card.base, strong && card.strong, style]}>{children}</View>;
}
const card = StyleSheet.create({
  base: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line, borderRadius: 8, padding: 18, gap: 12 },
  strong: { borderColor: C.ink, borderWidth: 1.5 },
});

export function Avatar({ name, url, size = 44 }: { name: string; url?: string | null; size?: number }) {
  const [broken, setBroken] = useState(false);
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (url && !broken) {
    return <Image source={{ uri: url }} style={[box, { backgroundColor: C.bg }]} onError={() => setBroken(true)} accessibilityIgnoresInvertColors />;
  }
  return (
    <View style={[box, avatar.letter]}>
      <Text style={avatar.text}>{(name.trim().charAt(0) || '?').toUpperCase()}</Text>
    </View>
  );
}
const avatar = StyleSheet.create({
  letter: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: F.semi, fontSize: 16, color: C.ink },
});

export function Seg<K extends string>({
  options,
  value,
  onChange,
  tall,
  color = C.ink,
  wrap,
}: {
  options: { key: K; label: string; sub?: string }[];
  value: K;
  onChange: (key: K) => void;
  tall?: boolean;
  color?: string;
  // let options flow onto more rows, three to a row
  wrap?: boolean;
}) {
  return (
    <View style={[seg.wrap, tall && { borderRadius: 30 }, wrap && { flexWrap: 'wrap' }]}>
      {options.map((o) => {
        const on = o.key === value;
        const labelStyle: StyleProp<TextStyle> = [seg.label, on && { color: C.surface }];
        return (
          <Pressable
            key={o.key}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.key)}
            style={[seg.item, wrap ? { flexBasis: '31%', flexGrow: 1 } : { flex: o.label.length > 6 ? 1.7 : 1 }, tall && { minHeight: 50, borderRadius: 26 }, on && { backgroundColor: color }]}>
            <Text style={labelStyle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {o.label}
            </Text>
            {o.sub ? <Text style={[seg.sub, on && { color: C.surface }]}>{o.sub}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
const seg = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, backgroundColor: C.bgDeep },
  item: { flex: 1, minHeight: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  label: { fontFamily: F.semi, fontSize: 14, color: C.muted },
  sub: { fontFamily: F.medium, fontSize: 12, color: C.muted },
});

export function Pill({
  label,
  onPress,
  on,
  disabled,
  icon,
}: {
  label: string;
  onPress?: () => void;
  on?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  const fg = on ? C.accentInk : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on, disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [pill.base, on && pill.on, (disabled || pressed) && { opacity: disabled ? 0.55 : 0.8 }]}>
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
      {label ? <Text style={[pill.label, { color: fg }]}>{label}</Text> : null}
    </Pressable>
  );
}
const pill = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  on: { backgroundColor: C.accent, borderColor: C.ink },
  label: { fontFamily: F.semi, fontSize: 15 },
});

// A text link that needs a second tap before it deletes anything.
export function ConfirmLink({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={10}
      onPress={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        setTimeout(() => setArmed(false), 4000);
      }}>
      <Text style={[link.text, armed && { color: C.danger, fontFamily: F.semi }]}>{armed ? 'Tap again to delete' : label}</Text>
    </Pressable>
  );
}
const link = StyleSheet.create({
  text: { fontFamily: F.body, fontSize: 14, color: C.muted, textDecorationLine: 'underline' },
});
