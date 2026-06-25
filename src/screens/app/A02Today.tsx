import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';

const f = font;
const c = color;

/* 02 · Today / Dashboard — Everly family home (Oliver mint / Mia lilac + maternal You). */
export default function A02Today() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      {/* status bar */}
      <View
        style={{
          paddingTop: 14,
          paddingHorizontal: 26,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>9:41</Text>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <Svg width={16} height={11} viewBox="0 0 16 11">
            <Rect x="0" y="6" width="3" height="5" rx="0.7" fill="#33324A" />
            <Rect x="4.5" y="4" width="3" height="7" rx="0.7" fill="#33324A" />
            <Rect x="9" y="2" width="3" height="9" rx="0.7" fill="#33324A" />
            <Rect x="13.5" y="0" width="2.5" height="11" rx="0.7" fill="#33324A" />
          </Svg>
          <Svg width={15} height={11} viewBox="0 0 15 11">
            <Circle cx="7.5" cy="10.2" r="0.9" fill="#33324A" />
            <Path d="M4.5 7.5Q7.5 5 10.5 7.5" fill="none" stroke="#33324A" strokeWidth={1.4} strokeLinecap="round" />
            <Path d="M2 4.8Q7.5 1 13 4.8" fill="none" stroke="#33324A" strokeWidth={1.4} strokeLinecap="round" />
          </Svg>
          <Svg width={23} height={12} viewBox="0 0 23 12">
            <Rect x="0.6" y="0.6" width="18.8" height="10.8" rx="2.8" stroke="#33324A" strokeWidth={1.2} fill="none" />
            <Rect x="2" y="2" width="14" height="8" rx="1.5" fill="#33324A" />
            <Path d="M20 4v4" stroke="#33324A" strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
        </View>
      </View>

      {/* greeting */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 6 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#33324A' }}>Good morning, Emma</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 5 }}>Monday, June 23</Text>
      </View>

      {/* child + You pills */}
      <View style={{ paddingHorizontal: 24, paddingTop: 14, flexDirection: 'row', gap: 10 }}>
        {/* Oliver — mint */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#D8F0E6',
            borderRadius: 999,
            paddingVertical: 8,
            paddingRight: 14,
            paddingLeft: 8,
          }}
        >
          <PillAvatar bg="#3FA98A" silhouette="white" />
          <View>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#3FA98A' }}>Oliver</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#3FA98A', opacity: 0.75, marginTop: 3 }}>4 months</Text>
          </View>
        </View>

        {/* Mia — lilac (white card outline) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#fff',
            borderWidth: 1.5,
            borderColor: 'rgba(51,50,74,0.09)',
            borderRadius: 999,
            paddingVertical: 8,
            paddingRight: 14,
            paddingLeft: 8,
          }}
        >
          <PillAvatar bg="#E7E4FB" silhouette="#6B6FC9" />
          <View>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#33324A' }}>Mia</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 3 }}>6 years</Text>
          </View>
        </View>
      </View>

      {/* what's next */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: '#9C9AB2',
            marginBottom: 12,
            paddingLeft: 4,
          }}
        >
          What's next
        </Text>

        {/* feed */}
        <FeedRow
          chipBg="#D8F0E6"
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M8 2h8" />
              <Path d="M9 2v3a5.5 5.5 0 0 0-3 4.9V19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9.1A5.5 5.5 0 0 0 15 5V2" />
            </Svg>
          }
          title="Last feed · Left side"
          sub="Oliver · 5:23 am · 12 min"
          marginBottom={8}
          trailing={
            <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>2h 10m</Text>
            </View>
          }
        />

        {/* swim practice */}
        <FeedRow
          chipBg="#E7E4FB"
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Rect x="3" y="4" width="18" height="18" rx="3" />
              <Path d="M16 2v4M8 2v4M3 10h18" />
            </Svg>
          }
          title="Mia · Swim practice"
          sub="Today · 16:30 · St Mary's Pool"
          marginBottom={8}
          trailing={
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
              <Path d="M9 18l6-6-6-6" />
            </Svg>
          }
        />

        {/* vaccine */}
        <FeedRow
          chipBg="#FBE0EA"
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D46E97" strokeWidth={2} strokeLinecap="round">
              <Path d="M11 3l10 10-4 4L7 7z" />
              <Path d="M7 7L3 11l4 4M5 15l-2 4M15 5l4-2" />
            </Svg>
          }
          title="Oliver · 6-in-1 vaccine"
          sub="Due in 9 days · Dr. Brennan"
          marginBottom={0}
          trailing={
            <View style={{ backgroundColor: '#FBE0EA', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D46E97' }}>9 days</Text>
            </View>
          }
        />
      </View>

      {/* bottom nav */}
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
          marginTop: 4,
        }}
      >
        <NavItem
          label="Today"
          active
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <Path d="M9 22V12h6v10" />
            </Svg>
          }
        />
        <NavItem
          label="Calendar"
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Rect x="3" y="4" width="18" height="18" rx="3" />
              <Path d="M16 2v4M8 2v4M3 10h18" />
            </Svg>
          }
        />
        {/* center FAB */}
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
        <NavItem
          label="Family"
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
              <Circle cx="9" cy="7" r="4" />
              <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
              <Circle cx="19" cy="9" r="2.5" />
              <Path d="M16 20c0-2.21 1.35-4 3-4s3 1.79 3 4" />
            </Svg>
          }
        />
        <NavItem
          label="Settings"
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
              <Circle cx="12" cy="12" r="3" />
              <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </Svg>
          }
        />
      </View>
    </View>
  );
}

/* Round avatar holding a faceless silhouette (the child/maternal pill glyph). */
function PillAvatar({ bg, silhouette }: { bg: string; silhouette: string }) {
  return (
    <View style={{ width: 32, height: 32, backgroundColor: bg, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={16} height={16} viewBox="0 0 20 20">
        <Circle cx="10" cy="8" r="4.5" fill={silhouette} />
        <Path d="M3 19Q3 14 10 14Q17 14 17 19Z" fill={silhouette} />
      </Svg>
    </View>
  );
}

function FeedRow({
  chipBg,
  icon,
  title,
  sub,
  trailing,
  marginBottom,
}: {
  chipBg: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  trailing: React.ReactNode;
  marginBottom: number;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          marginBottom,
        },
        shadow.card,
      ]}
    >
      <View style={{ width: 40, height: 40, backgroundColor: chipBg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 3 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>{sub}</Text>
      </View>
      {trailing}
    </View>
  );
}

function NavItem({ label, icon, active = false }: { label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View
        style={{
          width: 44,
          height: 32,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? '#E7E4FB' : 'transparent',
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: f.body600, fontSize: 9, letterSpacing: 0.4, color: active ? '#6B6FC9' : '#9C9AB2' }}>{label}</Text>
    </View>
  );
}
