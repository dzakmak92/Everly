import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Notice } from '../../src/components/forms';
import { ChevronLeft, Check } from '../../src/components/icons';
import { useSupabase, createCheckout } from '../../src/lib/supabase';

type Cycle = 'monthly' | 'yearly';

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
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const plan = profile?.plan ?? 'free';
  const { pricing, stripePrices } = config;

  async function choose(tier: 'pro' | 'family' | 'lifetime') {
    setError('');
    setBusy(tier);
    try {
      const priceId =
        tier === 'lifetime' ? stripePrices.lifetime.oneTime : stripePrices[tier][cycle];
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

  const tiers = [
    {
      key: 'free' as const,
      name: 'Free',
      price: '€0',
      sub: 'forever',
      features: ['1 child profile', 'Daily logging', 'Calendar & timeline'],
    },
    {
      key: 'pro' as const,
      name: 'Pro',
      price: money(cycle === 'monthly' ? pricing.pro.monthly : pricing.pro.yearly, pricing.pro.currency),
      sub: cycle === 'monthly' ? '/ month' : '/ year',
      features: ['Everything in Free', 'Unlimited children', 'Health Hub & exports', 'Night log'],
    },
    {
      key: 'family' as const,
      name: 'Family',
      price: money(cycle === 'monthly' ? pricing.family.monthly : pricing.family.yearly, pricing.family.currency),
      sub: cycle === 'monthly' ? '/ month' : '/ year',
      features: ['Everything in Pro', 'Co-parent sharing', 'Multi-caregiver', 'Priority support'],
    },
    {
      key: 'lifetime' as const,
      name: 'Lifetime',
      price: money(pricing.lifetime.oneTime, pricing.lifetime.currency),
      sub: 'one-time',
      features: ['Everything in Family', 'Pay once, keep forever'],
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>

      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Plans</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 14, color: color.inkSecondary }}>
        You're on the <Text style={{ fontFamily: font.body700, color: color.primary }}>{plan}</Text> plan ·{' '}
        {config.trialDays}-day trial on paid tiers.
      </Text>

      {/* Cycle toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.pill, padding: 4, alignSelf: 'flex-start', ...shadow.row }}>
        {(['monthly', 'yearly'] as Cycle[]).map((c) => {
          const sel = c === cycle;
          return (
            <Pressable key={c} onPress={() => setCycle(c)} style={{ paddingVertical: 8, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: sel ? color.primary : 'transparent' }}>
              <Text style={{ fontFamily: font.body700, fontSize: 13, color: sel ? '#fff' : color.muted }}>
                {c === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Notice text={error} />

      {tiers.map((t) => {
        const current = plan === t.key;
        return (
          <View key={t.key} style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, gap: 12, borderWidth: current ? 2 : 0, borderColor: color.primary }, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.display700, fontSize: 20, color: color.ink }}>{t.name}</Text>
              <Text style={{ fontFamily: font.body700, fontSize: 18, color: color.ink }}>
                {t.price} <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{t.sub}</Text>
              </Text>
            </View>
            <View style={{ gap: 6 }}>
              {t.features.map((f) => (
                <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Check size={15} color={color.maternalTeal} />
                  <Text style={{ fontFamily: font.body500, fontSize: 13.5, color: color.inkSecondary }}>{f}</Text>
                </View>
              ))}
            </View>
            {current ? (
              <View style={{ paddingVertical: 12, alignItems: 'center', backgroundColor: color.canvas, borderRadius: 12 }}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.primary }}>Current plan</Text>
              </View>
            ) : t.key === 'free' ? null : (
              <Button label={`Choose ${t.name}`} onPress={() => choose(t.key)} loading={busy === t.key} />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
