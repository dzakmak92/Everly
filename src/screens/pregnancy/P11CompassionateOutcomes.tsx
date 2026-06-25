import React from 'react';
import { View, Text } from 'react-native';
import { color, font } from '../../theme/tokens';
import { StatusBar, Card, IconChip } from '../../components/ui';
import { Shield, Heart, MessageSquare, Archive } from '../../components/icons';

const f = font;
const c = color;

/* P11 · Compassionate Outcomes — gentle, never-monetized care path. */
export default function P11CompassionateOutcomes() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* gentle header */}
      <View style={{ paddingHorizontal: 28, paddingTop: 20, paddingBottom: 20, alignItems: 'center' }}>
        <View
          style={{
            width: 60,
            height: 60,
            backgroundColor: '#FBE0EA',
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Heart size={28} color="#E98FB3" filled />
        </View>
        <Text style={{ fontFamily: f.display700, fontSize: 24, lineHeight: 29, color: c.ink, marginBottom: 10, textAlign: 'center' }}>
          We're here with you
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 23, color: '#6F6E86', textAlign: 'center' }}>
          Whatever has happened, Everly will adjust gently. Your privacy is protected — this is visible only to you.
        </Text>
      </View>

      {/* options */}
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        <OptionCard
          chipBg="#FBE0EA"
          title="Mark this pregnancy"
          desc="Everly will pause all pregnancy notifications and gently transition to a supportive mode. Your journal and memories are preserved forever."
          icon={<Heart size={22} color="#E98FB3" filled />}
        />
        <OptionCard
          chipBg="#E7E4FB"
          title="Find support resources"
          desc="Curated helplines, community groups, and professional support — regionally relevant, available 24/7."
          icon={<MessageSquare size={22} color="#6B6FC9" />}
        />
        <OptionCard
          chipBg="#D8F0E6"
          title="Archive this pregnancy"
          desc="Safely store your bump journal, kick logs, and memories. Retrievable whenever you're ready."
          icon={<Archive size={22} color="#3FA98A" />}
        />
      </View>

      {/* privacy note */}
      <View
        style={{
          marginTop: 16,
          marginHorizontal: 20,
          marginBottom: 32,
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
          <Shield size={14} color="#6B6FC9" />
        </View>
        <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 18, color: '#54579E', flex: 1 }}>
          This feature is never monetized. Your choices here are private, local to your device, and never shared. This is a
          duty of care — free, always.
        </Text>
      </View>
    </View>
  );
}

function OptionCard({
  chipBg,
  title,
  desc,
  icon,
}: {
  chipBg: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Card style={{ padding: 20, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
      <IconChip bg={chipBg} size={44} rounded={14}>
        {icon}
      </IconChip>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 15, color: color.ink, marginBottom: 5 }}>{title}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, lineHeight: 20, color: '#6F6E86' }}>{desc}</Text>
      </View>
    </Card>
  );
}
