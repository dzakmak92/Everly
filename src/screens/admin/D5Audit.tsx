import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* ────────────────────────────────────────────────────────────────────────
 * D5 · Audit Log & RBAC — Everly Operator Admin (1440 desktop console).
 * Pixel-faithful to Everly Admin.dc.html lines 613–742.
 * Rendered inside the 1440-wide frame by the caller; no StatusBar.
 * ──────────────────────────────────────────────────────────────────────── */
export default function D5Audit() {
  return (
    <View style={{ width: 1440, flexDirection: 'row', backgroundColor: '#F8F7FF' }}>
      <Sidebar />
      <MainCanvas />
    </View>
  );
}

/* ── Sidebar (Audit Log active) ──────────────────────────────────────── */
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

      <View style={{ paddingVertical: 16, paddingHorizontal: 12, flex: 1, gap: 2 }}>
        <NavItem label="Dashboard" icon={<ActivityIcon color="#9C9AB2" />} />
        <NavItem label="Users" icon={<UsersIcon color="#9C9AB2" />} />
        <NavItem label="Billing" icon={<BillingIcon color="#9C9AB2" />} />
        <NavItem label="Config & Flags" icon={<EditIcon color="#9C9AB2" />} />
        <NavItem active label="Audit Log" icon={<FileIcon color="#6B6FC9" />} />
      </View>

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
    <View style={{ flex: 1, paddingVertical: 28, paddingHorizontal: 32, overflow: 'hidden', gap: 22 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#33324A' }}>Audit Log & RBAC</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 5 }}>
            Append-only · Immutable · All admin actions logged
          </Text>
        </View>
        <View
          style={{
            backgroundColor: '#FBF1CE',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              fill="none"
              stroke="#C9A33B"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#C9A33B' }}>Tamper-proof store</Text>
        </View>
      </View>

      {/* Admin accounts + RBAC */}
      <View>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 12 }}>Admin Accounts & Roles</Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, cardShadow]}>
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
            <HeaderCell flex={2}>Admin</HeaderCell>
            <HeaderCell flex={1.2}>Role</HeaderCell>
            <HeaderCell flex={1}>2FA</HeaderCell>
            <HeaderCell flex={1}>Last login</HeaderCell>
            <HeaderCell flex={1.2}>Permissions</HeaderCell>
            <HeaderCell flex={1.2}>Actions</HeaderCell>
          </View>

          {adminRows.map((r, i) => (
            <AdminRow key={i} row={r} last={i === adminRows.length - 1} />
          ))}
        </View>
      </View>

      {/* Audit log */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>Audit Log</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginLeft: 8 }}>
            Showing latest 50 · Export available
          </Text>
        </View>
        <View style={[{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, cardShadow]}>
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
            <HeaderCell flex={1.4}>Timestamp</HeaderCell>
            <HeaderCell flex={1.4}>Admin</HeaderCell>
            <HeaderCell flex={2}>Action</HeaderCell>
            <HeaderCell flex={2}>Target</HeaderCell>
            <HeaderCell flex={1}>IP</HeaderCell>
          </View>

          {auditRows.map((r, i) => (
            <AuditRow key={i} row={r} last={i === auditRows.length - 1} />
          ))}
        </View>
      </View>
    </View>
  );
}

