import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect } from 'react-native-svg';
import { color, font, radius, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* 06 · Child Profile — faceless child avatar, horizontal stage spine, stat tiles, recent logs. */
export default function A06ChildProfile() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* header: avatar + name + age + stage pill */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            backgroundColor: '#D8F0E6',
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={28} height={28} viewBox="0 0 20 20" fill="#3FA98A">
            <Circle cx="10" cy="7.5" r="5.5" />
            <Path d="M1.5 19Q1.5 13 10 13Q18.5 13 18.5 19Z" />
          </Svg>
        </View>
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Oliver</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 5 }}>
            Jun 23, 2026 · 4 months
          </Text>
        </View>
        <View
          style={{
            marginLeft: 'auto',
            backgroundColor: '#6B6FC9',
            borderRadius: 999,
            paddingVertical: 7,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>Newborn</Text>
        </View>
      </View>

      {/* stage spine */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View
          style={[
            {
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
            },
            shadow.card,
          ]}
        >
          {/* Expecting */}
          <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', gap: 4 }}>
            <Svg width={10} height={13} viewBox="0 0 12 15" fill="#C8C6DC">
              <Circle cx="6" cy="4" r="3.2" />
              <Path d="M1.5 13Q1.5 9.5 6 9.5Q9.5 9.5 10.5 11Q11.5 13 9 13Z" />
            </Svg>
            <Text style={{ fontFamily: f.body700, fontSize: 8, color: '#C8C6DC' }}>Expecting</Text>
          </View>
          {/* Newborn — current */}
          <View
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 4,
              backgroundColor: '#E7E4FB',
              alignItems: 'center',
              gap: 4,
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(51,50,74,0.08)',
            }}
          >
            <Svg width={10} height={14} viewBox="0 0 12 16" fill="#6B6FC9">
              <Ellipse cx="6" cy="5.5" rx="4" ry="5" />
              <Path d="M1.5 15Q1.5 11 6 11Q10.5 11 10.5 15Z" />
            </Svg>
            <Text style={{ fontFamily: f.body700, fontSize: 8, color: '#6B6FC9' }}>Newborn</Text>
          </View>
          {/* Baby */}
          <View
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 6,
              alignItems: 'center',
              gap: 4,
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(51,50,74,0.06)',
            }}
          >
            <Svg width={12} height={16} viewBox="0 0 14 18" fill="#9C9AB2">
              <Ellipse cx="7" cy="6" rx="4.5" ry="5.5" />
              <Path d="M1.5 17Q1.5 12 7 12Q12.5 12 12.5 17Z" />
            </Svg>
            <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#9C9AB2' }}>Baby</Text>
          </View>
          {/* Preschool */}
          <View
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 6,
              alignItems: 'center',
              gap: 4,
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(51,50,74,0.06)',
            }}
          >
            <Svg width={13} height={17} viewBox="0 0 15 19" fill="#C8C6DC">
              <Ellipse cx="7.5" cy="6.5" rx="5" ry="6" />
              <Path d="M1.5 18Q1.5 13 7.5 13Q13.5 13 13.5 18Z" />
            </Svg>
            <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#C8C6DC' }}>Preschool</Text>
          </View>
          {/* School */}
          <View
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 6,
              alignItems: 'center',
              gap: 4,
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(51,50,74,0.06)',
            }}
          >
            <Svg width={14} height={18} viewBox="0 0 16 21" fill="#C8C6DC">
              <Ellipse cx="8" cy="6.5" rx="5.5" ry="6" />
              <Path d="M1.5 20Q1.5 13.5 8 13.5Q14.5 13.5 14.5 20Z" />
            </Svg>
            <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#C8C6DC' }}>School</Text>
          </View>
          {/* Teen */}
          <View
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 6,
              alignItems: 'center',
              gap: 4,
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(51,50,74,0.06)',
            }}
          >
            <Svg width={15} height={20} viewBox="0 0 17 23" fill="#C8C6DC">
              <Ellipse cx="8.5" cy="7" rx="5.5" ry="6.5" />
              <Path d="M1.5 22Q1.5 14.5 8.5 14.5Q15.5 14.5 15.5 22Z" />
            </Svg>
            <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#C8C6DC' }}>Teen</Text>
          </View>
        </View>
      </View>

      {/* stat tiles */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', gap: 8 }}>
        <StatTile value="6" label="Feeds" sub="720 ml" subColor="#3FA98A" />
        <StatTile value="14h" label="Sleep" sub="↑ 20m avg" subColor="#6B6FC9" />
        <StatTile value="75th" label="Growth" sub="6.4 kg" subColor="#C9A33B" />
      </View>

      {/* recent logs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: c.muted,
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          Recent
        </Text>
        <View
          style={[
            { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' },
            shadow.card,
          ]}
        >
          {/* Feed */}
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(51,50,74,0.05)',
            }}
          >
            <LogChip bg="#D8F0E6">
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M8 2h8" />
                <Path d="M9 2v3a5.5 5.5 0 0 0-3 4.9V19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9.1A5.5 5.5 0 0 0 15 5V2" />
              </Svg>
            </LogChip>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>Feed · Left side</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>5:23 am · 12 min · ~90 ml</Text>
            </View>
          </View>
          {/* Sleep */}
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(51,50,74,0.05)',
            }}
          >
            <LogChip bg="#E7E4FB">
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
                <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </Svg>
            </LogChip>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>Sleep · 2h 10m</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>3:10 am – 5:20 am</Text>
            </View>
          </View>
          {/* Diaper */}
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <LogChip bg="#FBF1CE">
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#C9A33B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 8l4-4 4 4 4-4 4 4v8l-4 4-4-4-4 4-4-4V8z" />
              </Svg>
            </LogChip>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 2 }}>Diaper · Wet</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>4:10 am</Text>
            </View>
          </View>
        </View>
      </View>

      <ChildNav active="Family" />
    </View>
  );
}

