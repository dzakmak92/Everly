import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* 04 · Snap to Schedule — flyer → AI → event cards transformation. */
export default function O04SnapToSchedule() {
  return (
    <View style={{ backgroundColor: c.canvas, minHeight: 720, position: 'relative' }}>
      <StatusBar />

      {/* Skip */}
      <View style={{ position: 'absolute', top: 14, right: 26, zIndex: 3 }}>
        <Text style={{ fontFamily: f.body600, fontSize: 13, color: c.muted }}>Skip</Text>
      </View>

      {/* floating deco */}
      <View
        style={{
          position: 'absolute',
          top: 80,
          left: 16,
          width: 44,
          height: 44,
          backgroundColor: '#FBE0EA',
          borderRadius: 14,
          transform: [{ rotate: '-8deg' }],
        }}
      />
      <Text style={{ position: 'absolute', top: 82, right: 20, fontSize: 14, color: '#E9C46A' }}>✦</Text>

      {/* snap illustration */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          paddingTop: 20,
          zIndex: 2,
        }}
      >
        {/* flyer card → arrow → event cards */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28, width: '100%' }}>
          {/* School flyer */}
          <View
            style={[
              {
                width: 120,
                backgroundColor: '#fff',
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderWidth: 2,
                borderColor: '#C8C6DC',
                borderStyle: 'dashed',
              },
              shadow.card,
            ]}
          >
            <Text
              style={{
                fontFamily: f.body700,
                fontSize: 10,
                color: c.muted,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              St. Mary's
            </Text>
            <View style={{ height: 6, backgroundColor: '#E7E4FB', borderRadius: 3, marginBottom: 5 }} />
            <View style={{ height: 6, backgroundColor: '#E7E4FB', borderRadius: 3, marginBottom: 5, width: '80%' }} />
            <View style={{ height: 6, backgroundColor: '#E7E4FB', borderRadius: 3, marginBottom: 8, width: '60%' }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <View style={{ width: 6, height: 6, backgroundColor: '#6B6FC9', borderRadius: 3 }} />
              <View style={{ height: 5, backgroundColor: '#D8F0E6', borderRadius: 2, flex: 1 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <View style={{ width: 6, height: 6, backgroundColor: '#6B6FC9', borderRadius: 3 }} />
              <View style={{ height: 5, backgroundColor: '#D8F0E6', borderRadius: 2, flex: 1 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, backgroundColor: '#6B6FC9', borderRadius: 3 }} />
              <View style={{ height: 5, backgroundColor: '#D8F0E6', borderRadius: 2, flex: 1, width: '70%' }} />
            </View>

            <View
              style={{
                marginTop: 10,
                backgroundColor: '#6B6FC9',
                borderRadius: 6,
                padding: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
                <Rect x="3" y="8" width="18" height="12" rx="2" />
                <Path d="M8 8V5a2 2 0 0 1 4 0v3" />
              </Svg>
            </View>
          </View>

          {/* Arrow */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Svg width={32} height={20} viewBox="0 0 32 20" fill="none">
              <Path d="M0 10h28M22 4l8 6-8 6" stroke="#6B6FC9" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text
              style={{
                fontFamily: f.body700,
                fontSize: 9,
                color: '#6B6FC9',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              AI
            </Text>
          </View>

          {/* Event cards */}
          <View style={{ flex: 1, gap: 7 }}>
            <View style={{ backgroundColor: '#D8F0E6', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#3FA98A' }}>Sports Day</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#3FA98A', opacity: 0.75, marginTop: 2 }}>
                Fri Jun 27 · 10:00
              </Text>
            </View>
            <View style={{ backgroundColor: '#E7E4FB', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#6B6FC9' }}>School Play</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#6B6FC9', opacity: 0.75, marginTop: 2 }}>
                Fri Jun 27 · 15:00
              </Text>
            </View>
            <View style={{ backgroundColor: '#FBF1CE', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: f.body700, fontSize: 11, color: '#C9A33B' }}>Book return</Text>
              <Text style={{ fontFamily: f.body400, fontSize: 10, color: '#C9A33B', opacity: 0.75, marginTop: 2 }}>
                Mon Jun 30
              </Text>
            </View>
          </View>
        </View>

        {/* added to calendar confirmation */}
        <View
          style={[
            {
              backgroundColor: '#fff',
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 18,
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
            },
            shadow.card,
          ]}
        >
          <View
            style={{
              width: 36,
              height: 36,
              backgroundColor: '#D8F0E6',
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
              <Path d="M5 13l4 4L19 7" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 13, color: c.ink, marginBottom: 3 }}>
              3 events added to Mia's calendar
            </Text>
            <Text style={{ fontFamily: f.body400, fontSize: 11, color: c.muted }}>
              Reminders set · Duplicates removed
            </Text>
          </View>
        </View>

        {/* headline + subtitle */}
        <Text style={{ fontFamily: f.display700, fontSize: 28, lineHeight: 34, color: c.ink, marginBottom: 10, textAlign: 'center' }}>
          <Text style={{ color: '#6B6FC9' }}>Snap</Text> to Schedule
        </Text>
        <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: c.inkSecondary, textAlign: 'center' }}>
          Photo a school flyer → events appear in seconds. No typing.
        </Text>
      </View>

      <OnboardingFooter activeIndex={3} />
    </View>
  );
}

/* Shared footer: Back · 9-dot progress bar · Next button. */
function OnboardingFooter({ activeIndex }: { activeIndex: number }) {
  return (
    <View
      style={{
        paddingTop: 24,
        paddingHorizontal: 32,
        paddingBottom: 44,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: f.body600, fontSize: 14, color: c.muted }}>Back</Text>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        {Array.from({ length: 9 }).map((_, i) =>
          i === activeIndex ? (
            <View key={i} style={{ width: 22, height: 7, backgroundColor: '#6B6FC9', borderRadius: 4 }} />
          ) : (
            <View key={i} style={{ width: 7, height: 7, backgroundColor: 'rgba(107,111,201,0.22)', borderRadius: 3.5 }} />
          ),
        )}
      </View>
      <View
        style={[
          {
            backgroundColor: '#6B6FC9',
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 15,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          },
          shadow.periwinkleButton,
        ]}
      >
        <Text style={{ fontFamily: f.body800, fontSize: 15, color: '#fff' }}>Next</Text>
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
          <Path d="M5 12h14M12 5l7 7-7 7" />
        </Svg>
      </View>
    </View>
  );
}
