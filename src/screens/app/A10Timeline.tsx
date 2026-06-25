import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline, Line, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* A10 · Lifelong Timeline — Oliver's story, milestone spine + keepsake export. */
export default function A10Timeline({ embedded = false }: { embedded?: boolean }) {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      {!embedded && <StatusBar showIcons />}

      {/* header: Oliver's story + export */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 20, color: c.ink }}>Oliver's story</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 5 }}>
            4 months · 12 moments
          </Text>
        </View>
        <View
          style={[
            {
              width: 36,
              height: 36,
              backgroundColor: '#fff',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.row,
          ]}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <Polyline points="7 10 12 15 17 10" />
            <Line x1="12" y1="15" x2="12" y2="3" />
          </Svg>
        </View>
      </View>

      {/* timeline entries */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, position: 'relative' }}>
        {/* spine line */}
        <LinearGradient
          colors={['#6B6FC9', 'rgba(107,111,201,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', left: 36, top: 0, bottom: 0, width: 2, borderRadius: 999 }}
        />

        {/* Milestone 1 */}
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <Node bg="#6B6FC9">
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="white">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </Svg>
          </Node>
          <Entry>
            <EntryDate>6 weeks · May 4</EntryDate>
            <EntryTitle>First smile ✨</EntryTitle>
            <EntryBody>Oliver gave his first big smile — unprompted, 6:14am.</EntryBody>
          </Entry>
        </View>

        {/* Milestone 2 */}
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <Node bg="#E7E4FB">
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="#6B6FC9">
              <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </Svg>
          </Node>
          <Entry>
            <EntryDate>3 weeks · Apr 13</EntryDate>
            <EntryTitle>First bath at home</EntryTitle>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              <View style={{ width: 48, height: 36, backgroundColor: '#E7E4FB', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
                  <Rect x="3" y="8" width="18" height="12" rx="2" />
                  <Path d="M8 8V5a2 2 0 0 1 4 0v3" />
                </Svg>
              </View>
              <View style={{ width: 48, height: 36, backgroundColor: '#D8F0E6', borderRadius: 8 }} />
            </View>
          </Entry>
        </View>

        {/* Milestone 3 */}
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <Node bg="#E7E4FB">
            <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <Line x1="6" y1="1" x2="6" y2="4" />
              <Line x1="10" y1="1" x2="10" y2="4" />
              <Line x1="14" y1="1" x2="14" y2="4" />
            </Svg>
          </Node>
          <Entry>
            <EntryDate>17 weeks · Jun 18</EntryDate>
            <EntryTitle>First solids — sweet potato</EntryTitle>
            <EntryBody>Not sure about it. Made the face.</EntryBody>
          </Entry>
        </View>

        {/* Add milestone button */}
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 14 }}>
          <View
            style={{
              width: 28,
              height: 28,
              backgroundColor: '#F4F3FB',
              borderRadius: 14,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#C8C6DC',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2.5} strokeLinecap="round">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          </View>
          <Text style={{ fontFamily: f.body600, fontSize: 13, color: c.muted }}>Add a memory…</Text>
        </View>
      </View>

      {/* keepsake button */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <View
          style={{
            borderWidth: 1.5,
            borderColor: '#6B6FC9',
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
          }}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#6B6FC9' }}>Create Keepsake Book</Text>
        </View>
      </View>

      <FamilyNav />
    </View>
  );
}

function Node({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        backgroundColor: bg,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        marginTop: 8,
      }}
    >
      {children}
    </View>
  );
}

function Entry({ children }: { children: React.ReactNode }) {
  return (
    <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, paddingHorizontal: 16 }, shadow.card]}>
      {children}
    </View>
  );
}

function EntryDate({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted, marginBottom: 5 }}>{children}</Text>;
}

function EntryTitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink, marginBottom: 3 }}>{children}</Text>;
}

function EntryBody({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.inkSecondary, lineHeight: 17 }}>{children}</Text>;
}

/* Bottom nav with the Family tab active (periwinkle). */
function FamilyNav() {
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
      <NavItem label="Today" active={false}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M9 22V12h6v10" />
        </Svg>
      </NavItem>
      <NavItem label="Calendar" active={false}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="4" width="18" height="18" rx="3" />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
      </NavItem>
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
      <NavItem label="Family" active>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
          <Circle cx="9" cy="7" r="4" />
          <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
          <Circle cx="19" cy="9" r="2.5" />
          <Path d="M16 20c0-2.21 1.35-4 3-4s3 1.79 3 4" />
        </Svg>
      </NavItem>
      <NavItem label="Settings" active={false}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>
      </NavItem>
    </View>
  );
}

function NavItem({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
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
        {children}
      </View>
      <Text style={{ fontFamily: font.body600, fontSize: 9, letterSpacing: 0.36, color: active ? '#6B6FC9' : color.muted }}>
        {label}
      </Text>
    </View>
  );
}
