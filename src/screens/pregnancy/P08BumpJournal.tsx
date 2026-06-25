import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P08 · Bump Journal — weekly photos + milestones. */
export default function P08BumpJournal() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Bump Journal</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 5 }}>Emma's pregnancy · Week 24</Text>
        </View>
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: c.rose }}>24 weeks</Text>
        </View>
      </View>

      {/* tag entry row */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 10, flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Text style={{ fontFamily: f.body600, fontSize: 10, color: c.muted }}>Tag entry:</Text>
        <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#6B6FC9' }}>Baby A</Text>
        </View>
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: c.rose }}>Baby B</Text>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11, borderWidth: 1.5, borderColor: 'rgba(51,50,74,0.1)' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: c.muted }}>Both</Text>
        </View>
      </View>

      {/* first-chapter note */}
      <View style={{ marginHorizontal: 20, marginBottom: 14, backgroundColor: '#E0F4EF', borderRadius: radius.tileSm, paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', gap: 9, alignItems: 'center' }}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3A9B8A" strokeWidth={2} strokeLinecap="round">
          <Path d="M12 22V8" />
          <Path d="M12 12c0-3-2.5-5-5.5-5 0 3 2.5 5 5.5 5z" />
          <Path d="M12 10c0-3 2.5-5 5.5-5 0 3-2.5 5-5.5 5z" />
        </Svg>
        <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#1E5C50' }}>
          At birth, this becomes baby's <Text style={{ fontFamily: f.body700 }}>first chapter</Text> — your bump journal flows into their timeline.
        </Text>
      </View>

      {/* weekly photo grid */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: c.muted, marginBottom: 10, paddingLeft: 4 }}>
          Weekly photos
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <PhotoTile colors={['#FBE0EA', '#FCE6D8']} label="W20" labelColor="#D46E97" />
          <PhotoTile colors={['#E7E4FB', '#DCEBFA']} label="W21" labelColor="#6B6FC9" />
          <PhotoTile colors={['#D8F0E6', '#DCEBFA']} label="W22" labelColor="#3FA98A" />
          <PhotoTile colors={['#FBF1CE', '#FCE6D8']} label="W23" labelColor="#C9A33B" />
          {/* W24 — Now */}
          <View style={[tileBase, { backgroundColor: '#FBE0EA', borderWidth: 2, borderColor: '#E98FB3' }]}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#D46E97' }}>W24</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 8, color: '#D46E97', marginTop: 2 }}>Now</Text>
          </View>
          {/* add tile */}
          <View style={[tileBase, { backgroundColor: '#fff', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C8C6DC' }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#C8C6DC" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          </View>
        </View>
      </View>

      {/* milestones */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: c.muted, marginBottom: 2, paddingLeft: 4 }}>
          Milestones
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: radius.tile, overflow: 'hidden', ...shadow.card }}>
          <MilestoneRow
            bg="#FBE0EA"
            title="First kick felt"
            subtitle="Week 18 · May 4"
            divider
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="#E98FB3">
                <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </Svg>
            }
          />
          <MilestoneRow
            bg="#E7E4FB"
            title="20-week scan"
            subtitle="Week 20 · June 2 · All clear ✓"
            divider
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
                <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </Svg>
            }
          />
          <MilestoneRow
            bg="#FBF1CE"
            title="Baby shower"
            subtitle="Week 22 · June 14 · 14 guests"
            icon={
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="#E9C46A">
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </Svg>
            }
          />
        </View>
      </View>

      <View style={{ height: 28 }} />
    </View>
  );
}

const tileBase = {
  width: '22%' as const,
  aspectRatio: 1,
  borderRadius: radius.tileSm,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

function PhotoTile({ colors, label, labelColor }: { colors: [string, string]; label: string; labelColor: string }) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tileBase}>
      <Text style={{ fontFamily: f.body700, fontSize: 10, color: labelColor }}>{label}</Text>
    </LinearGradient>
  );
}

function MilestoneRow({
  bg,
  title,
  subtitle,
  icon,
  divider = false,
}: {
  bg: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 13,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.04)',
      }}
    >
      <View style={{ width: 36, height: 36, backgroundColor: bg, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>{subtitle}</Text>
      </View>
    </View>
  );
}
