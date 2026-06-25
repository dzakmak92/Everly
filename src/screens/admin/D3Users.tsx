import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* ────────────────────────────────────────────────────────────────────────
 * D3 · User Search & Lifecycle — Everly Operator Admin (1440 desktop console).
 * Pixel-faithful to Everly Admin.dc.html lines 406–509.
 * Rendered inside the 1440-wide frame by the caller; no StatusBar.
 * Posture: aggregate / anonymous — account + billing only; child data lives
 * on the user's device.
 * ──────────────────────────────────────────────────────────────────────── */
export default function D3Users() {
  return (
    <View style={{ width: 1440, flexDirection: 'row', backgroundColor: '#F8F7FF' }}>
      <Sidebar />
      <MainCanvas />
    </View>
  );
}

/* ── Sidebar (Users active) ──────────────────────────────────────────── */
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
        <NavItem active label="Users" icon={<UsersIcon color="#6B6FC9" />} />
        <NavItem label="Billing" icon={<BillingIcon color="#9C9AB2" />} />
        <NavItem label="Config & Flags" icon={<EditIcon color="#9C9AB2" />} />
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
          <Avatar fill="#6B6FC9" />
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
      {/* Header + search */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#33324A' }}>Users</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 5 }}>
            5,924 active · 812 trialing · 47 dunning
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {/* Search box */}
          <View
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: 'rgba(51,50,74,0.1)',
              borderRadius: 10,
              paddingVertical: 9,
              paddingHorizontal: 14,
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              width: 280,
            }}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Circle cx="11" cy="11" r="8" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" />
              <Path d="m21 21-4.35-4.35" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#C8C6DC' }}>Search by email or user ID…</Text>
          </View>
          {/* Export CSV */}
          <View
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: 'rgba(51,50,74,0.08)',
              borderRadius: 10,
              paddingVertical: 9,
              paddingHorizontal: 16,
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: f.body600, fontSize: 13, color: '#6F6E86' }}>Export CSV</Text>
          </View>
        </View>
      </View>

      {/* Filter chips */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
        <FilterChip active label="All · 6,927" />
        <FilterChip label="Active · 5,924" />
        <FilterChip label="Trialing · 812" />
        <FilterChip
          label="Failed · 47"
          bg="#FBE0EA"
          fg="#D46E97"
          border="rgba(212,110,151,0.2)"
          bold
        />
        <FilterChip label="Churned · 144" />
      </View>

      {/* Users table */}
      <View
        style={[
          { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
          tableShadow,
        ]}
      >
        {/* Table header */}
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: '#F8F7FF',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(51,50,74,0.05)',
          }}
        >
          <HeaderCell flex={2}>User</HeaderCell>
          <HeaderCell flex={1.2}>Plan</HeaderCell>
          <HeaderCell flex={1}>Status</HeaderCell>
          <HeaderCell flex={1}>Joined</HeaderCell>
          <HeaderCell flex={1}>Last active</HeaderCell>
          <HeaderCell flex={1.4}>Actions</HeaderCell>
        </View>

        {/* Row 1 — selected / expanded */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(51,50,74,0.04)' }}>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 12,
              paddingHorizontal: 20,
              backgroundColor: 'rgba(107,111,201,0.04)',
              alignItems: 'center',
            }}
          >
            <UserCell name="Emma Wilson" email="emma@gmail.com" avatarBg="#E7E4FB" avatarFill="#6B6FC9" />
            <PlanCell label="Family" />
            <StatusCell label="Active" bg="#D8F0E6" fg="#3FA98A" />
            <DateCell>Jan 14, 2026</DateCell>
            <DateCell>Today</DateCell>
            <ActionsCell primaryLabel="View" />
          </View>

          {/* Expanded user detail */}
          <View
            style={{
              paddingTop: 16,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: 'rgba(107,111,201,0.03)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(107,111,201,0.1)',
              flexDirection: 'row',
              gap: 16,
            }}
          >
            <DetailColumn title="Account">
              <DetailText>
                ID: user_31204{'\n'}Locale: EN · EUR{'\n'}2 children linked
              </DetailText>
            </DetailColumn>
            <DetailColumn title="Subscription">
              <DetailText>
                Family · €4.99/mo{'\n'}Renews Jul 14, 2026{'\n'}Stripe: sub_4kF9...
              </DetailText>
            </DetailColumn>
            <DetailColumn title="Trial">
              <DetailText muted>
                Trial used · Converted{'\n'}Day 8 / 10 when paid
              </DetailText>
            </DetailColumn>
            <DetailColumn title="Actions">
              <View style={{ flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
                <View
                  style={{ backgroundColor: '#E7E4FB', borderRadius: 7, paddingVertical: 6, paddingHorizontal: 12 }}
                >
                  <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>Change plan</Text>
                </View>
                <View
                  style={{ backgroundColor: '#F4F3FB', borderRadius: 7, paddingVertical: 6, paddingHorizontal: 12 }}
                >
                  <Text style={{ fontFamily: f.body600, fontSize: 11, color: '#6F6E86' }}>Reset password</Text>
                </View>
                <View style={{ paddingVertical: 6 }}>
                  <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#E98FB3' }}>GDPR erasure →</Text>
                </View>
              </View>
            </DetailColumn>
          </View>
        </View>

        {/* Row 2 */}
        <Row
          name="James O'Brien"
          email="james@outlook.com"
          avatarBg="#D8F0E6"
          avatarFill="#3FA98A"
          plan="Pro"
          status={<StatusCell label="⚠ Dunning" bg="#FBE0EA" fg="#D46E97" />}
          joined="Feb 2, 2026"
          lastActive="Jun 20"
          actions={<ActionsCell primaryLabel="Retry" primaryBg="#FBE0EA" primaryFg="#D46E97" />}
        />

        {/* Row 3 */}
        <Row
          name="Sarah Chen"
          email="sarah@icloud.com"
          avatarBg="#FBF1CE"
          avatarFill="#C9A33B"
          plan="Pro"
          status={<StatusCell label="Trial · Day 7" bg="#FBF1CE" fg="#C9A33B" />}
          joined="Jun 16, 2026"
          lastActive="Today"
          actions={<ActionsCell primaryLabel="Extend" />}
        />

        {/* Row 4 */}
        <Row
          name="Mike Kim"
          email="mike.kim@gmail.com"
          avatarBg="#DCEBFA"
          avatarFill="#4E8FD0"
          plan="Free"
          planBg="#F4F3FB"
          planFg="#9C9AB2"
          status={<StatusCell label="Active" bg="#D8F0E6" fg="#3FA98A" />}
          joined="Mar 8, 2026"
          lastActive="Jun 21"
          actions={<ActionsCell primaryLabel="View" />}
        />

        {/* Row 5 (last — no bottom border) */}
        <Row
          last
          name="Anna Müller"
          email="anna@gmail.com"
          avatarBg="#FBE0EA"
          avatarFill="#D46E97"
          plan="Family"
          status={<StatusCell label="Active" bg="#D8F0E6" fg="#3FA98A" />}
          joined="Apr 19, 2026"
          lastActive="Jun 22"
          actions={<ActionsCell primaryLabel="View" />}
        />
      </View>

      {/* GDPR note */}
      <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Svg width={14} height={14} viewBox="0 0 24 24">
          <Path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="none"
            stroke="#9C9AB2"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M9 12l2 2 4-4" fill="none" stroke="#9C9AB2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>
          GDPR erasure deletes account + billing only — child data lives on the user's device.
        </Text>
      </View>
    </View>
  );
}

