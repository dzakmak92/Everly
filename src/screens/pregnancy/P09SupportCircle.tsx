import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, font } from '../../theme/tokens';
import { StatusBar, Card, Pill, SectionLabel, Silhouette } from '../../components/ui';
import { Shield } from '../../components/icons';

const f = font;
const c = color;

/* P09 · Partner & Support Circle — encrypted relay sharing. */
export default function P09SupportCircle() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Support Circle</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 5 }}>
          Shared via encrypted relay · iOS & Android
        </Text>
      </View>

      {/* privacy note */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 14,
          backgroundColor: '#E7E4FB',
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Shield size={15} color="#6B6FC9" />
        <Text style={{ fontFamily: f.body500, fontSize: 12, lineHeight: 17, color: '#54579E', flex: 1 }}>
          E2E encrypted · Only you hold the key · Revoke any time
        </Text>
      </View>

      {/* partner card */}
      <Card style={{ marginHorizontal: 20, marginBottom: 10, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <View
          style={{
            width: 52,
            height: 52,
            backgroundColor: '#FCE6D8',
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Silhouette size={26} fill="#D9824F" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 15, color: c.ink }}>Dave</Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: c.muted, marginTop: 3 }}>
            Partner · Linked · Sees everything shared
          </Text>
        </View>
        <Pill bg="#D8F0E6" fg="#3FA98A" size={11} style={{ paddingHorizontal: 10 }}>
          Active
        </Pill>
      </Card>

      {/* your circle */}
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        <SectionLabel style={{ marginBottom: 2, paddingLeft: 4 }}>Your circle</SectionLabel>

        <Card style={{ overflow: 'hidden' }}>
          {/* Midwife */}
          <CircleRow avatarBg="#D8F0E6" avatarFill="#3FA98A" name="Claire Walsh" sub="Midwife · Appointment history" border>
            <Pill bg="#E7E4FB" fg="#6B6FC9" size={10} style={{ paddingVertical: 4, paddingHorizontal: 10 }}>
              Read
            </Pill>
          </CircleRow>

          {/* Grandparent */}
          <CircleRow avatarBg="#FBF1CE" avatarFill="#C9A33B" name="Grandma Ruth" sub="Grandparent · Bump journal only" border>
            <Pill bg="#E7E4FB" fg="#6B6FC9" size={10} style={{ paddingVertical: 4, paddingHorizontal: 10 }}>
              Read
            </Pill>
          </CircleRow>

          {/* Invite */}
          <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#F4F3FB',
                borderRadius: 20,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '#C8C6DC',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C8C6DC" strokeWidth={2} strokeLinecap="round">
                <Path d="M12 5v14M5 12h14" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f.body600, fontSize: 13, color: c.muted }}>Invite someone</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.faint, marginTop: 2 }}>
                Doula, parent, or support person
              </Text>
            </View>
            <Pill bg="#6B6FC9" fg="#fff" size={11} style={{ paddingVertical: 6, paddingHorizontal: 14 }}>
              Invite
            </Pill>
          </View>
        </Card>
      </View>

      <View style={{ height: 28 }} />
    </View>
  );
}

function CircleRow({
  avatarBg,
  avatarFill,
  name,
  sub,
  border,
  children,
}: {
  avatarBg: string;
  avatarFill: string;
  name: string;
  sub: string;
  border?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.05)',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: avatarBg,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Silhouette size={20} fill={avatarFill} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink }}>{name}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 2 }}>{sub}</Text>
      </View>
      {children}
    </View>
  );
}
