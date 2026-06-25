import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* ────────────────────────────────────────────────────────────────────────
 * D4 · Subscription & Billing Control — Everly Operator Admin (1440 desktop).
 * Pixel-faithful to Everly Admin.dc.html lines 520–605.
 * Rendered inside the 1440-wide frame by the caller; no StatusBar.
 * ──────────────────────────────────────────────────────────────────────── */
export default function D4Billing() {
  return (
    <View style={{ width: 1440, flexDirection: 'row', backgroundColor: '#F8F7FF' }}>
      <Sidebar />
      <MainCanvas />
    </View>
  );
}

/* ── Sidebar (Billing active) ────────────────────────────────────────── */
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
        <NavItem active label="Billing" icon={<BillingIcon color="#6B6FC9" />} />
        <NavItem label="Config & Flags" icon={<EditIcon color="#9C9AB2" />} />
        <NavItem label="Audit Log" icon={<FileIcon color="#9C9AB2" />} />
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
    <View style={{ flex: 1, paddingVertical: 28, paddingHorizontal: 32, overflow: 'hidden' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#33324A' }}>Billing Control</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 5 }}>
            Stripe-reconciled · Synced just now
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
          <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#3FA98A' }}>Stripe connected</Text>
        </View>
      </View>

      {/* Billing health cards */}
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 22 }}>
        <HealthCard label="Dunning queue" value="47" valueColor="#D46E97" note="Failed payments" />
        <HealthCard label="At risk MRR" value="€187" valueColor="#33324A" note="0.8% of MRR" />
        <HealthCard label="Refunds · June" value="3" valueColor="#33324A" note="€31.97 total" />
        <HealthCard label="Recovery rate" value="68%" valueColor="#3FA98A" note="Dunning recovered" />
      </View>

      {/* Dunning queue */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>Dunning Queue</Text>
        <View
          style={{
            backgroundColor: '#FBE0EA',
            borderRadius: 999,
            paddingVertical: 3,
            paddingHorizontal: 9,
            marginLeft: 8,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#D46E97' }}>47 need action</Text>
        </View>
      </View>

      <View
        style={[
          { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
          cardShadow,
        ]}
      >
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
          <HeaderCell flex={1}>Plan</HeaderCell>
          <HeaderCell flex={1}>Amount</HeaderCell>
          <HeaderCell flex={1.2}>Failed</HeaderCell>
          <HeaderCell flex={1}>Attempt</HeaderCell>
          <HeaderCell flex={1.6}>Actions</HeaderCell>
        </View>

        {dunningRows.map((r, i) => (
          <DunningRow key={i} row={r} last={i === dunningRows.length - 1} />
        ))}
      </View>

      {/* Recent transactions */}
      <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 12 }}>Recent Transactions</Text>
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
          <HeaderCell flex={2}>User</HeaderCell>
          <HeaderCell flex={1}>Amount</HeaderCell>
          <HeaderCell flex={1.2}>Type</HeaderCell>
          <HeaderCell flex={1.2}>Date</HeaderCell>
          <HeaderCell flex={1.5}>Stripe ID</HeaderCell>
          <HeaderCell flex={1}>Status</HeaderCell>
        </View>

        {txnRows.map((r, i) => (
          <TxnRow key={i} row={r} last={i === txnRows.length - 1} />
        ))}
      </View>
    </View>
  );
}

/* ── Health card ─────────────────────────────────────────────────────── */
function HealthCard({ label, value, valueColor, note }: { label: string; value: string; valueColor: string; note: string }) {
  return (
    <View style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18 }, cardShadow]}>
      <Text
        style={{
          fontFamily: f.body400,
          fontSize: 10,
          color: '#9C9AB2',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: f.display700, fontSize: 28, color: valueColor, marginBottom: 6 }}>{value}</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>{note}</Text>
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

/* ── Dunning rows ────────────────────────────────────────────────────── */
type Dunning = {
  name: string;
  email: string;
  plan: string;
  amount: string;
  failed: string;
  attempt: string;
  attemptBg: string;
  attemptFg: string;
};

const dunningRows: Dunning[] = [
  {
    name: "James O'Brien",
    email: 'james@outlook.com',
    plan: 'Pro',
    amount: '€3.99',
    failed: 'Jun 20 · Card declined',
    attempt: '2 / 3',
    attemptBg: '#FBF1CE',
    attemptFg: '#C9A33B',
  },
  {
    name: 'Thomas Weber',
    email: 't.weber@gmail.com',
    plan: 'Family',
    amount: '€4.99',
    failed: 'Jun 23 · Insufficient funds',
    attempt: '1 / 3',
    attemptBg: '#FBE0EA',
    attemptFg: '#D46E97',
  },
  {
    name: 'Chloe Martin',
    email: 'chloe@icloud.com',
    plan: 'Pro',
    amount: '€3.99',
    failed: 'Jun 23 · Expired card',
    attempt: '1 / 3',
    attemptBg: '#FBE0EA',
    attemptFg: '#D46E97',
  },
];

