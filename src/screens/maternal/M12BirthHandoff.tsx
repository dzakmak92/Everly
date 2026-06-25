import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar, SproutLockBadge } from '../../components/ui';

const f = font;

/* M12 · Birth Handoff — Mum&Me → Newborn. The emotional pivot. */
export default function M12BirthHandoff() {
  return (
    <View style={{ backgroundColor: color.canvas }}>
      <StatusBar />

      {/* celebration hero */}
      <LinearGradient
        colors={['#E0F4EF', '#FBE0EA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginTop: 8,
          marginHorizontal: 20,
          marginBottom: 14,
          borderRadius: 26,
          paddingVertical: 28,
          paddingHorizontal: 22,
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* sparkles */}
        <Text style={{ position: 'absolute', top: 18, left: 26, fontSize: 13, color: '#E9C46A' }}>✦</Text>
        <Text style={{ position: 'absolute', top: 40, right: 30, fontSize: 10, color: '#E9C46A' }}>✦</Text>
        <Text style={{ position: 'absolute', bottom: 26, left: 40, fontSize: 9, color: '#E9C46A' }}>✦</Text>

        {/* blooming sprout + silhouettes (mother + bloom + newborn) */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
          {/* mother silhouette (bump) */}
          <Svg width={58} height={78} viewBox="0 0 48 64" fill="#3A9B8A">
            <Circle cx={22} cy={11} r={8} />
            <Path d="M15 22 Q12 33 16 42 Q9 45 11 60 L31 60 Q33 45 26 42 Q37 34 28 22 Z" />
          </Svg>
          {/* blooming sprout */}
          <View style={{ marginHorizontal: 2, marginBottom: 6 }}>
            <Svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#6E9A4E" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 22V10" />
              <Path d="M12 14c0-3.2-2.6-5.4-6-5.4 0 3.2 2.6 5.4 6 5.4z" fill="#D8EBC6" stroke="#6E9A4E" />
              <Path d="M12 11c0-3.2 2.6-5.4 6-5.4 0 3.2-2.6 5.4-6 5.4z" fill="#B8D89A" stroke="#6E9A4E" />
            </Svg>
          </View>
          {/* newborn silhouette */}
          <Svg width={34} height={44} viewBox="0 0 30 40" fill="#3FA98A">
            <Circle cx={15} cy={9} r={6.5} />
            <Path d="M9 18 Q6 27 10 33 L20 33 Q24 27 21 18 Z" />
          </Svg>
        </View>

        <Text style={{ fontFamily: f.display700, fontSize: 26, lineHeight: 31, color: '#1E5C50', marginBottom: 8 }}>
          Welcome, Oliver
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, lineHeight: 20, color: '#3A7A6A', textAlign: 'center' }}>
          Your bump journal is now <Text style={{ fontFamily: f.body700 }}>Oliver's first chapter.</Text> Take all the time
          you need — we've got you both.
        </Text>
      </LinearGradient>

      {/* two destinations */}
      <Text
        style={{
          paddingHorizontal: 20,
          fontFamily: f.body700,
          fontSize: 11,
          letterSpacing: 0.9,
          textTransform: 'uppercase',
          color: color.muted,
          marginBottom: 8,
        }}
      >
        Where to next
      </Text>

      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        {/* free: your recovery */}
        <LinearGradient
          colors={['#E0F4EF', '#D4EDDB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 18,
            padding: 16,
            flexDirection: 'row',
            gap: 13,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              backgroundColor: '#3A9B8A',
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
              <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#1E5C50' }}>Your recovery</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
                <Text style={{ fontFamily: f.body700, fontSize: 9, color: '#2C8475' }}>Free</Text>
              </View>
            </View>
            <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 17, color: '#3A7A6A' }}>
              Postpartum dashboard, EPDS, healing — always free, just for you.
            </Text>
          </View>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3A9B8A" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M9 18l6-6-6-6" />
          </Svg>
        </LinearGradient>

        {/* premium: track baby */}
        <View
          style={{
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#6B6FC9',
            borderRadius: 18,
            padding: 16,
            flexDirection: 'row',
            gap: 13,
            alignItems: 'center',
          }}
        >
          {/* sprout-lock badge (top-right) */}
          <View style={{ position: 'absolute', top: 8, right: 12 }}>
            <SproutLockBadge />
          </View>
          <View
            style={{
              width: 46,
              height: 46,
              backgroundColor: '#E7E4FB',
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <Path d="M9 22V12h6v10" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: color.ink, marginBottom: 3 }}>Track Oliver</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 17, color: '#6F6E86' }}>
              Feeds, sleep, growth, rhythm ring & what's-next.
            </Text>
          </View>
        </View>
      </View>

      {/* gentle CTA */}
      <View style={{ paddingTop: 6, paddingHorizontal: 20, paddingBottom: 10 }}>
        <View
          style={[
            {
              backgroundColor: '#6B6FC9',
              paddingVertical: 15,
              paddingHorizontal: 15,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            },
            {
              shadowColor: '#6B6FC9',
              shadowOpacity: 0.32,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
              elevation: 5,
            },
          ]}
        >
          <Text style={{ fontFamily: f.body800, fontSize: 14, color: '#fff' }}>Start Oliver's 30-day free trial</Text>
        </View>
      </View>

      <Text
        style={{
          fontFamily: f.body400,
          fontSize: 11,
          lineHeight: 15,
          color: color.muted,
          textAlign: 'center',
          paddingHorizontal: 28,
          paddingBottom: 24,
        }}
      >
        No card needed now · Your recovery stays free whatever you choose.
      </Text>
    </View>
  );
}
