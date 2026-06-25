import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* P10 · Calm Layer — dark, quiet meditation space. */
export default function P10CalmLayer() {
  return (
    <LinearGradient
      colors={[c.calmTop, c.calmMid, c.calmBottom]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ minHeight: 720 }}
    >
      <StatusBar dark />

      {/* header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 24, lineHeight: 26, color: '#EDEBFA' }}>Your calm space</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: 'rgba(237,235,250,0.5)', marginTop: 5 }}>
          A quiet place, just for you
        </Text>
      </View>

      {/* category tabs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 18, flexDirection: 'row', gap: 6 }}>
        <Tab active>Meditations</Tab>
        <Tab>Sleep Stories</Tab>
        <Tab>Breathing</Tab>
      </View>

      {/* featured card */}
      <LinearGradient
        colors={['#E98FB3', '#D46E97']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 20, marginBottom: 16, borderRadius: 22, paddingVertical: 22, paddingHorizontal: 20 }}
      >
        <Text
          style={{
            fontFamily: f.body700,
            fontSize: 10,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 8,
          }}
        >
          Featured · 12 min
        </Text>
        <Text style={{ fontFamily: f.display700, fontSize: 20, lineHeight: 24, color: '#fff', marginBottom: 8 }}>
          Evening Unwinding
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.8)', marginBottom: 18 }}>
          Release the day. A gentle guided body scan for the third trimester — relieves tension in hips and lower back.
        </Text>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="white">
                <Polygon points="5 3 19 12 5 21 5 3" />
              </Svg>
            </View>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#fff' }}>Play now</Text>
          </View>
          <Text style={{ fontFamily: f.body400, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>12:00</Text>
        </View>
      </LinearGradient>

      {/* library grid */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <LibraryTile duration="8 min" title="Anxiety release" sub="Breathing for worry" />
        <LibraryTile duration="20 min" title="Pregnancy sleep" sub="Sleep story for late pregnancy" />
        <LibraryTile duration="5 min" title="4-7-8 breathing" sub="Labour prep technique" />
        <LibraryTile duration="15 min" title="Bond with baby" sub="Visualisation for connection" />
      </View>

      <View style={{ height: 32 }} />
    </LinearGradient>
  );
}

function Tab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: active ? '#E98FB3' : 'rgba(255,255,255,0.1)',
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: active ? 16 : 14,
      }}
    >
      <Text
        style={{
          fontFamily: active ? font.body700 : font.body600,
          fontSize: 12,
          color: active ? '#fff' : 'rgba(237,235,250,0.6)',
        }}
      >
        {children}
      </Text>
    </View>
  );
}

function LibraryTile({ duration, title, sub }: { duration: string; title: string; sub: string }) {
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: '47%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 14,
        paddingHorizontal: 12,
      }}
    >
      <Text
        style={{
          fontFamily: font.body400,
          fontSize: 10,
          color: 'rgba(237,235,250,0.45)',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {duration}
      </Text>
      <Text style={{ fontFamily: font.body700, fontSize: 13, lineHeight: 16, color: '#EDEBFA', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontFamily: font.body400, fontSize: 11, lineHeight: 15, color: 'rgba(237,235,250,0.5)' }}>{sub}</Text>
    </View>
  );
}
