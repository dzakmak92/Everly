import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleProp, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, fill, font, radius, shadow, PHONE_WIDTH } from '../theme/tokens';
import { LockGlyph } from './icons';

/* ────────────────────────────────────────────────────────────────────────
 * PhoneFrame — the 390-wide rounded device frame used in the gallery.
 * Each screen body renders inside it; `label` is the "P01 · …" caption.
 * ──────────────────────────────────────────────────────────────────────── */
export function PhoneFrame({
  label,
  children,
  width = PHONE_WIDTH,
  accent = '#6A4670',
  frameRadius = radius.phone,
}: {
  label: string;
  children: React.ReactNode;
  width?: number;
  accent?: string;
  frameRadius?: number;
}) {
  // Phone-sized frames (<=430) scale down to fit narrow screens, leaving a
  // 24px gutter on each side; wide desktop frames (Kiosk/Admin) keep their
  // design width and scroll horizontally instead.
  const { width: screenW } = useWindowDimensions();
  const w = width <= 430 ? Math.min(width, screenW - 48) : width;
  return (
    <View style={{ width: w, flexShrink: 0 }}>
      <Text
        style={{
          fontFamily: font.body700,
          fontSize: 11,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 12,
        }}
      >
        {label}
      </Text>
      <View
        style={[
          {
            width: w,
            borderRadius: frameRadius,
            overflow: 'hidden',
            backgroundColor: color.canvas,
          },
          shadow.phone,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * StatusBar — the "9:41" row. P01 shows signal + battery icons; others just
 * the time. `dark` flips the text color for the Calm (dark) screen.
 * ──────────────────────────────────────────────────────────────────────── */
export function StatusBar({
  dark = false,
  showIcons = false,
}: {
  dark?: boolean;
  showIcons?: boolean;
}) {
  const ink = dark ? 'rgba(237,235,250,0.7)' : color.ink;
  return (
    <View
      style={{
        paddingTop: 14,
        paddingHorizontal: 26,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: font.body700, fontSize: 14, color: ink }}>9:41</Text>
      {showIcons && (
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <Svg width={16} height={11} viewBox="0 0 16 11">
            <Rect x="0" y="6" width="3" height="5" rx="0.7" fill={ink} />
            <Rect x="4.5" y="4" width="3" height="7" rx="0.7" fill={ink} />
            <Rect x="9" y="2" width="3" height="9" rx="0.7" fill={ink} />
            <Rect x="13.5" y="0" width="2.5" height="11" rx="0.7" fill={ink} />
          </Svg>
          <Svg width={23} height={12} viewBox="0 0 23 12">
            <Rect x="0.6" y="0.6" width="18.8" height="10.8" rx="2.8" stroke={ink} strokeWidth={1.2} fill="none" />
            <Rect x="2" y="2" width="14" height="8" rx="1.5" fill={ink} />
          </Svg>
        </View>
      )}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Card — white rounded surface with soft shadow.
 * ──────────────────────────────────────────────────────────────────────── */
export function Card({
  style,
  children,
  radius: r = radius.cardSm,
}: {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  radius?: number;
}) {
  return (
    <View style={[{ backgroundColor: color.cardSurface, borderRadius: r }, shadow.card, style]}>
      {children}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Pill / Badge — rounded tag. Default is the muted-on-tint style.
 * ──────────────────────────────────────────────────────────────────────── */
export function Pill({
  children,
  bg = fill.lilac,
  fg = color.muted,
  weight = '700',
  size = 11,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  weight?: '400' | '600' | '700';
  size?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const fam = weight === '700' ? font.body700 : weight === '600' ? font.body600 : font.body400;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: 5,
          paddingHorizontal: 12,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={[{ fontFamily: fam, fontSize: size, color: fg }, textStyle]}>{children}</Text>
    </View>
  );
}

/** The quiet teal "Free forever" reassurance pill (Mum&Me grammar). */
export function FreeForeverPill({ small = false }: { small?: boolean }) {
  return (
    <Pill bg="#D4EDE7" fg={color.tealDeep} size={small ? 9 : 12} style={{ paddingVertical: small ? 4 : 7, paddingHorizontal: small ? 10 : 15 }}>
      Free forever
    </Pill>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * SectionLabel — uppercase, tracked, muted micro-label.
 * ──────────────────────────────────────────────────────────────────────── */
export function SectionLabel({
  children,
  color: c = color.muted,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        {
          fontFamily: font.body700,
          fontSize: 11,
          letterSpacing: 1.1,
          textTransform: 'uppercase',
          color: c,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * IconChip — pastel rounded square holding a centered line icon.
 * ──────────────────────────────────────────────────────────────────────── */
export function IconChip({
  bg,
  size = 40,
  rounded = 12,
  children,
  style,
}: {
  bg: string;
  size?: number;
  rounded?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderRadius: rounded,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * ProgressBar — rounded track + gradient fill.
 * ──────────────────────────────────────────────────────────────────────── */
export function ProgressBar({
  pct,
  height = 6,
  track = color.canvas,
  colors = ['#E98FB3', '#D46E97'],
}: {
  pct: number;
  height?: number;
  track?: string;
  colors?: [string, string, ...string[]];
}) {
  return (
    <View style={{ height, backgroundColor: track, borderRadius: radius.pill, overflow: 'hidden' }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${pct}%`, height: '100%', borderRadius: radius.pill }}
      />
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Divider — hairline rule.
 * ──────────────────────────────────────────────────────────────────────── */
export function Divider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(51,50,74,0.05)' }} />;
}

/* ────────────────────────────────────────────────────────────────────────
 * Silhouette — faceless person, sized by stage. Brand signature.
 *  adult / pregnant variants carry a softly rounded bump.
 * ──────────────────────────────────────────────────────────────────────── */
export function Silhouette({
  size = 26,
  fill = '#D9824F',
}: {
  size?: number;
  fill?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx="10" cy="7.5" r="5.5" fill={fill} />
      <Path d="M1.5 19Q1.5 13 10 13Q18.5 13 18.5 19Z" fill={fill} />
    </Svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * SproutLockBadge — the calm premium glyph (sprout-lock). No red, no
 * countdown. Used inline on premium-gated actions only.
 * ──────────────────────────────────────────────────────────────────────── */
export function SproutLockBadge() {
  return (
    <View
      style={{
        marginLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderRadius: radius.pill,
        paddingVertical: 3,
        paddingHorizontal: 9,
      }}
    >
      <LockGlyph size={11} />
      <Text style={{ fontFamily: font.body700, fontSize: 9, letterSpacing: 0.4, color: '#fff' }}>PREMIUM</Text>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * PrimaryButton — periwinkle/rose filled CTA with soft shadow.
 * ──────────────────────────────────────────────────────────────────────── */
export function PrimaryButton({
  children,
  bg = color.accentRose,
  shadowStyle = shadow.pinkButton,
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  shadowStyle?: ViewStyle;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        },
        shadowStyle,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: '#fff' }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * BottomNav — P01's 5-slot nav (Today · Calendar · FAB + · Profile · Settings).
 * ──────────────────────────────────────────────────────────────────────── */
import { Home, Calendar, User, Settings, Plus } from './icons';

export function BottomNav() {
  const item = (label: string, active: boolean, icon: React.ReactNode) => (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 44,
          height: 32,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? fill.blush : 'transparent',
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: font.body600, fontSize: 9, letterSpacing: 0.36, color: active ? color.rose : color.muted }}>
        {label}
      </Text>
    </View>
  );
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(51,50,74,0.06)',
        paddingTop: 10,
        paddingHorizontal: 8,
        paddingBottom: 28,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {item('Today', true, <Home size={18} color={color.rose} />)}
      {item('Calendar', false, <Calendar size={18} color={color.muted} />)}
      <View
        style={[
          {
            width: 52,
            height: 52,
            backgroundColor: color.accentRose,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -18,
          },
          shadow.pinkButton,
        ]}
      >
        <Plus size={22} color="#fff" />
      </View>
      {item('Profile', false, <User size={18} color={color.muted} />)}
      {item('Settings', false, <Settings size={18} color={color.muted} />)}
    </View>
  );
}
