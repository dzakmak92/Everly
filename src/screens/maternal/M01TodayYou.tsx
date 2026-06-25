import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar, Pill } from '../../components/ui';

const f = font;
const c = color;

/* M01 · Today — "You" Card. Maternal arc home centred on the mother. */
export default function M01TodayYou() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* greeting brand row */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 15, color: '#3A9B8A' }}>Mum&Me</Text>
        <Pill bg="#D4EDE7" fg="#2C8475" size={9} style={{ paddingVertical: 4, paddingHorizontal: 10 }}>
          Free forever
        </Pill>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 8 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 20, color: c.ink }}>Good morning, Emma</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 4 }}>
          Tuesday, 23 June · Day 42 postpartum
        </Text>
      </View>

      {/* YOU card */}
      <LinearGradient
        colors={['#E0F4EF', '#D4EDDB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginTop: 4,
          marginHorizontal: 20,
          marginBottom: 10,
          borderRadius: 22,
          padding: 18,
          borderWidth: 2,
          borderColor: 'rgba(58,155,138,0.13)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#3A9B8A',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="white">
              <Circle cx="10" cy="7.5" r="4.5" />
              <Path d="M2.5 18Q2.5 12 10 12Q17.5 12 17.5 18Z" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#1E5C50' }}>You · Emma</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#3A9B8A', marginTop: 3 }}>
              6 weeks postpartum · 4th trimester
            </Text>
          </View>
          <View style={{ backgroundColor: '#3A9B8A', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#fff' }}>Wk 6</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <YouStat value="😌" label="Mood" sub="Good today" />
          <YouStat value="5h" label="Her sleep" sub="+1h vs yesterday" />
          <YouStat value="6w" label="Recovery" sub="On track" />
        </View>
      </LinearGradient>

      {/* section label */}
      <Text
        style={{
          paddingHorizontal: 24,
          fontFamily: f.body700,
          fontSize: 11,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          color: '#9C9AB2',
          marginBottom: 8,
        }}
      >
        Your children
      </Text>

      {/* child card */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 10,
            backgroundColor: '#fff',
            borderRadius: 18,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
          },
          shadow.card,
        ]}
      >
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: '#FBE0EA',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={22} height={22} viewBox="0 0 20 20" fill="#E98FB3">
            <Circle cx="10" cy="7.5" r="5.5" />
            <Path d="M1.5 19Q1.5 13 10 13Q18.5 13 18.5 19Z" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink }}>Oliver</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginTop: 2 }}>
            Newborn · 42 days old
          </Text>
        </View>
        <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D46E97' }}>Feed due</Text>
        </View>
      </View>

      {/* quick log CTA */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, marginTop: 4 }}>
        <View
          style={[
            {
              backgroundColor: '#3A9B8A',
              padding: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            },
            {
              shadowColor: '#3A9B8A',
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            },
          ]}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#fff' }}>Check in with yourself today →</Text>
        </View>
      </View>

      {/* bottom nav (maternal/teal variant) */}
      <MaternalBottomNav />
    </View>
  );
}

function YouStat({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: f.display700, fontSize: 18, color: '#1E5C50' }}>{value}</Text>
      <Text style={{ fontFamily: f.body600, fontSize: 10, color: '#3A9B8A', marginTop: 4 }}>{label}</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#7AB8AF' }}>{sub}</Text>
    </View>
  );
}

function MaternalBottomNav() {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(51,50,74,0.06)',
        paddingTop: 10,
        paddingHorizontal: 8,
        paddingBottom: 28,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {/* Today (active) */}
      <View style={{ alignItems: 'center', gap: 3 }}>
        <View
          style={{
            width: 44,
            height: 32,
            backgroundColor: '#E0F4EF',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3A9B8A" strokeWidth={2} strokeLinecap="round">
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </Svg>
        </View>
        <Text style={{ fontFamily: f.body600, fontSize: 9, color: '#3A9B8A' }}>Today</Text>
      </View>

      {/* Calendar */}
      <NavItem label="Calendar">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Rect x="3" y="4" width="18" height="18" rx="3" />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
      </NavItem>

      {/* FAB + */}
      <View
        style={[
          {
            width: 52,
            height: 52,
            backgroundColor: '#3A9B8A',
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -18,
          },
          {
            shadowColor: '#3A9B8A',
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
        ]}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      </View>

      {/* Children */}
      <NavItem label="Children">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Circle cx="9" cy="7" r="4" />
          <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
        </Svg>
      </NavItem>

      {/* Settings */}
      <NavItem label="Settings">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Circle cx="12" cy="8" r="4" />
          <Path d="M20 21a8 8 0 1 0-16 0" />
        </Svg>
      </NavItem>
    </View>
  );
}

function NavItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View style={{ width: 44, height: 32, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
      <Text style={{ fontFamily: f.body600, fontSize: 9, color: '#9C9AB2' }}>{label}</Text>
    </View>
  );
}