/* ── Table header cell ───────────────────────────────────────────────── */
function HeaderCell({ flex, children }: { flex: number; children: string }) {
  return (
    <Text
      style={{
        flex,
        fontFamily: f.body700,
        fontSize: 10,
        color: '#9C9AB2',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

/* ── Admin accounts rows ─────────────────────────────────────────────── */
type Admin = {
  email: string;
  sub: string;
  role: string;
  roleBg: string;
  roleFg: string;
  twoFa: string;
  twoFaBg: string;
  twoFaFg: string;
  lastLogin: string;
  permissions: string;
  action: { label: string; bg: string; fg: string; weight: 'b700' | 'b600' } | null;
};

const adminRows: Admin[] = [
  {
    email: 'admin@everly.app',
    sub: 'You · Active now',
    role: 'Superadmin',
    roleBg: '#6B6FC9',
    roleFg: '#fff',
    twoFa: '✓ On',
    twoFaBg: '#D8F0E6',
    twoFaFg: '#3FA98A',
    lastLogin: 'Just now',
    permissions: 'Full access',
    action: null,
  },
  {
    email: 'support@everly.app',
    sub: 'Last: Jun 22 16:00',
    role: 'Support',
    roleBg: '#D8F0E6',
    roleFg: '#3FA98A',
    twoFa: '✓ On',
    twoFaBg: '#D8F0E6',
    twoFaFg: '#3FA98A',
    lastLogin: 'Jun 22',
    permissions: 'Read + trial mgmt',
    action: { label: 'Edit', bg: '#F4F3FB', fg: '#6F6E86', weight: 'b600' },
  },
  {
    email: 'billing@everly.app',
    sub: 'Last: Jun 20 11:22',
    role: 'Billing',
    roleBg: '#FBF1CE',
    roleFg: '#C9A33B',
    twoFa: '⚠ Off',
    twoFaBg: '#FBE0EA',
    twoFaFg: '#D46E97',
    lastLogin: 'Jun 20',
    permissions: 'Billing only',
    action: { label: 'Enforce 2FA', bg: '#FBE0EA', fg: '#D46E97', weight: 'b700' },
  },
];

function AdminRow({ row, last }: { row: Admin; last: boolean }) {
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
      <View style={{ flex: 2 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#33324A' }}>{row.email}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginTop: 2 }}>{row.sub}</Text>
      </View>
      <View style={{ flex: 1.2 }}>
        <View style={{ backgroundColor: row.roleBg, borderRadius: 5, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: row.roleFg }}>{row.role}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: row.twoFaBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: row.twoFaFg }}>{row.twoFa}</Text>
        </View>
      </View>
      <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 12, color: '#6F6E86' }}>{row.lastLogin}</Text>
      <Text style={{ flex: 1.2, fontFamily: f.body400, fontSize: 12, color: '#6F6E86' }}>{row.permissions}</Text>
      <View style={{ flex: 1.2, flexDirection: 'row', gap: 5 }}>
        {row.action ? (
          <View style={{ backgroundColor: row.action.bg, borderRadius: 7, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start' }}>
            <Text style={{ fontFamily: row.action.weight === 'b700' ? f.body700 : f.body600, fontSize: 11, color: row.action.fg }}>
              {row.action.label}
            </Text>
          </View>
        ) : (
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>—</Text>
        )}
      </View>
    </View>
  );
}

/* ── Audit log rows ──────────────────────────────────────────────────── */
type Audit = {
  ts: string;
  admin: string;
  tag: string;
  tagBg: string;
  tagFg: string;
  action: string;
  target: string;
  ip: string;
};

const auditRows: Audit[] = [
  {
    ts: '2026-06-23 09:41:22',
    admin: 'admin@everly.app',
    tag: 'User',
    tagBg: '#E7E4FB',
    tagFg: '#6B6FC9',
    action: 'Trial extended +5 days',
    target: 'user_31204 (sarah@icloud.com)',
    ip: '192.168.1.1',
  },
  {
    ts: '2026-06-23 09:14:05',
    admin: 'admin@everly.app',
    tag: 'Config',
    tagBg: '#FBF1CE',
    tagFg: '#C9A33B',
    action: 'Feature flag rollout updated',
    target: 'snap_cloud_parse → 75%',
    ip: '192.168.1.1',
  },
  {
    ts: '2026-06-22 16:44:18',
    admin: 'admin@everly.app',
    tag: 'Billing',
    tagBg: '#D8F0E6',
    tagFg: '#3FA98A',
    action: 'Refund issued',
    target: 'user_28901 · €3.99 · ch_3N1...',
    ip: '192.168.1.1',
  },
  {
    ts: '2026-06-22 15:01:44',
    admin: 'support@everly.app',
    tag: 'User',
    tagBg: '#E7E4FB',
    tagFg: '#6B6FC9',
    action: 'Plan changed Pro → Free',
    target: 'user_28901 (cancelled)',
    ip: '10.0.0.1',
  },
  {
    ts: '2026-06-22 14:22:09',
    admin: 'admin@everly.app',
    tag: 'Config',
    tagBg: '#FBF1CE',
    tagFg: '#C9A33B',
    action: 'Config value updated',
    target: 'trial_length_days: 7 → 10',
    ip: '192.168.1.1',
  },
  {
    ts: '2026-06-21 10:05:30',
    admin: 'admin@everly.app',
    tag: 'GDPR',
    tagBg: '#FBE0EA',
    tagFg: '#D46E97',
    action: 'Account + billing erased',
    target: 'user_29001 · erasure complete',
    ip: '192.168.1.1',
  },
];

function AuditRow({ row, last }: { row: Audit; last: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 11,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(51,50,74,0.04)',
      }}
    >
      <Text style={{ flex: 1.4, fontFamily: 'monospace', fontSize: 11, color: '#6F6E86' }}>{row.ts}</Text>
      <Text style={{ flex: 1.4, fontFamily: f.body600, fontSize: 12, color: '#33324A' }}>{row.admin}</Text>
      <View style={{ flex: 2, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <View style={{ backgroundColor: row.tagBg, borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: row.tagFg }}>{row.tag}</Text>
        </View>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#33324A', flexShrink: 1 }}>{row.action}</Text>
      </View>
      <Text style={{ flex: 2, fontFamily: f.body400, fontSize: 12, color: '#6F6E86' }}>{row.target}</Text>
      <Text style={{ flex: 1, fontFamily: 'monospace', fontSize: 11, color: '#9C9AB2' }}>{row.ip}</Text>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#33324A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

/* ── Sidebar nav icons (inline, matching the HTML SVGs) ──────────────── */
function ActivityIcon({ color: col }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
      <Rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke={col} strokeWidth={2} />
      <Line x1="2" y1="10" x2="22" y2="10" stroke={col} strokeWidth={2} strokeLinecap="round" />
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
      <Polyline points="14 2 14 8 20 8" fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
