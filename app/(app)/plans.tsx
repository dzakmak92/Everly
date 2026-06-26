import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Platform, Linking, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, shadow } from '../../src/theme/tokens';
import { Notice } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { useSupabase, createCheckout } from '../../src/lib/supabase';
import { useData } from '../../src/lib/store';

const f = font;
const c = color;

type TierKey = 'free' | 'pro' | 'family' | 'lifetime';

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

function returnUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin + window.location.pathname;
  }
  return 'everly://plans';
}

async function go(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = url;
  } else {
    await Linking.openURL(url);
  }
}

export default function Plans() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { config, profile } = useSupabase();
  const { activeChild } = useData();
  const [busy, setBusy] = useState<TierKey | null>(null);
  const [error, setError] = useState('');
  // The design has no monthly/yearly toggle; checkout still needs a valid cycle.
  const cycle: 'monthly' | 'yearly' = 'monthly';

  const plan: TierKey = (profile?.plan ?? 'free') as TierKey;
  const { pricing, stripePrices, trialDays } = config;
  // Recommended tier drives the single primary CTA (skips it if already on Pro).
  const recommended: Exclude<TierKey, 'free'> = plan === 'pro' ? 'family' : 'pro';

  async function choose(tier: Exclude<TierKey, 'free'>) {
    setError('');
    setBusy(tier);
    try {
      const priceId = tier === 'lifetime' ? stripePrices.lifetime.oneTime : stripePrices[tier][cycle];
      const url = await createCheckout({
        priceId,
        mode: tier === 'lifetime' ? 'payment' : 'subscription',
        returnUrl: returnUrl(),
      });
      await go(url);
    } catch (e) {
      setError((e as Error).message + ' — checkout needs the Stripe secret key set on the server.');
    } finally {
      setBusy(null);
    }
  }

  const proPrice = money(pricing.pro.monthly, pricing.pro.currency);
  const familyPrice = money(pricing.family.monthly, pricing.family.currency);
  const lifetimePrice = money(pricing.lifetime.oneTime, pricing.lifetime.currency);

  const childName = activeChild?.name || 'your family';
  const ctaLabel = busy === recommended ? 'Starting…' : `Start ${trialDays}-day free trial`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* back */}
      <View style={{ paddingHorizontal: 14, paddingTop: 6 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.row }}
        >
          <ChevronLeft size={22} color={c.ink} />
        </Pressable>
      </View>

      {/* heading + reassurance */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20, alignItems: 'center' }}>
        <Text style={{ fontFamily: f.display700, fontSize: 26, lineHeight: 30, color: c.ink, marginBottom: 8, textAlign: 'center' }}>
          Keep going — track {childName} too
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, lineHeight: 20, color: c.inkSecondary, textAlign: 'center' }}>
          <Text style={{ fontFamily: f.body700, color: c.maternalTeal }}>Mum&Me is always free.</Text> This unlocks baby tracking & the rest of the family.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Notice text={error} />
      </View>

      {/* plans */}
      <View style={{ paddingHorizontal: 20, gap: 10, paddingTop: error ? 12 : 0 }}>
        {/* Free */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: c.hairline, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Mum&Me + Safety</Text>
              <View style={{ backgroundColor: '#D4EDE7', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
                <Text style={{ fontFamily: f.body700, fontSize: 9, color: c.tealDeep }}>Free forever</Text>
              </View>
            </View>
            <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>€0</Text>
          </View>
          <View style={{ gap: 6 }}>
            <Feature stroke="#3FA98A" check>Pregnancy + postpartum + maternal arc</Feature>
            <Feature stroke="#3FA98A" check>Kick counter, contractions, EPDS — never gated</Feature>
            <Feature stroke="#9C9AB2" fg={c.maternalTeal} weight600>You're already here</Feature>
          </View>
          {plan === 'free' && <CurrentTag />}
        </View>

        {/* Pro (recommended) */}
        <View style={{ backgroundColor: '#F0EFFF', borderRadius: 18, borderWidth: 2, borderColor: c.primary, padding: 16, position: 'relative' }}>
          <CornerTab bg={c.primary} fg="#fff">RECOMMENDED</CornerTab>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, marginTop: 6 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Everly Pro</Text>
            <Price value={proPrice} accent={c.primary} suffix="/mo" />
          </View>
          <View style={{ gap: 6 }}>
            <Feature stroke={c.primary} check fg={c.ink} weight600>Unlimited children</Feature>
            <Feature stroke={c.primary} check fg={c.ink} weight600>Snap to Schedule · Health Hub</Feature>
            <Feature stroke={c.primary} check fg={c.ink} weight600>Routines · Timeline export</Feature>
          </View>
          {plan === 'pro' && <CurrentTag />}
        </View>

        {/* Family */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: c.hairline, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Family</Text>
            <Price value={familyPrice} accent={c.ink} suffix="/mo" />
          </View>
          <View style={{ gap: 6 }}>
            <Feature stroke="#3FA98A" check>Everything in Pro</Feature>
            <Feature stroke="#3FA98A" check>Multi-caregiver · Co-parent mode</Feature>
          </View>
          {plan === 'family' && <CurrentTag />}
        </View>

        {/* Lifetime */}
        <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: c.sparkleGold, padding: 16, position: 'relative' }}>
          <CornerTab bg={c.sparkleGold} fg={c.goldInk}>BEST VALUE</CornerTab>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, marginTop: 6 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Lifetime</Text>
            <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.gold }}>{lifetimePrice}</Text>
          </View>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>One-time · All features · Forever</Text>
          {plan === 'lifetime' && <CurrentTag />}
        </View>
      </View>

      {/* primary CTA → recommended tier checkout */}
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 }}>
        <Pressable
          onPress={() => choose(recommended)}
          disabled={busy !== null}
          style={({ pressed }) => [
            {
              backgroundColor: c.primary,
              paddingVertical: 17,
              paddingHorizontal: 17,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy !== null ? 0.7 : pressed ? 0.9 : 1,
            },
            shadow.periwinkleButton,
          ]}
        >
          {busy === recommended ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontFamily: f.body800, fontSize: 16, color: '#fff' }}>{ctaLabel}</Text>
          )}
        </Pressable>
      </View>

      <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted, textAlign: 'center', paddingTop: 8, paddingHorizontal: 20 }}>
        Mum&Me & safety free forever · No card needed · No account
      </Text>
    </ScrollView>
  );
}

function Price({ value, accent, suffix }: { value: string; accent: string; suffix: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ fontFamily: f.display700, fontSize: 22, color: accent }}>{value}</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>{suffix}</Text>
    </View>
  );
}

function CornerTab({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: -1,
        right: 16,
        backgroundColor: bg,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 11,
      }}
    >
      <Text style={{ fontFamily: f.body700, fontSize: 10, color: fg }}>{children}</Text>
    </View>
  );
}

function CurrentTag() {
  return (
    <View style={{ marginTop: 12, paddingVertical: 8, alignItems: 'center', backgroundColor: 'rgba(107,111,201,0.10)', borderRadius: 10 }}>
      <Text style={{ fontFamily: f.body700, fontSize: 12, color: c.primary }}>Current plan</Text>
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
      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        {check ? <Path d="M5 13l4 4L19 7" /> : <Path d="M5 12h14" />}
      </Svg>
      <Text style={{ fontFamily: weight600 ? f.body600 : f.body400, fontSize: 12, color: fg, flexShrink: 1 }}>{children}</Text>
    </View>
  );
}
