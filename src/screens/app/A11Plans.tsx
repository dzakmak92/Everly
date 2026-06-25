import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* A11 · Plans / Paywall — Mum&Me always free; Free / Pro / Family / Lifetime. */
export default function A11Plans() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* heading + reassurance */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, alignItems: 'center' }}>
        <Text style={{ fontFamily: f.display700, fontSize: 26, lineHeight: 29, color: c.ink, marginBottom: 6, textAlign: 'center' }}>
          Keep going — track Oliver too
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, lineHeight: 20, color: c.inkSecondary, textAlign: 'center' }}>
          <Text style={{ fontFamily: f.body700, color: '#3A9B8A' }}>Mum&Me is always free.</Text> This unlocks baby tracking & the rest of the family.
        </Text>
      </View>

      {/* plans */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {/* Free */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(51,50,74,0.08)', padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Mum&Me + Safety</Text>
              <View style={{ backgroundColor: '#D4EDE7', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
                <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#2C8475' }}>Free forever</Text>
              </View>
            </View>
            <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>€0</Text>
          </View>
          <View style={{ gap: 5 }}>
            <Feature stroke="#3FA98A" check>Pregnancy + postpartum + maternal arc</Feature>
            <Feature stroke="#3FA98A" check>Kick counter, contractions, EPDS — never gated</Feature>
            <FeatureDash />
          </View>
        </View>

        {/* Pro (highlighted) */}
        <View style={{ backgroundColor: '#F0EFFF', borderRadius: 18, borderWidth: 2, borderColor: '#6B6FC9', padding: 16, position: 'relative' }}>
          <View style={{ position: 'absolute', top: -1, right: 16, backgroundColor: '#6B6FC9', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, paddingVertical: 4, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#fff' }}>RECOMMENDED</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, marginTop: 6 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Everly Pro</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#6B6FC9' }}>€3.99</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>/mo</Text>
            </View>
          </View>
          <View style={{ gap: 5 }}>
            <Feature stroke="#6B6FC9" check fg={c.ink} weight600>Unlimited children</Feature>
            <Feature stroke="#6B6FC9" check fg={c.ink} weight600>Snap to Schedule · Health Hub</Feature>
            <Feature stroke="#6B6FC9" check fg={c.ink} weight600>Routines · Timeline export</Feature>
          </View>
        </View>

        {/* Family */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(51,50,74,0.08)', padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Family</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>€4.99</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>/mo</Text>
            </View>
          </View>
          <View style={{ gap: 5 }}>
            <Feature stroke="#3FA98A" check>Everything in Pro</Feature>
            <Feature stroke="#3FA98A" check>Multi-caregiver · Co-parent mode</Feature>
          </View>
        </View>

        {/* Lifetime */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: '#E9C46A', padding: 16, position: 'relative' }}>
          <View style={{ position: 'absolute', top: -1, right: 16, backgroundColor: '#E9C46A', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#7A5A00' }}>BEST VALUE</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, marginTop: 6 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Lifetime</Text>
            <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#C9A33B' }}>€149.99</Text>
          </View>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>One-time · All features · Forever</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View
          style={[
            {
              backgroundColor: '#6B6FC9',
              paddingVertical: 17,
              paddingHorizontal: 17,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.periwinkleButton,
          ]}
        >
          <Text style={{ fontFamily: f.body800, fontSize: 16, color: '#fff' }}>Start 30-day free trial</Text>
        </View>
      </View>
      <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted, textAlign: 'center', paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24 }}>
        Mum&Me & safety free forever · No card needed · No account
      </Text>
    </View>
  );
}

function Feature({
  children,
  stroke,
  check,
  fg = color.inkSecondary,
  weight600 = false,
}: {
  children: React.ReactNode;
  stroke: string;
  check?: boolean;
  fg?: string;
  weight600?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round">
        {check ? <Path d="M5 13l4 4L19 7" /> : <Path d="M5 12h14" />}
      </Svg>
      <Text style={{ fontFamily: weight600 ? font.body600 : font.body400, fontSize: 12, color: fg, flexShrink: 1 }}>{children}</Text>
    </View>
  );
}

function FeatureDash() {
  return (
    <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2.5} strokeLinecap="round">
        <Path d="M5 12h14" />
      </Svg>
      <Text style={{ fontFamily: font.body600, fontSize: 12, color: '#3A9B8A' }}>You're already here</Text>
    </View>
  );
}
