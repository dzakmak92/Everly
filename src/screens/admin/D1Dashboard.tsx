import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { color, font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* ────────────────────────────────────────────────────────────────────────
 * D1 · Revenue Dashboard — Everly Operator Admin (1440 desktop console).
 * Pixel-faithful to Everly Admin.dc.html lines 30–248.
 * Rendered inside the 1440-wide frame by the caller; no StatusBar.
 * ──────────────────────────────────────────────────────────────────────── */
export default function D1Dashboard() {
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
        <NavItem active label="Dashboard" icon={<ActivityIcon color="#6B6FC9" />} />
        <NavItem label="Users" icon={<UsersIcon color="#9C9AB2" />} />
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
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: '#33324A' }}>Revenue Dashboard</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 5 }}>
            June 2026 · Updated just now
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: 'rgba(51,50,74,0.08)',
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="none" stroke="#6F6E86" strokeWidth={2} />
              <Path d="M16 2v4M8 2v4M3 10h18" fill="none" stroke="#6F6E86" strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={{ fontFamily: f.body600, fontSize: 13, color: '#6F6E86' }}>Last 30 days</Text>
          </View>
          <View
            style={{
              backgroundColor: '#6B6FC9',
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 16,
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff' }}>Export</Text>
          </View>
        </View>
      </View>

      {/* KPI strip */}
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 24 }}>
        <KpiCard
          label="MRR"
          value="€23.8k"
          deltaColor="#3FA98A"
          up
          delta="+12.4%"
          deltaNote="vs May"
          spark={<Spark stroke="#6B6FC9" fillColor="rgba(107,111,201,.08)" d="M0 22 L20 18 L40 20 L60 14 L80 10 L100 8 L120 4" area />}
        />
        <KpiCard
          label="Active Subs"
          value="5,924"
          deltaColor="#3FA98A"
          up
          delta="+284"
          deltaNote="this month"
          spark={<Spark stroke="#3FA98A" fillColor="rgba(63,169,138,.08)" d="M0 24 L20 20 L40 22 L60 16 L80 12 L100 9 L120 5" area />}
        />
        <KpiCard
          label="Trial → Paid"
          value="38.2%"
          deltaColor="#3FA98A"
          up
          delta="+2.1pp"
          deltaNote="vs May"
          spark={<Spark stroke="#E9C46A" fillColor="rgba(233,196,106,.08)" d="M0 20 L20 22 L40 18 L60 16 L80 14 L100 11 L120 8" area />}
        />
        <KpiCard
          label="Churn Rate"
          value="2.8%"
          deltaColor="#3FA98A"
          up={false}
          delta="-0.4pp"
          deltaNote="improving"
          spark={<Spark stroke="#E98FB3" fillColor="rgba(233,143,179,.08)" d="M0 10 L20 12 L40 14 L60 18 L80 20 L100 22 L120 24" area />}
        />
        <KpiCard
          label="Dunning"
          value="47"
          warning
          spark={<Spark stroke="#E98FB3" d="M0 20 L20 18 L40 22 L60 16 L80 12 L100 15 L120 18" />}
        />
      </View>

      {/* Charts row */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
        <View style={{ flex: 1.8 }}>
          <Waterfall />
        </View>
        <View style={{ flex: 1 }}>
          <TrialFunnel />
        </View>
        <View style={{ flex: 1 }}>
          <PlanMix />
        </View>
      </View>

      {/* Cohort retention heatmap + live feed row */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1 }}>
          <CohortHeatmap />
        </View>
        <View style={{ width: 320 }}>
          <LiveOps />
        </View>
      </View>
    </View>
  );
}

/* ── KPI card ────────────────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  delta,
  deltaNote,
  deltaColor,
  up,
  warning,
  spark,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaNote?: string;
  deltaColor?: string;
  up?: boolean;
  warning?: boolean;
  spark: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 18,
        },
        kpiShadow,
        warning ? { borderWidth: 1.5, borderColor: 'rgba(233,143,179,0.35)' } : null,
      ]}
    >
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
      <Text style={{ fontFamily: f.display700, fontSize: 28, color: '#33324A', marginBottom: 8 }}>{value}</Text>

      {warning ? (
        <View
          style={{
            backgroundColor: '#FBE0EA',
            borderRadius: 999,
            paddingVertical: 4,
            paddingHorizontal: 10,
            alignSelf: 'flex-start',
            marginBottom: 10,
          }}
        >
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#D46E97' }}>⚠ Action needed</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path
              d={up ? 'M5 12l7-7 7 7' : 'M19 12l-7 7-7-7'}
              fill="none"
              stroke={deltaColor}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: deltaColor }}>{delta}</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2' }}>{deltaNote}</Text>
        </View>
      )}

      {spark}
    </View>
  );
}

/* Sparkline — fixed 120×28 viewBox, stretched to full card width. */
function Spark({ stroke, fillColor, d, area }: { stroke: string; fillColor?: string; d: string; area?: boolean }) {
  return (
    <Svg width="100%" height={28} viewBox="0 0 120 28" preserveAspectRatio="none">
      {area && fillColor && <Path d={`${d} L120 28 L0 28Z`} fill={fillColor} />}
      <Path d={d} stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

const kpiShadow = {
  shadowColor: '#33324A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

/* White chart card wrapper. */
function ChartCard({ children }: { children: React.ReactNode }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }, kpiShadow]}>{children}</View>;
}

function ChartHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2' }}>{sub}</Text>
    </>
  );
}

/* ── MRR Waterfall ───────────────────────────────────────────────────── */
function Waterfall() {
  return (
    <ChartCard>
      <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 4 }}>MRR Movement</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginBottom: 18 }}>May → June waterfall</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120, paddingHorizontal: 4 }}>
        <WaterfallBar amount="€21.2k" amountColor="#9C9AB2" amountWeight="600" label="Start" solid barColor="#E7E4FB" barHeight={90} />
        <WaterfallBar amount="+€4.1k" amountColor="#3FA98A" amountWeight="600" label="New" floatColor="#D8F0E6" floatHeight={42} />
        <WaterfallBar amount="+€1.2k" amountColor="#3FA98A" amountWeight="600" label="Expansion" floatColor="#D8F0E6" floatHeight={18} />
        <WaterfallBar amount="-€2.7k" amountColor="#E98FB3" amountWeight="600" label="Churned" floatColor="#FBE0EA" floatHeight={28} />
        <WaterfallBar amount="€23.8k" amountColor="#6B6FC9" amountWeight="700" label="End" solid barColor="#6B6FC9" barHeight={100} />
      </View>
    </ChartCard>
  );
}

function WaterfallBar({
  amount,
  amountColor,
  amountWeight,
  label,
  solid,
  barColor,
  barHeight,
  floatColor,
  floatHeight,
}: {
  amount: string;
  amountColor: string;
  amountWeight: '600' | '700';
  label: string;
  solid?: boolean;
  barColor?: string;
  barHeight?: number;
  floatColor?: string;
  floatHeight?: number;
}) {
  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <Text style={{ fontFamily: amountWeight === '700' ? f.body700 : f.body600, fontSize: 10, color: amountColor }}>
        {amount}
      </Text>
      {solid ? (
        <View style={{ width: '100%', backgroundColor: barColor, borderTopLeftRadius: 6, borderTopRightRadius: 6, height: barHeight }} />
      ) : (
        <View style={{ width: '100%', justifyContent: 'flex-end', height: 90 }}>
          <View
            style={{
              width: '100%',
              backgroundColor: floatColor,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              height: floatHeight,
            }}
          />
        </View>
      )}
      <Text style={{ fontFamily: f.body400, fontSize: 9, color: '#9C9AB2', textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

/* ── Trial → Paid funnel ─────────────────────────────────────────────── */
function TrialFunnel() {
  return (
    <ChartCard>
      <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 4 }}>Trial Funnel</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginBottom: 16 }}>Last 30 days</Text>
      <View style={{ gap: 8 }}>
        <FunnelRow label="Trials started" value="812" valueColor="#6B6FC9" pct={100} barColor="#6B6FC9" />
        <FunnelRow label="Onboarded" value="641 (79%)" valueColor="#6B6FC9" pct={79} barColor="#8B8FD9" />
        <FunnelRow label="Day 5 active" value="489 (60%)" valueColor="#6B6FC9" pct={60} barColor="#A8ABE8" />
        <FunnelRow label="Converted" value="310 (38%)" valueColor="#3FA98A" pct={38} barColor="#3FA98A" />
      </View>
    </ChartCard>
  );
}

function FunnelRow({
  label,
  value,
  valueColor,
  pct,
  barColor,
}: {
  label: string;
  value: string;
  valueColor: string;
  pct: number;
  barColor: string;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontFamily: f.body600, fontSize: 11, color: '#33324A' }}>{label}</Text>
        <Text style={{ fontFamily: f.body700, fontSize: 11, color: valueColor }}>{value}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#F4F3FB', borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: 999 }} />
      </View>
    </View>
  );
}

