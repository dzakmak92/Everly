import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { color, font, radius, shadow } from '../theme/tokens';

/* ────────────────────────────────────────────────────────────────────────
 * Interactive primitives for the functional app (distinct from the static
 * gallery components in ui.tsx). Real onPress, real inputs, real state.
 * ──────────────────────────────────────────────────────────────────────── */

/** Filled, tappable CTA. */
export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'primary' ? color.primary : variant === 'secondary' ? '#fff' : 'transparent';
  const fg = variant === 'primary' ? '#fff' : color.primary;
  const isOff = disabled || loading;
  return (
    <Pressable
      onPress={isOff ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          paddingVertical: 15,
          paddingHorizontal: 18,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: isOff ? 0.55 : pressed ? 0.85 : 1,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: color.primary,
        },
        variant === 'primary' ? shadow.periwinkleButton : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: fg }}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Labeled text field. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoComplete?: 'email' | 'password' | 'name' | 'off';
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text
        style={{
          fontFamily: font.body700,
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: color.muted,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.faint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        style={{
          backgroundColor: '#fff',
          borderRadius: radius.tile,
          borderWidth: 1,
          borderColor: color.hairline,
          paddingVertical: 14,
          paddingHorizontal: 16,
          fontFamily: font.body500,
          fontSize: 15,
          color: color.ink,
        }}
      />
    </View>
  );
}

/** Centered loading splash, shown while the session/config bootstrap settles. */
export function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.canvas }}>
      <ActivityIndicator color={color.primary} size="large" />
    </View>
  );
}

/** Inline error / notice banner. */
export function Notice({ text, tone = 'error' }: { text: string; tone?: 'error' | 'info' }) {
  if (!text) return null;
  const bg = tone === 'error' ? '#FBE0EA' : '#DCEBFA';
  const fg = tone === 'error' ? color.roseInk : color.primaryDeep;
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.tile, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Text style={{ fontFamily: font.body600, fontSize: 13, color: fg, lineHeight: 18 }}>{text}</Text>
    </View>
  );
}