/* ── Filter chip ─────────────────────────────────────────────────────── */
function FilterChip({
  active,
  label,
  bg,
  fg,
  border,
  bold,
}: {
  active?: boolean;
  label: string;
  bg?: string;
  fg?: string;
  border?: string;
  bold?: boolean;
}) {
  if (active) {
    return (
      <View style={{ backgroundColor: '#6B6FC9', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#fff' }}>{label}</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        backgroundColor: bg ?? '#fff',
        borderWidth: 1,
        borderColor: border ?? 'rgba(51,50,74,0.08)',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ fontFamily: bold ? f.body700 : f.body600, fontSize: 12, color: fg ?? '#6F6E86' }}>{label}</Text>
    </View>
  );
}

/* ── Table cell helpers ──────────────────────────────────────────────── */
function HeaderCell({ flex, children }: { flex: number; children: string }) {
  return (
    <View style={{ flex }}>
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

function UserCell({
  name,
  email,
  avatarBg,
  avatarFill,
}: {
  name: string;
  email: string;
  avatarBg: string;
  avatarFill: string;
}) {
  return (
    <View style={{ flex: 2, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <View
        style={{
          width: 32,
          height: 32,
          backgroundColor: avatarBg,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Avatar fill={avatarFill} />
      </View>
      <View>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#33324A' }}>{name}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginTop: 2 }}>{email}</Text>
      </View>
    </View>
  );
}

function PlanCell({
  label,
  bg = '#E7E4FB',
  fg = '#6B6FC9',
}: {
  label: string;
  bg?: string;
  fg?: string;
}) {
  return (
    <View style={{ flex: 1.2, flexDirection: 'row' }}>
      <View style={{ backgroundColor: bg, borderRadius: 5, paddingVertical: 3, paddingHorizontal: 10 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: fg }}>{label}</Text>
      </View>
    </View>
  );
}

function StatusCell({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ backgroundColor: bg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 11, color: fg }}>{label}</Text>
      </View>
    </View>
  );
}

function DateCell({ children }: { children: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#6F6E86' }}>{children}</Text>
    </View>
  );
}

function ActionsCell({
  primaryLabel,
  primaryBg = '#E7E4FB',
  primaryFg = '#6B6FC9',
}: {
  primaryLabel: string;
  primaryBg?: string;
  primaryFg?: string;
}) {
  return (
    <View style={{ flex: 1.4, flexDirection: 'row', gap: 6 }}>
      <View style={{ backgroundColor: primaryBg, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 11, color: primaryFg }}>{primaryLabel}</Text>
      </View>
      <View style={{ backgroundColor: '#F4F3FB', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 }}>
        <Text style={{ fontFamily: f.body600, fontSize: 11, color: '#6F6E86' }}>···</Text>
      </View>
    </View>
  );
}

/* Standard (non-expanded) table row. */
function Row({
  last,
  name,
  email,
  avatarBg,
  avatarFill,
  plan,
  planBg,
  planFg,
  status,
  joined,
  lastActive,
  actions,
}: {
  last?: boolean;
  name: string;
  email: string;
  avatarBg: string;
  avatarFill: string;
  plan: string;
  planBg?: string;
  planFg?: string;
  status: React.ReactNode;
  joined: string;
  lastActive: string;
  actions: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(51,50,74,0.04)',
      }}
    >
      <UserCell name={name} email={email} avatarBg={avatarBg} avatarFill={avatarFill} />
      <PlanCell label={plan} bg={planBg} fg={planFg} />
      {status}
      <DateCell>{joined}</DateCell>
      <DateCell>{lastActive}</DateCell>
      {actions}
    </View>
  );
}

/* ── Expanded-detail column ──────────────────────────────────────────── */
function DetailColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: f.body700,
          fontSize: 10,
          color: '#9C9AB2',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function DetailText({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 18, color: muted ? '#9C9AB2' : '#33324A' }}>
      {children}
    </Text>
  );
}

/* ── Faceless avatar glyph (matches the HTML inline SVG) ─────────────── */
function Avatar({ fill }: { fill: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20">
      <Circle cx="10" cy="7.5" r="5" fill={fill} />
      <Path d="M2 19Q2 13 10 13Q18 13 18 19Z" fill={fill} />
    </Svg>
  );
}

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
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BillingIcon({ color: col }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" fill="none" stroke={col} strokeWidth={2} />
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

const tableShadow = {
  shadowColor: '#33324A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;