/* ── Plan Mix donut ──────────────────────────────────────────────────── */
function PlanMix() {
  return (
    <ChartCard>
      <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 4 }}>Plan Mix</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginBottom: 14 }}>Active subscribers</Text>

      {/* Donut: conic-gradient #6B6FC9 0-42%, #3FA98A 42-67%, #E9C46A 67-82%, #D8D6F0 82-100% */}
      <View style={{ width: 120, height: 120, alignSelf: 'center', marginBottom: 16 }}>
        <Donut />
        <View
          style={{
            position: 'absolute',
            top: 22,
            left: 22,
            right: 22,
            bottom: 22,
            backgroundColor: '#fff',
            borderRadius: 38,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: f.display700, fontSize: 16, color: '#33324A' }}>5.9k</Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <LegendRow swatch="#6B6FC9" name="Pro" value="42% · 2,488" />
        <LegendRow swatch="#3FA98A" name="Family" value="25% · 1,481" />
        <LegendRow swatch="#E9C46A" name="Lifetime" value="15% · 889" />
        <LegendRow swatch="#D8D6F0" name="Free" value="18% · 1,066" />
      </View>
    </ChartCard>
  );
}

/* SVG donut replicating the conic-gradient segments via stroked arcs. */
function Donut() {
  const cx = 60;
  const cy = 60;
  const r = 47.5; // mid-radius (outer 60, inner 38 → ring width 22, mid ~49; tuned to 47.5)
  const stroke = 25;
  const segs: { color: string; from: number; to: number }[] = [
    { color: '#6B6FC9', from: 0, to: 0.42 },
    { color: '#3FA98A', from: 0.42, to: 0.67 },
    { color: '#E9C46A', from: 0.67, to: 0.82 },
    { color: '#D8D6F0', from: 0.82, to: 1 },
  ];
  const pt = (t: number) => {
    const a = t * 2 * Math.PI - Math.PI / 2; // start at top, clockwise
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      {segs.map((s, i) => {
        const [x0, y0] = pt(s.from);
        const [x1, y1] = pt(s.to);
        const large = s.to - s.from > 0.5 ? 1 : 0;
        return (
          <Path
            key={i}
            d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`}
            stroke={s.color}
            strokeWidth={stroke}
            fill="none"
          />
        );
      })}
    </Svg>
  );
}

function LegendRow({ swatch, name, value }: { swatch: string; name: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <View style={{ width: 8, height: 8, backgroundColor: swatch, borderRadius: 2 }} />
        <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#6F6E86' }}>{name}</Text>
      </View>
      <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#33324A' }}>{value}</Text>
    </View>
  );
}

/* ── Cohort retention heatmap ────────────────────────────────────────── */
type Cell = { v: string; bg: string; fg: string; weight: '600' | '700' };
const muffin = (v: string): Cell => ({ v, bg: '#F4F3FB', fg: '#9C9AB2', weight: '600' });

const cohortRows: { label: string; cells: Cell[] }[] = [
  {
    label: "Jan '26",
    cells: [
      { v: '100%', bg: '#6B6FC9', fg: '#fff', weight: '700' },
      { v: '72%', bg: '#7E82D1', fg: '#fff', weight: '700' },
      { v: '61%', bg: '#9599D9', fg: '#fff', weight: '700' },
      { v: '55%', bg: '#AAADE0', fg: '#54579E', weight: '700' },
      { v: '51%', bg: '#BFC1E8', fg: '#54579E', weight: '700' },
      { v: '48%', bg: '#D2D3EF', fg: '#54579E', weight: '700' },
    ],
  },
  {
    label: "Feb '26",
    cells: [
      { v: '100%', bg: '#6B6FC9', fg: '#fff', weight: '700' },
      { v: '74%', bg: '#7E82D1', fg: '#fff', weight: '700' },
      { v: '63%', bg: '#9599D9', fg: '#fff', weight: '700' },
      { v: '57%', bg: '#AAADE0', fg: '#54579E', weight: '700' },
      { v: '53%', bg: '#BFC1E8', fg: '#54579E', weight: '700' },
      muffin('—'),
    ],
  },
  {
    label: "Mar '26",
    cells: [
      { v: '100%', bg: '#6B6FC9', fg: '#fff', weight: '700' },
      { v: '76%', bg: '#7A7FCF', fg: '#fff', weight: '700' },
      { v: '65%', bg: '#9599D9', fg: '#fff', weight: '700' },
      { v: '59%', bg: '#AAADE0', fg: '#54579E', weight: '700' },
      muffin('—'),
      muffin('—'),
    ],
  },
  {
    label: "Apr '26",
    cells: [
      { v: '100%', bg: '#6B6FC9', fg: '#fff', weight: '700' },
      { v: '78%', bg: '#7A7FCF', fg: '#fff', weight: '700' },
      { v: '67%', bg: '#9599D9', fg: '#fff', weight: '700' },
      muffin('—'),
      muffin('—'),
      muffin('—'),
    ],
  },
  {
    label: "May '26",
    cells: [
      { v: '100%', bg: '#6B6FC9', fg: '#fff', weight: '700' },
      { v: '81%', bg: '#7A7FCF', fg: '#fff', weight: '700' },
      muffin('—'),
      muffin('—'),
      muffin('—'),
      muffin('—'),
    ],
  },
];

const cohortHeaders = ['M+0', 'M+1', 'M+2', 'M+3', 'M+4', 'M+5'];

function CohortHeatmap() {
  return (
    <ChartCard>
      <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A', marginBottom: 4 }}>Cohort Retention</Text>
      <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginBottom: 16 }}>
        % retained by month since signup · darker = higher retention
      </Text>

      {/* header row */}
      <View style={{ flexDirection: 'row', gap: 3, marginBottom: 3 }}>
        <View style={{ width: 80, paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#9C9AB2', textAlign: 'right' }}>Cohort</Text>
        </View>
        {cohortHeaders.map((h) => (
          <View key={h} style={{ flex: 1, paddingVertical: 6 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#9C9AB2', textAlign: 'center' }}>{h}</Text>
          </View>
        ))}
      </View>

      {/* data rows */}
      {cohortRows.map((row) => (
        <View key={row.label} style={{ flexDirection: 'row', gap: 3, marginBottom: 3 }}>
          <View style={{ width: 80, paddingVertical: 6, paddingHorizontal: 4, justifyContent: 'center' }}>
            <Text style={{ fontFamily: f.body600, fontSize: 10, color: '#9C9AB2', textAlign: 'right' }}>{row.label}</Text>
          </View>
          {row.cells.map((cell, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: cell.bg,
                borderRadius: 5,
                paddingVertical: 8,
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: cell.weight === '700' ? f.body700 : f.body600,
                  fontSize: 11,
                  color: cell.fg,
                  textAlign: 'center',
                }}
              >
                {cell.v}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ChartCard>
  );
}

/* ── Live Ops feed ───────────────────────────────────────────────────── */
type FeedItem = { title: string; titleColor: string; time: string; timeColor: string; bg: string; body: string };

const feedItems: FeedItem[] = [
  { title: 'Failed payment', titleColor: '#D46E97', time: '2m ago', timeColor: '#D46E97', bg: '#FBE0EA', body: 'user_29841 · Pro · €3.99' },
  { title: 'New subscriber', titleColor: '#3FA98A', time: '5m ago', timeColor: '#3FA98A', bg: '#D8F0E6', body: 'user_31204 · Family · €4.99' },
  { title: 'Trial started', titleColor: '#6F6E86', time: '8m ago', timeColor: '#9C9AB2', bg: '#F4F3FB', body: 'user_31203 · 10-day trial' },
  { title: 'Cancelled', titleColor: '#D46E97', time: '12m ago', timeColor: '#D46E97', bg: '#FBE0EA', body: 'user_28901 · Pro · "too expensive"' },
  { title: 'Upgraded', titleColor: '#3FA98A', time: '18m ago', timeColor: '#3FA98A', bg: '#D8F0E6', body: 'user_27441 · Pro → Family' },
  { title: 'Lifetime purchase', titleColor: '#C9A33B', time: '22m ago', timeColor: '#C9A33B', bg: '#FBF1CE', body: 'user_31198 · €149.99' },
];

function LiveOps() {
  return (
    <ChartCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>Live Ops</Text>
        <View
          style={{
            width: 8,
            height: 8,
            backgroundColor: '#3FA98A',
            borderRadius: 4,
            shadowColor: '#3FA98A',
            shadowOpacity: 0.2,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 0 },
            // ring approximation
            borderWidth: 3,
            borderColor: 'rgba(63,169,138,0.2)',
          }}
        />
      </View>
      <View style={{ gap: 10 }}>
        {feedItems.map((item, i) => (
          <View key={i} style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: item.bg, borderRadius: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: item.titleColor }}>{item.title}</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 9, color: item.timeColor }}>{item.time}</Text>
            </View>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#33324A' }}>{item.body}</Text>
          </View>
        ))}
      </View>
    </ChartCard>
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