function DunningRow({ row, last }: { row: Dunning; last: boolean }) {
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
        <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#33324A' }}>{row.name}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginTop: 2 }}>{row.email}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: '#E7E4FB', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>{row.plan}</Text>
        </View>
      </View>
      <Text style={{ flex: 1, fontFamily: f.body700, fontSize: 13, color: '#33324A' }}>{row.amount}</Text>
      <Text style={{ flex: 1.2, fontFamily: f.body400, fontSize: 12, color: '#D46E97' }}>{row.failed}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: row.attemptBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: row.attemptFg }}>{row.attempt}</Text>
        </View>
      </View>
      <View style={{ flex: 1.6, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <View style={{ backgroundColor: '#6B6FC9', borderRadius: 7, paddingVertical: 5, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#fff' }}>Retry</Text>
        </View>
        <View style={{ backgroundColor: '#F4F3FB', borderRadius: 7, paddingVertical: 5, paddingHorizontal: 10 }}>
          <Text style={{ fontFamily: f.body600, fontSize: 11, color: '#6F6E86' }}>Contact</Text>
        </View>
        <View style={{ paddingVertical: 5, paddingHorizontal: 4 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#E98FB3' }}>Cancel</Text>
        </View>
      </View>
    </View>
  );
}

/* ── Transaction rows ────────────────────────────────────────────────── */
type Txn = {
  user: string;
  amount: string;
  amountColor: string;
  type: string;
  typeBg: string;
  typeFg: string;
  date: string;
  stripe: string;
  status: string;
  statusBg: string;
  statusFg: string;
};

const txnRows: Txn[] = [
  {
    user: 'Anna Müller',
    amount: '€4.99',
    amountColor: '#33324A',
    type: 'Renewal',
    typeBg: '#D8F0E6',
    typeFg: '#3FA98A',
    date: 'Jun 23',
    stripe: 'ch_3P8...',
    status: 'Paid',
    statusBg: '#D8F0E6',
    statusFg: '#3FA98A',
  },
  {
    user: 'New user_31204',
    amount: '€4.99',
    amountColor: '#33324A',
    type: 'New sub',
    typeBg: '#E7E4FB',
    typeFg: '#6B6FC9',
    date: 'Jun 23',
    stripe: 'ch_3P9...',
    status: 'Paid',
    statusBg: '#D8F0E6',
    statusFg: '#3FA98A',
  },
  {
    user: 'User_28901',
    amount: '-€3.99',
    amountColor: '#E98FB3',
    type: 'Refund',
    typeBg: '#FBE0EA',
    typeFg: '#D46E97',
    date: 'Jun 22',
    stripe: 're_3N1...',
    status: 'Refunded',
    statusBg: '#FBE0EA',
    statusFg: '#D46E97',
  },
  {
    user: 'User_31108',
    amount: '€149.99',
    amountColor: '#33324A',
    type: 'Lifetime',
    typeBg: '#FBF1CE',
    typeFg: '#C9A33B',
    date: 'Jun 22',
    stripe: 'ch_3P7...',
    status: 'Paid',
    statusBg: '#D8F0E6',
    statusFg: '#3FA98A',
  },
];

function TxnRow({ row, last }: { row: Txn; last: boolean }) {
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
      <Text style={{ flex: 2, fontFamily: f.body700, fontSize: 13, color: '#33324A' }}>{row.user}</Text>
      <Text style={{ flex: 1, fontFamily: f.body700, fontSize: 13, color: row.amountColor }}>{row.amount}</Text>
      <View style={{ flex: 1.2 }}>
        <View style={{ backgroundColor: row.typeBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: row.typeFg }}>{row.type}</Text>
        </View>
      </View>
      <Text style={{ flex: 1.2, fontFamily: f.body400, fontSize: 12, color: '#6F6E86' }}>{row.date}</Text>
      <Text style={{ flex: 1.5, fontFamily: 'monospace', fontSize: 11, color: '#9C9AB2' }}>{row.stripe}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: row.statusBg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' }}>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: row.statusFg }}>{row.status}</Text>
        </View>
      </View>
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
