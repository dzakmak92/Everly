import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { font } from '../../theme/tokens';

const f = font;

/* S6 · Voice Add — dark full-screen voice capture overlay. */
export default function S6VoiceAdd() {
  return (
    <View
      style={{
        backgroundColor: 'rgba(26,24,48,0.96)',
        minHeight: 680,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 32,
        position: 'relative',
      }}
    >
      {/* top time + cancel */}
      <Text
        style={{
          position: 'absolute',
          top: 14,
          left: 26,
          fontFamily: f.body700,
          fontSize: 14,
          color: 'rgba(237,235,250,0.6)',
        }}
      >
        3:14
      </Text>
      <Text
        style={{
          position: 'absolute',
          top: 52,
          right: 28,
          fontFamily: f.body600,
          fontSize: 14,
          color: 'rgba(237,235,250,0.45)',
        }}
      >
        Cancel
      </Text>

      <View style={{ alignItems: 'center' }}>
        {/* pulsing mic circle with concentric rings */}
        <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(107,111,201,0.14)' }} />
          <View style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderRadius: 68, borderWidth: 1, borderColor: 'rgba(107,111,201,0.22)' }} />
          <View style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, borderRadius: 56, borderWidth: 1, borderColor: 'rgba(107,111,201,0.32)' }} />
          <View
            style={{
              width: 88,
              height: 88,
              backgroundColor: '#6B6FC9',
              borderRadius: 44,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#6B6FC9',
              shadowOpacity: 0.5,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
            }}
          >
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
              <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <Line x1="12" y1="19" x2="12" y2="23" />
              <Line x1="8" y1="23" x2="16" y2="23" />
            </Svg>
          </View>
        </View>

        <Text style={{ fontFamily: f.display700, fontSize: 18, color: '#EDEBFA', marginTop: 28 }}>Listening…</Text>

        {/* waveform bars */}
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', height: 36, marginTop: 16 }}>
          <Bar h={12} color="rgba(107,111,201,0.4)" />
          <Bar h={22} color="rgba(107,111,201,0.5)" />
          <Bar h={32} color="#6B6FC9" />
          <Bar h={20} color="rgba(107,111,201,0.6)" />
          <Bar h={28} color="#6B6FC9" />
          <Bar h={14} color="rgba(107,111,201,0.5)" />
          <Bar h={24} color="#6B6FC9" />
          <Bar h={18} color="rgba(107,111,201,0.5)" />
          <Bar h={30} color="#6B6FC9" />
          <Bar h={10} color="rgba(107,111,201,0.4)" />
        </View>

        {/* live transcription */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: 'rgba(107,111,201,0.2)',
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 18,
            width: '100%',
          }}
        >
          <Text style={{ fontFamily: f.body400, fontSize: 14, lineHeight: 21, color: '#EDEBFA', textAlign: 'center' }}>
            "Fed Oliver, left side…<Text style={{ opacity: 0.5 }}>|</Text>"
          </Text>
        </View>

        <View style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: f.body400, fontSize: 11, lineHeight: 17, color: 'rgba(237,235,250,0.4)', textAlign: 'center' }}>
            Try: "Log a feed, left side, 12 minutes"
          </Text>
        </View>
      </View>
    </View>
  );
}

function Bar({ h, color }: { h: number; color: string }) {
  return <View style={{ width: 4, height: h, backgroundColor: color, borderRadius: 2 }} />;
}
