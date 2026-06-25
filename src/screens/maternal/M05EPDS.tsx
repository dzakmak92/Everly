import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* M05 · EPDS Mood Screening — a calm, validated wellbeing check-in. Support, not diagnosis. */
export default function M05EPDS() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 14 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>How are you feeling?</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 13, color: c.muted, marginTop: 4 }}>
          A gentle check-in · Just for you · Stays private
        </Text>
      </View>

      {/* gentle intro card */}
      <View style={{ marginHorizontal: 20, marginBottom: 14, backgroundColor: '#E7E4FB', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ marginTop: 1 }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
        </View>
        <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 12, lineHeight: 18, color: '#54579E' }}>
          This is a 10-question wellbeing check-in — not a test, not a diagnosis. Your answers are only ever visible to
          you. Private to this device. Never shared with employers or insurers.
        </Text>
      </View>

      {/* progress */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>Question 3 of 10</Text>
          <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>30%</Text>
        </View>
        <View style={{ height: 5, backgroundColor: '#E7E4FB', borderRadius: 999, overflow: 'hidden' }}>
          <View style={{ width: '30%', height: '100%', backgroundColor: '#6B6FC9', borderRadius: 999 }} />
        </View>
      </View>

      {/* current question */}
      <View style={[{ marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 20, padding: 20 }, shadow.card]}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, lineHeight: 20.3, color: c.ink, marginBottom: 18 }}>
          "I have been able to laugh and see the funny side of things."
        </Text>
        <View style={{ gap: 8 }}>
          {/* selected answer */}
          <View style={{ backgroundColor: '#6B6FC9', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text style={{ fontFamily: f.body600, fontSize: 13, color: '#fff' }}>As much as I always could</Text>
          </View>
          {['Not quite so much now', 'Definitely not so much now', 'Not at all'].map((label) => (
            <View
              key={label}
              style={{
                backgroundColor: '#F4F3FB',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: 'rgba(51,50,74,0.08)',
              }}
            >
              <Text style={{ fontFamily: f.body600, fontSize: 13, color: c.ink }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* reassurance note */}
      <View style={{ marginHorizontal: 20, marginBottom: 16, backgroundColor: '#FBF1CE', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
        <View style={{ marginTop: 1 }}>
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="#C9A33B">
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </Svg>
        </View>
        <Text style={{ flex: 1, fontFamily: f.body400, fontSize: 11, lineHeight: 16.5, color: '#7A5C20' }}>
          There are no right or wrong answers. Take your time — you can pause and come back whenever you're ready.
        </Text>
      </View>

      {/* after-screen: result state (shown after completion) */}
      <View style={{ marginHorizontal: 20, marginBottom: 24, backgroundColor: '#D8F0E6', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ marginTop: 1 }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#3A9B8A" strokeWidth={2} strokeLinecap="round">
            <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <Path d="M22 4L12 14.01l-3-3" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 13, color: '#1E5C50', marginBottom: 4 }}>
            Your check-in looks positive
          </Text>
          <Text style={{ fontFamily: f.body400, fontSize: 12, lineHeight: 16.8, color: '#3A7A6A' }}>
            You're doing well. We'll check in again next week. If you ever feel you need support, resources are always
            one tap away.
          </Text>
        </View>
      </View>
    </View>
  );
}
