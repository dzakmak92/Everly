import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P06 · Birth Prep Suite — hospital bag checklist. */
export default function P06BirthPrep() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Birth Prep</Text>
      </View>

      {/* pill tabs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', gap: 6 }}>
        <View style={{ backgroundColor: '#E98FB3', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>Hospital Bag</Text>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(51,50,74,0.08)' }}>
          <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#6F6E86' }}>Birth Plan</Text>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(51,50,74,0.08)' }}>
          <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#6F6E86' }}>Baby Names</Text>
        </View>
      </View>

      {/* progress banner */}
      <LinearGradient
        colors={['#FBE0EA', '#FCE6D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          borderRadius: radius.tile,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink }}>23 of 42 packed</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 4 }}>Suggested to pack by week 36</Text>
        </View>
        <Text style={{ fontFamily: f.display700, fontSize: 28, color: c.rose }}>55%</Text>
      </LinearGradient>

      {/* category sections */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {/* For Mum */}
        <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: c.rose, paddingLeft: 4 }}>For Mum</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: radius.tile, overflow: 'hidden', ...shadow.card }}>
          <ChecklistRow checked label="Maternity notes / hospital card" divider />
          <ChecklistRow checked label="Birth plan printout" divider />
          <ChecklistRow label="Loose comfortable clothing × 2" divider />
          <ChecklistRow label="Toiletries bag" />
        </View>

        {/* For Baby */}
        <Text style={{ fontFamily: f.body700, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: c.rose, paddingLeft: 4, marginTop: 4 }}>For Baby</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: radius.tile, overflow: 'hidden', ...shadow.card }}>
          <ChecklistRow checked label="Newborn sleepsuits × 3" divider />
          <ChecklistRow label="Car seat (installed)" />
        </View>
      </View>

      <View style={{ height: 24 }} />
    </View>
  );
}

function ChecklistRow({ checked = false, label, divider = false }: { checked?: boolean; label: string; divider?: boolean }) {
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.04)',
      }}
    >
      {checked ? (
        <View style={{ width: 22, height: 22, backgroundColor: '#D8F0E6', borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 13l4 4L19 7" />
          </Svg>
        </View>
      ) : (
        <View style={{ width: 22, height: 22, backgroundColor: c.canvas, borderRadius: 11, borderWidth: 1.5, borderColor: 'rgba(51,50,74,0.12)' }} />
      )}
      <Text
        style={{
          flex: 1,
          fontFamily: f.body600,
          fontSize: 13,
          color: checked ? c.muted : c.ink,
          textDecorationLine: checked ? 'line-through' : 'none',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
