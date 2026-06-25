import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* M04 · Recovery Tracker — physical postpartum recovery, logged privately on-device. */
export default function M04RecoveryTracker() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Physical Recovery</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Week 6 · Everything logged privately on-device
        </Text>
      </View>

      {/* what's normal this week */}
      <LinearGradient
        colors={['#E0F4EF', '#D4F0E4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 20, marginBottom: 14, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 }}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#1E5C50', marginBottom: 6 }}>
          What's normal at 6 weeks
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 18, color: '#3A7A6A' }}>
          Bleeding usually stops. Some cramping when breastfeeding is normal. Energy gradually returning. Perineum
          tenderness may continue a little longer.
        </Text>
      </LinearGradient>

      {/* lochia log */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}>
        <Text style={micro}>Postpartum bleeding (lochia)</Text>
        <View style={[whiteCard, { padding: 16 }]}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#D8F0E6', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#3A9B8A' }}>None</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 9, color: c.muted, marginTop: 3 }}>today</Text>
            </View>
            {['Light', 'Mod', 'Heavy'].map((label) => (
              <View
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: '#F4F3FB',
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(51,50,74,0.08)',
                }}
              >
                <Text style={{ fontFamily: f.body700, fontSize: 11, color: c.muted }}>{label}</Text>
              </View>
            ))}
          </View>
          {/* warning note */}
          <View style={{ backgroundColor: '#FBF1CE', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <View style={{ marginTop: 1 }}>
              <AlertCircle size={14} stroke="#C9A33B" />
            </View>
            <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#8A6A20' }}>
              Heavy bleeding or passing clots larger than a plum after day 10 — call your midwife or GP.
            </Text>
          </View>
        </View>
      </View>

      {/* perineal/incision healing */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}>
        <Text style={micro}>Perineal healing</Text>
        <View style={[whiteCard, { paddingVertical: 14, paddingHorizontal: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>2nd degree tear · day 42</Text>
            <View style={{ backgroundColor: '#D8F0E6', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#3A9B8A' }}>Healing well</Text>
            </View>
          </View>
          <View style={{ height: 6, backgroundColor: '#F4F3FB', borderRadius: 999, overflow: 'hidden' }}>
            <LinearGradient
              colors={['#3A9B8A', '#5CC4B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: '85%', height: '100%', borderRadius: 999 }}
            />
          </View>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: c.muted, marginTop: 5 }}>
            85% healed — most women fully healed by 6 weeks ✓
          </Text>
        </View>
      </View>

      {/* postpartum BP */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 8 }}>
        <Text style={micro}>Blood pressure</Text>
        <View style={[whiteCard, { paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 14, alignItems: 'center' }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>118/74</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted, marginTop: 4 }}>Today · 08:30am</Text>
          </View>
          <View style={{ backgroundColor: '#D8F0E6', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#3A9B8A' }}>Normal</Text>
          </View>
        </View>
        {/* pre-eclampsia red-flag note */}
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <View style={{ marginTop: 1 }}>
            <AlertCircle size={13} stroke="#D46E97" />
          </View>
          <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#B04070' }}>
            BP above 140/90 after birth can indicate postpartum pre-eclampsia. Call your midwife immediately.
          </Text>
        </View>
      </View>
    </View>
  );
}

const micro = {
  fontFamily: font.body700,
  fontSize: 11,
  letterSpacing: 0.9,
  textTransform: 'uppercase' as const,
  color: color.muted,
  paddingLeft: 4,
};

const whiteCard = {
  backgroundColor: '#fff',
  borderRadius: 16,
  ...shadow.card,
};

/* circle-with-exclamation alert glyph (matches the HTML's inline svg). */
function AlertCircle({ size, stroke }: { size: number; stroke: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round">
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="8" x2="12" y2="12" />
      <Line x1="12" y1="16" x2="12.01" y2="16" />
    </Svg>
  );
}
