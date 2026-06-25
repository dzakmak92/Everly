import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* ────────────────────────────────────────────────────────────────────────
 * D2 · Config & Feature Flags — Everly Operator Admin (1440 desktop console).
 * Pixel-faithful to Everly Admin.dc.html lines 257–397.
 * Rendered inside the 1440-wide frame by the caller; no StatusBar.
 * ──────────────────────────────────────────────────────────────────────── */
export default function D2Config() {
  return (
    <View style={{ width: 1440, flexDirection: 'row', backgroundColor: '#F8F7FF' }}>
      <Sidebar />
      <MainCanvas />
    </View>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */
function Sidebar() {
  return (
    <View
      style={{
        width: 240,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: 'rgba(51,50,74,0.07)',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <View
        style={{
          paddingTop: 24,
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(51,50,74,0.06)',
        }}
      >
        <Logo width={28} height={32} color="#76a878" />
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 15, color: '#33324A' }}>Everly</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 3 }}>Admin Console</Text>
        </View>
      </View>

      {/* Nav items */}
      <View style={{ paddingVertical: 16, paddingHorizontal: 12, flex: 1, gap: 2 }}>
        <NavItem label="Dashboard" icon={<ActivityIcon color="#9C9AB2" />} />
        <NavItem label="Users" icon={<UsersIcon color="#9C9AB2" />} />
        <NavItem label="Billing" icon={<BillingIcon color="#9C9AB2" />} />
        <NavItem active label="Config & Flags" icon={<EditIcon color="#6B6FC9" />} />
        <NavItem label="Audit Log" icon={<FileIcon color="#9C9AB2" />} />
      </View>

      {/* Bottom user */}
      <View
        style={{
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderTopColor: 'rgba(51,50,74,0.06)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: '#E7E4FB',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={16} height={16} viewBox="0 0 20 20">
            <Circle cx="10" cy="7.5" r="5" fill="#6B6FC9" />
            <Path d="M2 19Q2 13 10 13Q18 13 18 19Z" fill="#6B6FC9" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#33324A' }}>Admin</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2', marginTop: 2 }}>Superadmin</Text>
        </View>
      </View>
    </View>
  );
}

function NavItem({ active, label, icon }: { active?: boolean; label: string; icon: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: active ? '#E7E4FB' : 'transparent',
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: active ? f.body700 : f.body600,
          fontSize: 13,
          color: active ? '#6B6FC9' : '#6F6E86',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/* ── Main canvas ─────────────────────────────────────────────────────── */
function MainCanvas() {
  return (
    <View style={{ flex: 1, paddingVertical: 28, paddingHorizontal: 32, overflow: 'hidden' }}>
      {/* Page header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#33324A' }}>Config & Feature Flags</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 5 }}>
            Changes apply without redeployment
          </Text>
        </View>
        <View
          style={{
            backgroundColor: '#D8F0E6',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <View style={{ width: 7, height: 7, backgroundColor: '#3FA98A', borderRadius: 3.5 }} />
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#3FA98A' }}>All systems live</Text>
        </View>
      </View>

      {/* Live config table */}
      <ConfigTable />

      {/* Feature flags board */}
      <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 14 }}>Feature Flags</Text>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <View style={{ flex: 1, gap: 14 }}>
          <FlagCard {...flagSnap} />
          <FlagCard {...flagMaternal} />
        </View>
        <View style={{ flex: 1, gap: 14 }}>
          <FlagCard {...flagCoparent} />
          <FlagCard {...flagPreconception} />
        </View>
        <View style={{ flex: 1, gap: 14 }}>
          <FlagCard {...flagNightMode} />
          <FlagCard {...flagEpds} />
        </View>
      </View>
    </View>
  );
}

/* ── Live Config Values table ────────────────────────────────────────── */
const tableShadow = {
  shadowColor: '#33324A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

const COL_KEY = 200;
const COL_UPDATED = 120;
const COL_ACTION = 120;
const hairTop = 'rgba(51,50,74,0.05)';
const hairRow = 'rgba(51,50,74,0.04)';

function ConfigTable() {
  return (
    <View
      style={[
        { backgroundColor: '#fff', borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
        tableShadow,
      ]}
    >
      {/* Card header */}
      <View
        style={{
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(51,50,74,0.06)',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>Live Config Values</Text>
        <View style={{ backgroundColor: '#E7E4FB', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>Edit All</Text>
        </View>
      </View>

      {/* Header row */}
      <View style={{ flexDirection: 'row' }}>
        <Th width={COL_KEY}>Key</Th>
        <Th flex>Value</Th>
        <Th width={COL_UPDATED}>Updated</Th>
        <Th width={COL_ACTION}> </Th>
      </View>

      {/* trial_length_days */}
      <View style={{ flexDirection: 'row' }}>
        <TdKey width={COL_KEY}>trial_length_days</TdKey>
        <Td flex>
          <ValuePill>10</ValuePill>
        </Td>
        <TdMuted width={COL_UPDATED}>Jun 1</TdMuted>
        <Td width={COL_ACTION}>
          <EditLink />
        </Td>
      </View>

      {/* pro_price_monthly_eur */}
      <View style={{ flexDirection: 'row' }}>
        <TdKey width={COL_KEY}>pro_price_monthly_eur</TdKey>
        <Td flex>
          <ValuePill>3.99</ValuePill>
        </Td>
        <TdMuted width={COL_UPDATED}>May 15</TdMuted>
        <Td width={COL_ACTION}>
          <EditLink />
        </Td>
      </View>

      {/* enabled_languages */}
      <View style={{ flexDirection: 'row' }}>
        <TdKey width={COL_KEY}>enabled_languages</TdKey>
        <Td flex>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
            <LangChip on>EN</LangChip>
            <LangChip on>DE</LangChip>
            <LangChip on>ES</LangChip>
            <LangChip on>FR</LangChip>
            <LangChip>TR</LangChip>
            <LangChip>IT</LangChip>
          </View>
        </Td>
        <TdMuted width={COL_UPDATED}>Apr 3</TdMuted>
        <Td width={COL_ACTION}>
          <EditLink />
        </Td>
      </View>

      {/* whats_new_copy (last row — no bottom borders) */}
      <View style={{ flexDirection: 'row' }}>
        <TdKey width={COL_KEY} last>
          whats_new_copy
        </TdKey>
        <Td flex last>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#6F6E86' }}>"Rhythm Ring now available…"</Text>
        </Td>
        <TdMuted width={COL_UPDATED} last>
          Jun 20
        </TdMuted>
        <Td width={COL_ACTION} last>
          <EditLink />
        </Td>
      </View>
    </View>
  );
}

function Th({ children, width, flex }: { children: React.ReactNode; width?: number; flex?: boolean }) {
  return (
    <View
      style={{
        width,
        flex: flex ? 1 : undefined,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#F8F7FF',
        borderBottomWidth: 1,
        borderBottomColor: hairTop,
      }}
    >
      <Text
        style={{
          fontFamily: f.body700,
          fontSize: 10,
          color: '#9C9AB2',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function Td({
  children,
  width,
  flex,
  last,
}: {
  children: React.ReactNode;
  width?: number;
  flex?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={{
        width,
        flex: flex ? 1 : undefined,
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: hairRow,
      }}
    >
      {children}
    </View>
  );
}

function TdKey({ children, width, last }: { children: React.ReactNode; width?: number; last?: boolean }) {
  return (
    <Td width={width} last={last}>
      <Text style={{ fontFamily: f.body600, fontSize: 13, color: '#33324A' }}>{children}</Text>
    </Td>
  );
}

function TdMuted({ children, width, last }: { children: React.ReactNode; width?: number; last?: boolean }) {
  return (
    <Td width={width} last={last}>
      <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>{children}</Text>
    </Td>
  );
}

function ValuePill({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: '#E7E4FB',
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#6B6FC9' }}>{children}</Text>
    </View>
  );
}

function LangChip({ children, on }: { children: React.ReactNode; on?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: on ? '#D8F0E6' : '#F4F3FB',
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
      }}
    >
      <Text style={{ fontFamily: f.body700, fontSize: 11, color: on ? '#3FA98A' : '#9C9AB2' }}>{children}</Text>
    </View>
  );
}

function EditLink() {
  return <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#6B6FC9' }}>Edit</Text>;
}

/* ── Feature flag card ───────────────────────────────────────────────── */
type Chip = { label: string; on?: boolean; mint?: boolean };
type FootBtn = { label: string; kind: 'kill' | 'killLocked' | 'neutral' };

type Flag = {
  key: string;
  desc: string;
  toggleOn: boolean;
  rolloutPct: number;
  rolloutText: string;
  rolloutTextMuted?: boolean;
  barFilled: boolean; // true → periwinkle bar, false → muted bar
  chips: Chip[];
  footNote: string;
  spark?: { d: string; stroke: string };
  buttons: [FootBtn, FootBtn];
};

function FlagCard(flag: Flag) {
  return (
    <View
      style={[{ backgroundColor: '#fff', borderRadius: 16, padding: 18 }, tableShadow]}
    >
      {/* Header: name/desc + toggle */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#33324A', marginBottom: 4 }}>{flag.key}</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#9C9AB2' }}>{flag.desc}</Text>
        </View>
        <Toggle on={flag.toggleOn} />
      </View>

      {/* Rollout slider */}
      <View style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2' }}>Rollout</Text>
          <Text
            style={{
              fontFamily: f.body700,
              fontSize: 10,
              color: flag.rolloutTextMuted ? '#9C9AB2' : '#6B6FC9',
            }}
          >
            {flag.rolloutText}
          </Text>
        </View>
        <View style={{ height: 6, backgroundColor: '#F4F3FB', borderRadius: 999, overflow: 'hidden' }}>
          <View
            style={{
              width: `${flag.rolloutPct}%`,
              height: '100%',
              backgroundColor: flag.barFilled ? '#6B6FC9' : '#9C9AB2',
              borderRadius: 999,
            }}
          />
        </View>
      </View>

      {/* Targeting chips */}
      <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {flag.chips.map((c, i) => (
          <TargetChip key={i} {...c} />
        ))}
      </View>

      {/* Adoption note + sparkline */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#9C9AB2' }}>{flag.footNote}</Text>
        {flag.spark && (
          <Svg width={60} height={16} viewBox="0 0 60 16">
            <Path
              d={flag.spark.d}
              stroke={flag.spark.stroke}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        )}
      </View>

      {/* Footer buttons */}
      <View
        style={{
          marginTop: 10,
          borderTopWidth: 1,
          borderTopColor: 'rgba(51,50,74,0.05)',
          paddingTop: 10,
          flexDirection: 'row',
          gap: 6,
        }}
      >
        {flag.buttons.map((b, i) => (
          <FooterBtn key={i} {...b} />
        ))}
      </View>
    </View>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <View
      style={{
        width: 40,
        height: 22,
        backgroundColor: on ? '#6B6FC9' : '#D8D6F0',
        borderRadius: 999,
        position: 'relative',
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          backgroundColor: 'white',
          borderRadius: 9,
          position: 'absolute',
          top: 2,
          left: on ? undefined : 2,
          right: on ? 2 : undefined,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      />
    </View>
  );
}

function TargetChip({ label, on, mint }: Chip) {
  const bg = on ? '#E7E4FB' : mint ? '#D8F0E6' : '#F4F3FB';
  const fg = on ? '#6B6FC9' : mint ? '#3FA98A' : '#9C9AB2';
  const weight = on || mint ? f.body700 : f.body600;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8 }}>
      <Text style={{ fontFamily: weight, fontSize: 10, color: fg }}>{label}</Text>
    </View>
  );
}

function FooterBtn({ label, kind }: FootBtn) {
  let bg = '#F4F3FB';
  let fg = '#6F6E86';
  let weight: string = f.body600;
  if (kind === 'kill') {
    bg = '#FBE0EA';
    fg = '#D46E97';
    weight = f.body700;
  } else if (kind === 'killLocked') {
    bg = '#F4F3FB';
    fg = '#C8C6DC';
    weight = f.body600;
  }
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 8, padding: 7 }}>
      <Text style={{ fontFamily: weight, fontSize: 11, color: fg, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

/* ── Flag data ───────────────────────────────────────────────────────── */
const flagSnap: Flag = {
  key: 'snap_cloud_parse',
  desc: 'Cloud LLM parse for Snap-to-Schedule',
  toggleOn: true,
  rolloutPct: 75,
  rolloutText: '75%',
  barFilled: true,
  chips: [
    { label: 'Pro', on: true },
    { label: 'Family', on: true },
    { label: 'v2.4+' },
  ],
  footNote: 'Usage this week',
  spark: { d: 'M0 12 L10 10 L20 9 L30 7 L40 5 L50 4 L60 2', stroke: '#6B6FC9' },
  buttons: [
    { label: 'Kill switch', kind: 'kill' },
    { label: 'Edit', kind: 'neutral' },
  ],
};

const flagCoparent: Flag = {
  key: 'coparent_realtime_sync',
  desc: 'Optional real-time backend for co-parents',
  toggleOn: false,
  rolloutPct: 0,
  rolloutText: '0% · Off',
  rolloutTextMuted: true,
  barFilled: false,
  chips: [{ label: 'Beta only' }, { label: 'Family' }],
  footNote: 'Opt-in future feature',
  buttons: [
    { label: 'Enable', kind: 'neutral' },
    { label: 'Edit', kind: 'neutral' },
  ],
};

const flagNightMode: Flag = {
  key: 'night_mode_auto_v2',
  desc: 'Auto night mode based on time + device brightness',
  toggleOn: true,
  rolloutPct: 100,
  rolloutText: '100%',
  barFilled: true,
  chips: [
    { label: 'All users', mint: true },
    { label: 'All versions', mint: true },
  ],
  footNote: 'Fully rolled out',
  spark: { d: 'M0 14 L10 12 L20 10 L30 6 L40 4 L50 3 L60 2', stroke: '#3FA98A' },
  buttons: [
    { label: 'Kill switch', kind: 'kill' },
    { label: 'Edit', kind: 'neutral' },
  ],
};

const flagMaternal: Flag = {
  key: 'maternal_postpartum_module',
  desc: 'v1.1 maternal arc · postpartum + recovery',
  toggleOn: true,
  rolloutPct: 40,
  rolloutText: '40%',
  barFilled: true,
  chips: [
    { label: 'All tiers', on: true },
    { label: 'v3.0+' },
    { label: 'Gradual' },
  ],
  footNote: 'Adoption ramping',
  spark: { d: 'M0 14 L10 13 L20 11 L30 9 L40 6 L50 4 L60 3', stroke: '#6B6FC9' },
  buttons: [
    { label: 'Kill switch', kind: 'kill' },
    { label: 'Edit', kind: 'neutral' },
  ],
};

const flagPreconception: Flag = {
  key: 'preconception_ttc',
  desc: 'Cycle / fertility · top-of-funnel stage',
  toggleOn: false,
  rolloutPct: 10,
  rolloutText: '10% · Beta',
  rolloutTextMuted: true,
  barFilled: false,
  chips: [{ label: 'Beta cohort' }, { label: 'EN/DE only' }],
  footNote: 'Earliest funnel · testing',
  buttons: [
    { label: 'Expand', kind: 'neutral' },
    { label: 'Edit', kind: 'neutral' },
  ],
};

const flagEpds: Flag = {
  key: 'epds_mood_screening',
  desc: 'Postnatal mood screen · safety · always free',
  toggleOn: true,
  rolloutPct: 40,
  rolloutText: '40%',
  barFilled: true,
  chips: [
    { label: 'All tiers · free', on: true },
    { label: 'Duty of care', mint: true },
  ],
  footNote: 'Ships with maternal module',
  buttons: [
    { label: 'Kill switch locked', kind: 'killLocked' },
    { label: 'Edit', kind: 'neutral' },
  ],
};

/* ── Sidebar nav icons (inline, matching the HTML SVGs) ──────────────── */
function ActivityIcon({ color: col }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M22 12 18 12 15 21 9 3 6 12 2 12"
        fill="none"
        stroke={col}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UsersIcon({ color: col }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" fill="none" stroke={col} strokeWidth={2} />
    </Svg>
  );
}

function BillingIcon({ color: col }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="none" stroke={col} strokeWidth={2} />
      <Path d="M2 10h20" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function EditIcon({ color: col }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M12 20h9" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FileIcon({ color: col }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 2 14 8 20 8" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
