import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P07 · Baby Names — swipe-to-explore name cards. */
export default function P07BabyNames() {
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
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Baby Names</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted }}>Swipe to explore</Text>
      </View>

      {/* name card stack */}
      <View style={{ paddingHorizontal: 20, position: 'relative' }}>
        {/* background cards (stack effect) */}
        <View style={{ position: 'absolute', left: 28, right: 28, top: 8, height: 180, backgroundColor: '#FBE0EA', borderRadius: 24, opacity: 0.5 }} />
        <View style={{ position: 'absolute', left: 24, right: 24, top: 4, height: 180, backgroundColor: '#FCE6D8', borderRadius: 24, opacity: 0.7 }} />

        {/* main name card */}
        <View
          style={[
            {
              backgroundColor: '#fff',
              borderRadius: 24,
              paddingVertical: 28,
              paddingHorizontal: 24,
              alignItems: 'center',
              zIndex: 1,
            },
            shadow.card,
          ]}
        >
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 8 }}>
            Girl · Irish · Classic
          </Text>
          <Text style={{ fontFamily: f.display700, fontSize: 52, color: c.ink, marginBottom: 12 }}>Olivia</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: c.inkSecondary, textAlign: 'center', marginBottom: 16 }}>
            From Latin "oliva" (olive tree) · Symbol of peace and fertility. Consistently top-5 in Ireland & UK.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <View style={{ backgroundColor: c.canvas, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: f.body600, fontSize: 11, color: c.muted }}>Short form: Liv</Text>
            </View>
            <View style={{ backgroundColor: c.canvas, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: f.body600, fontSize: 11, color: c.muted }}>#2 Ireland</Text>
            </View>
          </View>
        </View>
      </View>

      {/* actions */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, flexDirection: 'row', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
        <View style={[{ width: 56, height: 56, backgroundColor: '#fff', borderRadius: 28, alignItems: 'center', justifyContent: 'center' }, shadow.card]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
            <Line x1="18" y1="6" x2="6" y2="18" />
            <Line x1="6" y1="6" x2="18" y2="18" />
          </Svg>
        </View>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>Skip</Text>
        <View
          style={[
            { width: 68, height: 68, backgroundColor: '#E98FB3', borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
            shadow.pinkButton,
          ]}
        >
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="white">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
        </View>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted }}>Save</Text>
        <View
          style={[
            { width: 56, height: 56, backgroundColor: '#6B6FC9', borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
            shadow.periwinkleButton,
          ]}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 12h14M12 5l7 7-7 7" />
          </Svg>
        </View>
      </View>

      {/* mutual likes */}
      <View style={[{ marginHorizontal: 20, marginBottom: 24, backgroundColor: '#fff', borderRadius: radius.tile, paddingVertical: 14, paddingHorizontal: 16 }, shadow.card]}>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: c.ink, marginBottom: 10 }}>You both liked ❤️</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {['Noah', 'Emma', 'Liam'].map((name) => (
            <View key={name} style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.rose }}>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
