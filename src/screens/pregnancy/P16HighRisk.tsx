import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P16 · High-Risk Add-Ons — additional monitoring (GDM, BP, opt-in add-ons). */
export default function P16HighRisk() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>High-Risk Monitoring</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          Additional tracking for your specific needs
        </Text>
      </View>

      {/* active add-on: GDM */}
      <LinearGradient
        colors={['#FBF1CE', '#FCE6D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 18 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#7A5C20' }}>Gestational Diabetes · Active</Text>
          <View style={{ backgroundColor: '#C9A33B', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#fff' }}>GDM</Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <GdmRow label="Fasting glucose" sub="This morning · 7:00am" value="4.9" valueColor="#3FA98A" unit="mmol/L · Normal" />
          <GdmRow label="Post-meal (2h)" sub="After lunch · 2:00pm" value="7.2" valueColor="#C9A33B" unit="mmol/L · Borderline" />
        </View>

        <View
          style={{
            marginTop: 10,
            backgroundColor: 'rgba(201,163,59,0.15)',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#7A5C20' }}>
            Post-meal target: ≤7.8 mmol/L. You're within range — good work.
          </Text>
        </View>
      </LinearGradient>

      {/* BP / pre-eclampsia monitoring */}
      <View
        style={[
          {
            marginHorizontal: 20,
            marginBottom: 12,
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 16,
            paddingHorizontal: 18,
          },
          shadow.card,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink }}>Blood pressure log</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>Pre-eclampsia watch</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <BpCell value="118/74" valueColor="#3FA98A" bg="#D8F0E6" label="Today" />
          <BpCell value="120/76" valueColor={c.ink} bg="#F4F3FB" label="Yesterday" />
          <BpCell value="116/72" valueColor={c.ink} bg="#F4F3FB" label="2 days ago" />
        </View>

        <View style={{ backgroundColor: '#FBE0EA', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 11, lineHeight: 15.4, color: '#B04070' }}>
            Alert threshold: ≥140/90. You're well below. Log daily as directed by your care team.
          </Text>
        </View>
      </View>

      {/* other add-ons */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}>
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 11,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: c.muted,
            paddingLeft: 4,
          }}
        >
          Other add-ons available
        </Text>
        <View style={[{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, shadow.row]}>
          <AddRow label="Multiples / twins monitoring" border />
          <AddRow label="Bed-rest / cervical length tracking" />
        </View>
      </View>
    </View>
  );
}

function GdmRow({
  label,
  sub,
  value,
  valueColor,
  unit,
}: {
  label: string;
  sub: string;
  value: string;
  valueColor: string;
  unit: string;
}) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{label}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 2 }}>{sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: font.display700, fontSize: 22, color: valueColor }}>{value}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted }}>{unit}</Text>
      </View>
    </View>
  );
}

function BpCell({ value, valueColor, bg, label }: { value: string; valueColor: string; bg: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 12, padding: 10, alignItems: 'center' }}>
      <Text style={{ fontFamily: font.display700, fontSize: 18, color: valueColor }}>{value}</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 10, color: color.muted, marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function AddRow({ label, border = false }: { label: string; border?: boolean }) {
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.ink, flex: 1 }}>{label}</Text>
      <View style={{ backgroundColor: '#F4F3FB', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 10, color: color.muted }}>Add</Text>
      </View>
    </View>
  );
}
