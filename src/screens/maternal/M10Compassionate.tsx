import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, font } from '../../theme/tokens';
import { StatusBar, Card } from '../../components/ui';

const f = font;
const c = color;

/* M10 · Compassionate Postpartum Outcomes — SAFETY, calm, always free. */
export default function M10Compassionate() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* gentle header */}
      <View style={{ paddingTop: 20, paddingHorizontal: 28, paddingBottom: 16, alignItems: 'center' }}>
        <View
          style={{
            width: 56,
            height: 56,
            backgroundColor: '#E0F4EF',
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="#3A9B8A">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
        </View>
        <Text style={{ fontFamily: f.display700, fontSize: 22, lineHeight: 26.4, color: c.ink, marginBottom: 8, textAlign: 'center' }}>
          You don't have to be okay
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, lineHeight: 20.8, color: c.inkSecondary, textAlign: 'center' }}>
          Whatever this moment holds — Everly adjusts around you. Gently, at your pace.
        </Text>
      </View>

      {/* options */}
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        <OptionCard
          emoji="🏥"
          iconBg="#E0F4EF"
          title="Traumatic birth or NICU stay"
          body="Acknowledge what happened without erasing it. Support resources, birth story space, when you're ready."
        />
        <OptionCard
          emoji="💔"
          iconBg="#FBE0EA"
          title="Feeding grief or stopped feeding"
          body="You fed your baby. However long it lasted — that counts. No judgment, no pressure, ever."
        />
        <OptionCard
          emoji="🧠"
          iconBg="#E7E4FB"
          title="Postpartum mental health crisis"
          body="If you're struggling: you're not alone and you're not failing. Immediate resources, soft escalation, always free."
        />
      </View>

      {/* never monetized note */}
      <View
        style={{
          marginTop: 14,
          marginHorizontal: 20,
          marginBottom: 24,
          backgroundColor: '#E7E4FB',
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ marginTop: 1 }}>
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </Svg>
        </View>
        <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 16.5, color: '#54579E' }}>
          This is never monetized. Private, on-device, free always — a duty of care for the mother too.
        </Text>
      </View>
    </View>
  );
}

function OptionCard({ emoji, iconBg, title, body }: { emoji: string; iconBg: string; title: string; body: string }) {
  return (
    <Card style={{ padding: 18, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 42,
          height: 42,
          backgroundColor: iconBg,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink, marginBottom: 4 }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12, lineHeight: 18, color: color.inkSecondary }}>{body}</Text>
      </View>
    </Card>
  );
}
