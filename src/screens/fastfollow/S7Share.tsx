import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { font } from '../../theme/tokens';
import { TREE_PATH } from '../../theme/logoPath';

const f = font;

/* S7 · Share via WhatsApp — dimmed Timeline background with an iOS share sheet. */
export default function S7Share() {
  return (
    <View style={{ backgroundColor: '#F4F3FB', minHeight: 680, position: 'relative' }}>
      {/* dimmed Timeline background */}
      <View style={{ opacity: 0.35, paddingTop: 14, paddingBottom: 8, paddingHorizontal: 26 }}>
        <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>9:41</Text>
      </View>
      <View style={{ opacity: 0.35, paddingVertical: 8, paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: f.display700, fontSize: 20, color: '#33324A' }}>Oliver's story</Text>
      </View>
      <View style={{ opacity: 0.35, paddingVertical: 10, paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 14, height: 52, marginBottom: 10 }} />
        <View style={{ backgroundColor: '#fff', borderRadius: 14, height: 52 }} />
      </View>

      {/* scrim */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26,24,48,0.42)' }} />

      {/* iOS share sheet */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 8,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      >
        <View style={{ width: 36, height: 4, backgroundColor: 'rgba(51,50,74,0.12)', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />

        {/* milestone preview card */}
        <View
          style={{
            backgroundColor: '#F4F3FB',
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <View style={{ width: 44, height: 44, backgroundColor: '#76a878', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={24} height={27} viewBox="0 0 340 385">
              <Path d={TREE_PATH} fill="#fff" fillRule="evenodd" />
            </Svg>
          </View>
          <View>
            <Text style={{ fontFamily: f.body700, fontSize: 14, color: '#33324A' }}>Oliver's first smile ✨</Text>
            <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#9C9AB2', marginTop: 3 }}>6 weeks · May 4, 2026 · via Everly</Text>
          </View>
        </View>

        {/* app icon row */}
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 14 }}>
          {/* WhatsApp (selected) */}
          <ShareApp label="WhatsApp" labelColor="#6B6FC9" labelWeight="600">
            <View
              style={{
                width: 52,
                height: 52,
                backgroundColor: '#25D366',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: 'rgba(107,111,201,0.3)',
              }}
            >
              <Svg width={26} height={26} viewBox="0 0 24 24" fill="white">
                <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </Svg>
            </View>
          </ShareApp>

          {/* Messages */}
          <ShareApp label="Messages">
            <LinearGradient
              colors={['#5AF75A', '#00C300']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="white">
                <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </Svg>
            </LinearGradient>
          </ShareApp>

          {/* Mail */}
          <ShareApp label="Mail">
            <LinearGradient
              colors={['#1E9BF0', '#0070D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <Polyline points="22,6 12,13 2,6" />
              </Svg>
            </LinearGradient>
          </ShareApp>

          {/* Copy */}
          <ShareApp label="Copy">
            <View
              style={{
                width: 52,
                height: 52,
                backgroundColor: '#F4F3FB',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(51,50,74,0.1)',
              }}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#33324A" strokeWidth={2} strokeLinecap="round">
                <Rect x="9" y="9" width="13" height="13" rx="2" />
                <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </Svg>
            </View>
          </ShareApp>

          {/* More */}
          <ShareApp label="More">
            <View
              style={{
                width: 52,
                height: 52,
                backgroundColor: '#F4F3FB',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(51,50,74,0.1)',
              }}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="#33324A">
                <Circle cx="5" cy="12" r="2" />
                <Circle cx="12" cy="12" r="2" />
                <Circle cx="19" cy="12" r="2" />
              </Svg>
            </View>
          </ShareApp>
        </View>

        {/* Cancel */}
        <View style={{ backgroundColor: '#F4F3FB', borderRadius: 14, padding: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: f.body600, fontSize: 15, color: '#6F6E86' }}>Cancel</Text>
        </View>
      </View>
    </View>
  );
}

function ShareApp({
  label,
  labelColor = '#33324A',
  labelWeight = '400',
  children,
}: {
  label: string;
  labelColor?: string;
  labelWeight?: '400' | '600';
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 5 }}>
      {children}
      <Text style={{ fontFamily: labelWeight === '600' ? f.body600 : f.body400, fontSize: 10, color: labelColor }}>{label}</Text>
    </View>
  );
}
