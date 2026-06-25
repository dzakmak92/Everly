import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* A12 · Settings — grouped on lilac: account, preferences, night-mode, data, about. */
export default function A12Settings() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar showIcons />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 24, color: c.ink }}>Settings</Text>
      </View>

      {/* Account card */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 8,
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          },
          shadow.card,
        ]}
      >
        <View style={{ width: 52, height: 52, backgroundColor: '#E7E4FB', borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={26} height={26} viewBox="0 0 20 20" fill="#6B6FC9">
            <Circle cx="10" cy="7.5" r="5.5" />
            <Path d="M1.5 19Q1.5 13 10 13Q18.5 13 18.5 19Z" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 16, color: c.ink }}>Emma Wilson</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 4 }}>emma@gmail.com</Text>
        </View>
        <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>Pro</Text>
        </View>
      </View>

      {/* Plan & Billing */}
      <View style={[{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
        <Row
          icon={
            <IconBox bg="#FBF1CE">
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C9A33B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Rect x="2" y="5" width="20" height="14" rx="2" />
                <Line x1="2" y1="10" x2="22" y2="10" />
              </Svg>
            </IconBox>
          }
          title="Plan & Billing"
          subtitle="Pro · €3.99/mo · Renews Jul 23"
        />
      </View>

      {/* Preferences */}
      <GroupLabel>Preferences</GroupLabel>
      <View style={[{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
        <Row
          divider
          icon={
            <IconBox bg="#E7E4FB">
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="12" cy="12" r="10" />
                <Line x1="2" y1="12" x2="22" y2="12" />
                <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </Svg>
            </IconBox>
          }
          title="Language"
          value="English"
        />
        <Row
          divider
          icon={
            <IconBox bg="#D8F0E6">
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round">
                <Circle cx="12" cy="12" r="9" />
                <Path d="M12 6v6l4 2" />
              </Svg>
            </IconBox>
          }
          title="Currency"
          value="EUR €"
        />
        {/* Night mode toggle */}
        <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <IconBox bg="#262539">
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#EDEBFA" strokeWidth={2} strokeLinecap="round">
                <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </Svg>
            </IconBox>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Night mode</Text>
          </View>
          <Toggle />
        </View>
      </View>

      {/* Notifications */}
      <GroupLabel>Notifications</GroupLabel>
      <View style={[{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
        <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(51,50,74,0.05)' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Wake-window reminders</Text>
          <Toggle />
        </View>
        <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Vaccine due reminders</Text>
          <Toggle />
        </View>
      </View>

      {/* Data & Privacy */}
      <GroupLabel>Data & Privacy</GroupLabel>
      <View style={{ marginHorizontal: 20, marginBottom: 8, backgroundColor: '#E7E4FB', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Path d="M9 12l2 2 4-4" />
        </Svg>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#54579E', marginBottom: 4 }}>Your data lives on this device</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, lineHeight: 16.5, color: '#6B6FC9' }}>No cloud, no tracking. You control everything.</Text>
        </View>
      </View>
      <View style={[{ marginTop: 8, marginHorizontal: 20, marginBottom: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' }, shadow.card]}>
        <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(51,50,74,0.05)' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Export all data</Text>
          <Chevron color="#9C9AB2" />
        </View>
        <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#E98FB3' }}>Delete all local data</Text>
          <Chevron color="#E98FB3" />
        </View>
      </View>

      <SettingsNav />
    </View>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
      <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, marginBottom: 8, paddingLeft: 4 }}>
        {children}
      </Text>
    </View>
  );
}

function IconBox({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <View style={{ width: 34, height: 34, backgroundColor: bg, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

function Chevron({ color: cc }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={cc} strokeWidth={2} strokeLinecap="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

function Row({
  icon,
  title,
  subtitle,
  value,
  divider = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexShrink: 1 }}>
        {icon}
        <View>
          <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{title}</Text>
          {subtitle ? (
            <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 3 }}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {value ? <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted }}>{value}</Text> : null}
        <Chevron color="#9C9AB2" />
      </View>
    </View>
  );
}

/* Periwinkle on-toggle with white knob on the right. */
function Toggle() {
  return (
    <View style={{ width: 44, height: 24, backgroundColor: '#6B6FC9', borderRadius: 999, position: 'relative' }}>
      <View
        style={{
          width: 20,
          height: 20,
          backgroundColor: 'white',
          borderRadius: 10,
          position: 'absolute',
          right: 2,
          top: 2,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </View>
  );
}

/* Bottom nav with the Settings tab active (periwinkle). */
function SettingsNav() {
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
          { width: 52, height: 52, backgroundColor: '#6B6FC9', borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: -18 },
          shadow.periwinkleButton,
        ]}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      </View>
      <NavItem label="Family" active={false}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round">
          <Circle cx="9" cy="7" r="4" />
          <Path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" />
          <Circle cx="19" cy="9" r="2.5" />
          <Path d="M16 20c0-2.21 1.35-4 3-4s3 1.79 3 4" />
        </Svg>
      </NavItem>
      <NavItem label="Settings" active>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
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
