import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar, SproutLockBadge } from '../../components/ui';

const f = font;
const c = color;

/* P17 · De-Shamed Weight + Bump Time-Lapse — range-not-score weight, photo strip. */
export default function P17WeightBump() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Weight & Bump</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Contextual · Gentle · Never a score
        </Text>
      </View>

      {/* de-shamed weight chart */}
      <View
        style={[
          { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 20, padding: 18 },
          shadow.card,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <View>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Your weight gain</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted, marginTop: 2 }}>
              Shown as a range, not a single target
            </Text>
          </View>
          <View style={{ backgroundColor: '#D8F0E6', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#3FA98A' }}>On track</Text>
          </View>
        </View>

        {/* chart area */}
        <View style={{ position: 'relative', height: 90, marginTop: 12, marginBottom: 8 }}>
          {/* healthy band shading */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '18%',
              bottom: '22%',
              backgroundColor: 'rgba(58,155,138,0.08)',
              borderRadius: 4,
            }}
          />
          {/* band labels */}
          <Text style={{ position: 'absolute', right: 0, top: '16%', fontFamily: f.body400, fontSize: 9, color: c.muted }}>
            +16kg upper
          </Text>
          <Text style={{ position: 'absolute', right: 0, bottom: '20%', fontFamily: f.body400, fontSize: 9, color: c.muted }}>
            +11kg lower
          </Text>
          {/* your gain line */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Svg viewBox="0 0 300 90" width="100%" height={90} preserveAspectRatio="none">
              <Polyline
                points="0,80 50,75 100,68 150,60 200,52 250,47 300,44"
                stroke="#E98FB3"
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={300} cy={44} r={4} fill="#E98FB3" />
            </Svg>
          </View>
        </View>

        {/* week axis */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          {['Wk 0', 'Wk 10', 'Wk 20', 'Wk 30', 'Wk 40'].map((w) => (
            <Text key={w} style={{ fontFamily: f.body400, fontSize: 9, color: c.faint }}>
              {w}
            </Text>
          ))}
        </View>

        {/* reassurance note */}
        <View
          style={{
            backgroundColor: '#E0F4EF',
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="#3A9B8A" style={{ marginTop: 1 }}>
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
          <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#1E5C50' }}>
            You've gained +9.4kg by week 24. The healthy range at this stage is +7–11kg. You're doing great.
          </Text>
        </View>
      </View>

      {/* bump time-lapse */}
      <View
        style={[
          { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 20, padding: 16, paddingHorizontal: 18 },
          shadow.card,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Bump time-lapse</Text>
          <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#D46E97' }}>24 photos</Text>
          </View>
        </View>

        {/* mini photo strip */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, overflow: 'hidden' }}>
          <PhotoTile colors={['#FBE0EA', '#FCE6D8']} label="W6" labelColor="#D46E97" />
          <PhotoTile colors={['#E7E4FB', '#DCEBFA']} label="W10" labelColor="#6B6FC9" />
          <PhotoTile colors={['#D8F0E6', '#DCEBFA']} label="W16" labelColor="#3FA98A" />
          <PhotoTile colors={['#FBF1CE', '#FCE6D8']} label="W20" labelColor="#C9A33B" />
          <PhotoTile colors={['#FBE0EA', '#E98FB3']} label="W24 ✓" labelColor="#D46E97" bordered />
        </View>

        {/* export button (premium) */}
        <LinearGradient
          colors={['#E98FB3', '#D46E97']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            },
            shadow.pinkButton,
          ]}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
            <Path d="M23 7 16 12 23 17 23 7z" />
            <Path d="M3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff' }}>Export time-lapse video</Text>
          <SproutLockBadge />
        </LinearGradient>
      </View>

      <View style={{ height: 20 }} />
    </View>
  );
}

function PhotoTile({
  colors,
  label,
  labelColor,
  bordered = false,
}: {
  colors: [string, string];
  label: string;
  labelColor: string;
  bordered?: boolean;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 58,
        height: 58,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: bordered ? 2 : 0,
        borderColor: '#E98FB3',
      }}
    >
      <Text style={{ fontFamily: font.body700, fontSize: 9, color: labelColor, textAlign: 'center' }}>{label}</Text>
    </LinearGradient>
  );
}
