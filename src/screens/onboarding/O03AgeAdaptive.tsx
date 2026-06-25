import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';
import { BackLabel, NextButton, ProgressDots, SkipLabel } from './_parts';

const f = font;
const c = color;

/* 03 · Age-Adaptive — a growing stage spine baby → child → teen → adult. */
export default function O03AgeAdaptive() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />
      <SkipLabel />

      {/* floating deco */}
      <View style={{ position: 'absolute', top: 72, right: 22, width: 50, height: 50, backgroundColor: '#D8F0E6', borderRadius: 16, transform: [{ rotate: '8deg' }] }} />
      <View style={{ position: 'absolute', top: 176, left: 18, width: 38, height: 38, backgroundColor: '#FBF1CE', borderRadius: 12, transform: [{ rotate: '-10deg' }] }} />
      <Text style={{ position: 'absolute', top: 88, left: 60, fontSize: 13, color: '#E9C46A' }}>✦</Text>

      {/* stage spine illustration */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, minHeight: 560 }}>
        {/* stage row + connecting line */}
        <View style={{ position: 'relative', width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 32 }}>
          {/* line behind */}
          <LinearGradient
            colors={['#D8F0E6', '#E7E4FB', '#E7E4FB', '#E7E4FB', '#C8C6DC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', bottom: 28, left: 24, right: 24, height: 2, borderRadius: 2 }}
          />
          {/* Baby */}
          <Stage size={36} bubble="#D8F0E6" label="Baby" labelColor="#3FA98A">
            <Svg width={16} height={18} viewBox="0 0 20 22" fill="#3FA98A">
              <Circle cx="10" cy="7" r="4.5" />
              <Path d="M3 20Q3 14 10 14Q17 14 17 20Z" />
            </Svg>
          </Stage>
          {/* Toddler */}
          <Stage size={44} bubble="#D8F0E6" label="Toddler" labelColor="#3FA98A">
            <Svg width={18} height={20} viewBox="0 0 20 24" fill="#3FA98A">
              <Circle cx="10" cy="7" r="5" />
              <Path d="M2.5 22Q2.5 14 10 14Q17.5 14 17.5 22Z" />
            </Svg>
          </Stage>
          {/* School (active / highlighted) */}
          <Stage
            size={56}
            bubble="#6B6FC9"
            label="School"
            labelColor="#6B6FC9"
            bubbleStyle={{ shadowColor: '#6B6FC9', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 4 }}
          >
            <Svg width={20} height={24} viewBox="0 0 20 28" fill="white">
              <Circle cx="10" cy="7" r="5.5" />
              <Path d="M2 26Q2 16 10 16Q18 16 18 26Z" />
            </Svg>
          </Stage>
          {/* Teen */}
          <Stage size={52} bubble="#E7E4FB" label="Teen" labelColor="#6B6FC9">
            <Svg width={20} height={24} viewBox="0 0 20 28" fill="#6B6FC9">
              <Circle cx="10" cy="7" r="5.5" />
              <Path d="M2 26Q2 16 10 16Q18 16 18 26Z" />
            </Svg>
          </Stage>
          {/* Adult (dashed / upcoming) */}
          <Stage
            size={44}
            bubble="#F4F3FB"
            label="Adult"
            labelColor="#C8C6DC"
            bubbleStyle={{ borderWidth: 2, borderColor: '#C8C6DC', borderStyle: 'dashed' }}
          >
            <Svg width={18} height={24} viewBox="0 0 20 28" fill="#C8C6DC">
              <Circle cx="10" cy="7" r="5" />
              <Path d="M2.5 26Q2.5 16 10 16Q17.5 16 17.5 26Z" />
            </Svg>
          </Stage>
        </View>

        {/* stage info card */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            paddingHorizontal: 22,
            width: '100%',
            marginBottom: 12,
            shadowColor: '#33324A',
            shadowOpacity: 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <View style={{ width: 32, height: 32, backgroundColor: '#6B6FC9', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Rect x="3" y="4" width="18" height="18" rx="3" />
                <Path d="M16 2v4M8 2v4M3 10h18" />
              </Svg>
            </View>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#33324A' }}>School stage tools</Text>
          </View>
          <View style={{ gap: 6 }}>
            <Bullet>Class timetable & homework</Bullet>
            <Bullet>Chores & allowance</Bullet>
            <Bullet>School calendar sync</Bullet>
          </View>
        </View>

        {/* headline + subtitle */}
        <Text style={{ fontFamily: f.display700, fontSize: 28, lineHeight: 34, color: '#33324A', textAlign: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#6B6FC9' }}>Grows</Text> with every stage
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: '#6F6E86', textAlign: 'center' }}>
          Tools adapt automatically — no setup, no switching apps.
        </Text>
      </View>

      {/* bottom bar */}
      <View style={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackLabel />
        <ProgressDots active={2} />
        <NextButton />
      </View>
    </View>
  );
}

function Stage({
  size,
  bubble,
  label,
  labelColor,
  bubbleStyle,
  children,
}: {
  size: number;
  bubble: string;
  label: string;
  labelColor: string;
  bubbleStyle?: object;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <View style={[{ width: size, height: size, backgroundColor: bubble, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, bubbleStyle]}>
        {children}
      </View>
      <Text style={{ fontFamily: font.body700, fontSize: 10, color: labelColor }}>{label}</Text>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <View style={{ width: 6, height: 6, backgroundColor: '#6B6FC9', borderRadius: 3 }} />
      <Text style={{ fontFamily: font.body400, fontSize: 13, color: '#6F6E86' }}>{children}</Text>
    </View>
  );
}
