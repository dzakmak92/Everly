import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { font } from '../../theme/tokens';

const f = font;

/* S5 · Wellbeing Nudge — dimmed Today background with a bottom-sheet parenting tip. */
export default function S5Wellbeing() {
  return (
    <View style={{ backgroundColor: '#F4F3FB', minHeight: 680, position: 'relative' }}>
      {/* dimmed Today background */}
      <View style={{ opacity: 0.3, paddingTop: 14, paddingBottom: 8, paddingHorizontal: 26 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>9:41</Text>
      </View>
      <View style={{ opacity: 0.3, paddingVertical: 8, paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 20, color: '#33324A' }}>Good morning, Emma</Text>
      </View>
      <View style={{ opacity: 0.3, paddingVertical: 10, paddingHorizontal: 20 }}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <View style={{ width: 36, height: 36, backgroundColor: '#D8F0E6', borderRadius: 10 }} />
          <View>
            <View style={{ height: 10, backgroundColor: '#E7E4FB', borderRadius: 4, width: 120 }} />
            <View style={{ height: 8, backgroundColor: '#F4F3FB', borderRadius: 3, width: 80, marginTop: 5 }} />
          </View>
        </View>
      </View>

      {/* scrim */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26,24,48,0.48)' }} />

      {/* bottom sheet */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 20,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
      >
        <View style={{ width: 36, height: 4, backgroundColor: 'rgba(51,50,74,0.12)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#D8F0E6',
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 22V10M12 10C12 6 8 3 4 5M12 10C12 6 16 3 20 5" />
              <Circle cx="12" cy="4" r="2.5" fill="#3FA98A" stroke="none" />
            </Svg>
          </View>
          <View>
            <Text style={{ fontFamily: f.display700, fontSize: 16, color: '#33324A' }}>A gentle thought</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: '#9C9AB2', marginTop: 3 }}>
              Based on Oliver's patterns this week
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#F4F3FB', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 23, color: '#33324A' }}>
            Oliver has been sleeping better — <Text style={{ fontFamily: f.body700 }}>+20 min</Text> avg this week. Wake-window reminders are working.
          </Text>
        </View>

        <Text style={{ fontFamily: f.body400, fontSize: 13, lineHeight: 21, color: '#6F6E86', marginBottom: 18 }}>
          Research suggests consistent sleep cues help babies self-settle by 4–6 months.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: '#F4F3FB', borderRadius: 14, padding: 13, alignItems: 'center' }}>
            <Text style={{ fontFamily: f.body600, fontSize: 14, color: '#9C9AB2' }}>Dismiss</Text>
          </View>
          <View style={{ flex: 2, backgroundColor: '#6B6FC9', borderRadius: 14, padding: 13, alignItems: 'center' }}>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#fff' }}>Save this tip</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