function StatTile({ value, label, sub, subColor }: { value: string; label: string; sub: string; subColor: string }) {
  return (
    <View
      style={[
        { flex: 1, backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center' },
        shadow.card,
      ]}
    >
      <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>{value}</Text>
      <Text
        style={{
          fontFamily: font.body400,
          fontSize: 9,
          color: color.muted,
          marginTop: 5,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: font.body400, fontSize: 10, color: subColor, marginTop: 5 }}>{sub}</Text>
    </View>
  );
}

function LogChip({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <View style={{ width: 36, height: 36, backgroundColor: bg, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

/* Bottom nav used by the App/UI core screens — Today · Calendar · FAB(+) · Family · Settings. */
export function ChildNav({ active }: { active: 'Today' | 'Family' }) {
  const navItem = (
    label: string,
    isActive: boolean,
    icon: React.ReactNode,
  ) => (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 44,
          height: 32,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isActive ? '#E7E4FB' : 'transparent',
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: font.body600, fontSize: 9, color: isActive ? '#6B6FC9' : color.muted, letterSpacing: 0.4 }}>
        {label}
      </Text>
    </View>
  );
  const todayActive = active === 'Today';
  const familyActive = active === 'Family';
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
      {navItem(
        'Today',
        todayActive,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={todayActive ? '#6B6FC9' : color.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M9 22V12h6v10" />
        </Svg>,
      )}
      {navItem(
        'Calendar',
        false,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="4" width="18" height="18" rx="3" />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>,
      )}
      <View
        style={[
          {
            width: 52,
            height: 52,
            backgroundColor: '#6B6FC9',
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -18,
          },
          shadow.periwinkleButton,
        ]}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      </View>
      {navItem(
        'Family',
        familyActive,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={familyActive ? '#6B6FC9' : color.muted} strokeWidth={2} strokeLinecap="round">
          <Circle cx="9" cy="7" r="4" />
          <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
          <Circle cx="19" cy="9" r="2.5" />
          <Path d="M16 20c0-2.21 1.35-4 3-4s3 1.79 3 4" />
        </Svg>,
      )}
      {navItem(
        'Settings',
        false,
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color.muted} strokeWidth={2} strokeLinecap="round">
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>,
      )}
    </View>
  );
}
