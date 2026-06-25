import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { color, font } from '../../theme/tokens';
import { StatusBar, Card, Pill, SectionLabel } from '../../components/ui';
import { Search } from '../../components/icons';

const f = font;
const c = color;

/* P05 · Safety Scanner — food / medicine / product safety lookup. */
export default function P05SafetyScanner() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View
        style={{
          paddingTop: 10,
          paddingHorizontal: 24,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Safety Scanner</Text>
        <Pill bg="#FBE0EA" fg="#D46E97" size={11} style={{ paddingHorizontal: 12 }}>
          Week 24
        </Pill>
      </View>

      {/* search bar */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          backgroundColor: '#fff',
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
          shadowColor: '#33324A',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <Search size={16} color="#9C9AB2" />
        <Text style={{ fontFamily: f.body400, fontSize: 14, color: c.faint }}>
          Search food, medicine, product…
        </Text>
      </View>

      {/* camera viewfinder */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 16,
          backgroundColor: c.scannerBg,
          borderRadius: 18,
          height: 180,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* corner guides */}
        <View
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 28,
            height: 28,
            borderTopWidth: 2,
            borderLeftWidth: 2,
            borderColor: 'white',
            borderTopLeftRadius: 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 28,
            height: 28,
            borderTopWidth: 2,
            borderRightWidth: 2,
            borderColor: 'white',
            borderTopRightRadius: 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            width: 28,
            height: 28,
            borderBottomWidth: 2,
            borderLeftWidth: 2,
            borderColor: 'white',
            borderBottomLeftRadius: 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 28,
            height: 28,
            borderBottomWidth: 2,
            borderRightWidth: 2,
            borderColor: 'white',
            borderBottomRightRadius: 2,
          }}
        />
        <View style={{ alignItems: 'center' }}>
          <Svg
            width={32}
            height={32}
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1.5}
            strokeLinecap="round"
          >
            <Rect x="3" y="8" width="18" height="12" rx="2" />
            <Path d="M8 8V5a2 2 0 0 1 4 0v3" />
          </Svg>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
            Scan barcode
          </Text>
        </View>
      </View>

      {/* recent scans */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        <SectionLabel style={{ marginBottom: 2, paddingLeft: 4 }}>Recent scans</SectionLabel>
        <Card style={{ overflow: 'hidden' }}>
          <ScanRow
            emoji="🍣"
            tint="#FBF1CE"
            title="Salmon sushi roll"
            sub="Raw fish · High mercury risk"
            badge="⚠ Caution"
            badgeBg="#FBF1CE"
            badgeFg="#C9A33B"
            divider
          />
          <ScanRow
            emoji="💊"
            tint="#D8F0E6"
            title="Prenatal vitamins"
            sub="Folic acid · Iron · DHA"
            badge="✓ Safe"
            badgeBg="#D8F0E6"
            badgeFg="#3FA98A"
            divider
          />
          <ScanRow
            emoji="💊"
            tint="#FBE0EA"
            title="Ibuprofen 400mg"
            sub="NSAID — risk to fetal kidney"
            badge="✗ Avoid"
            badgeBg="#FBE0EA"
            badgeFg="#D46E97"
          />
        </Card>
      </View>

      <View style={{ height: 32 }} />
    </View>
  );
}

function ScanRow({
  emoji,
  tint,
  title,
  sub,
  badge,
  badgeBg,
  badgeFg,
  divider = false,
}: {
  emoji: string;
  tint: string;
  title: string;
  sub: string;
  badge: string;
  badgeBg: string;
  badgeFg: string;
  divider?: boolean;
}) {
  return (
    <View
      style={[
        {
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        },
        divider ? { borderBottomWidth: 1, borderBottomColor: 'rgba(51,50,74,0.05)' } : null,
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: tint,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 3 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>{sub}</Text>
      </View>
      <Pill bg={badgeBg} fg={badgeFg} size={11} style={{ paddingHorizontal: 10 }}>
        {badge}
      </Pill>
    </View>
  );
}
