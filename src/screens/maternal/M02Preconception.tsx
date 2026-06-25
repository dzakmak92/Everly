import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* M02 · Preconception / TTC — private cycle tracking + preconception checklist. */
export default function M02Preconception() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Trying to Conceive</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 13, color: '#9C9AB2', marginTop: 4 }}>
            Cycle 3 · Fully private · On-device only
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#D4EDE7', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#2C8475' }}>Free forever</Text>
          </View>
          <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>🔒 Private</Text>
          </View>
        </View>
      </View>

      {/* cycle calendar */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 14,
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 18,
          },
          shadow.card,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 14, color: c.ink }}>June 2026</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2' }}>Cycle day 14</Text>
        </View>

        <CycleGrid />

        {/* legend */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
          <LegendItem swatch={<View style={{ width: 10, height: 10, backgroundColor: '#FBE0EA', borderRadius: 5 }} />} label="Period" />
          <LegendItem swatch={<View style={{ width: 10, height: 10, backgroundColor: '#E0F4EF', borderRadius: 3 }} />} label="Fertile window" />
          <LegendItem swatch={<View style={{ width: 10, height: 10, backgroundColor: '#3A9B8A', borderRadius: 5 }} />} label="Ovulation" />
        </View>
      </View>

      {/* ovulation prediction */}
      <LinearGradient
        colors={['#E0F4EF', '#D4F0E4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          borderRadius: 18,
          paddingVertical: 16,
          paddingHorizontal: 18,
          flexDirection: 'row',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: '#3A9B8A',
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
            <Path d="M12 2c5.5 0 10 4.5 10 10S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2z" />
            <Path d="M12 6v6l4 2" stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#1E5C50', marginBottom: 4 }}>
            Today is your peak fertile day
          </Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#4A8A7A', lineHeight: 17 }}>
            LH surge detected · Ovulation likely in 12–36h. Your best window.
          </Text>
        </View>
      </LinearGradient>

      {/* preconception checklist */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: '#9C9AB2',
            marginBottom: 8,
            paddingLeft: 4,
          }}
        >
          Preconception checklist
        </Text>
        <View
          style={[
            { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
            shadow.card,
          ]}
        >
          <ChecklistRow label="Folic acid 400mcg started" done border />
          <ChecklistRow label="GP preconception appointment" done border />
          <ChecklistRow label="Dental check-up" border />
          <ChecklistRow label="Reduce caffeine to <200mg/day" />
        </View>
      </View>

      <View style={{ height: 24 }} />
    </View>
  );
}

/* ── Calendar grid ─────────────────────────────────────────── */
type Cell = { n: string; kind: 'blank' | 'plain' | 'faint' | 'period' | 'fertile' | 'fertileL' | 'fertileR' | 'ovul' };

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const CELLS: Cell[] = [
  // row 1
  { n: '', kind: 'blank' }, { n: '', kind: 'blank' }, { n: '', kind: 'blank' }, { n: '', kind: 'blank' },
  { n: '1', kind: 'plain' }, { n: '2', kind: 'plain' }, { n: '3', kind: 'plain' },
  // row 2 — period 4-8, fertile starts 11..16
  { n: '4', kind: 'period' }, { n: '5', kind: 'period' }, { n: '6', kind: 'period' }, { n: '7', kind: 'period' },
  { n: '8', kind: 'period' }, { n: '9', kind: 'plain' }, { n: '10', kind: 'plain' },
  // row 3 — fertile window 11-16, ovulation 14
  { n: '11', kind: 'fertileL' }, { n: '12', kind: 'fertile' }, { n: '13', kind: 'fertile' }, { n: '14', kind: 'ovul' },
  { n: '15', kind: 'fertile' }, { n: '16', kind: 'fertileR' }, { n: '17', kind: 'plain' },
  // row 4
  { n: '18', kind: 'plain' }, { n: '19', kind: 'plain' }, { n: '20', kind: 'plain' }, { n: '21', kind: 'plain' },
  { n: '22', kind: 'plain' }, { n: '23', kind: 'plain' }, { n: '24', kind: 'faint' },
];

function CycleGrid() {
  return (
    <View>
      {/* weekday header */}
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={{ flex: 1, paddingHorizontal: 2 }}>
            <View style={{ padding: 4, alignItems: 'center' }}>
              <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#9C9AB2' }}>{d}</Text>
            </View>
          </View>
        ))}
      </View>
      {/* day cells */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {CELLS.map((cell, i) => (
          <View key={i} style={{ width: `${100 / 7}%`, paddingHorizontal: 2, paddingVertical: 2 }}>
            <DayCell cell={cell} />
          </View>
        ))}
      </View>
    </View>
  );
}

function DayCell({ cell }: { cell: Cell }) {
  const base = {
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (cell.kind === 'blank') return <View style={base} />;

  if (cell.kind === 'plain')
    return (
      <View style={base}>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.ink }}>{cell.n}</Text>
      </View>
    );

  if (cell.kind === 'faint')
    return (
      <View style={base}>
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#C8C6DC' }}>{cell.n}</Text>
      </View>
    );

  if (cell.kind === 'period')
    return (
      <View style={[base, { backgroundColor: '#FBE0EA', borderRadius: 999 }]}>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#D46E97' }}>{cell.n}</Text>
      </View>
    );

  if (cell.kind === 'ovul')
    return (
      <View style={[base, { backgroundColor: '#3A9B8A', borderRadius: 999 }]}>
        <Text style={{ fontFamily: f.body800, fontSize: 12, color: '#fff' }}>{cell.n}</Text>
      </View>
    );

  // fertile variants — band background with rounded ends
  const br =
    cell.kind === 'fertileL'
      ? { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }
      : cell.kind === 'fertileR'
      ? { borderTopRightRadius: 8, borderBottomRightRadius: 8 }
      : {};
  return (
    <View style={[base, { backgroundColor: '#E0F4EF' }, br]}>
      <Text style={{ fontFamily: f.body600, fontSize: 12, color: '#3A9B8A' }}>{cell.n}</Text>
    </View>
  );
}

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {swatch}
      <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2' }}>{label}</Text>
    </View>
  );
}

function ChecklistRow({ label, done = false, border = false }: { label: string; done?: boolean; border?: boolean }) {
  return (
    <View
      style={{
        paddingVertical: 11,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      {done ? (
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: '#D8F0E6',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 13l4 4L19 7" />
          </Svg>
        </View>
      ) : (
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: '#F4F3FB',
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: 'rgba(51,50,74,0.12)',
          }}
        />
      )}
      <Text
        style={{
          fontFamily: f.body600,
          fontSize: 12,
          color: done ? '#9C9AB2' : c.ink,
          textDecorationLine: done ? 'line-through' : 'none',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
