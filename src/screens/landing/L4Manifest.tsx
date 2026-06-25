import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { font } from '../../theme/tokens';
import { Logo } from '../../components/Logo';

const f = font;

/* L4 · Manifest — bold editorial poster, massive serif/display type, dark green.
   Source: Everly Landing.dc.html lines 291–361. The HTML uses DM Serif Display
   for headlines; per brief we render headings with the Quicksand display tokens
   (the only display family loaded in this app). */
export default function L4Manifest() {
  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          borderRadius: 44,
          overflow: 'hidden',
          shadowColor: 'rgba(8,34,18,1)',
          shadowOpacity: 0.3,
          shadowRadius: 72,
          shadowOffset: { width: 0, height: 20 },
          elevation: 12,
        }}
      >
        {/* ── Hero (dark green) ── */}
        <View
          style={{
            backgroundColor: '#102418',
            paddingTop: 72,
            paddingHorizontal: 28,
            paddingBottom: 48,
            minHeight: 560,
            overflow: 'hidden',
          }}
        >
          {/* faint oversized tree mark, top-right */}
          <View style={{ position: 'absolute', right: -64, top: -48 }} pointerEvents="none">
            <Logo width={348} height={394} color="rgba(180,240,150,0.04)" />
          </View>

          {/* brand row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 1 }}>
            <Logo width={20} height={23} color="#76a878" />
            <Text
              style={{
                fontFamily: f.body800,
                fontSize: 12,
                color: '#76a878',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              everly
            </Text>
          </View>

          {/* headline block, pushed to bottom */}
          <View style={{ zIndex: 1, marginTop: 'auto', paddingTop: 40 }}>
            <Text
              style={{
                fontFamily: f.body700,
                fontSize: 10,
                color: '#486050',
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              The family app
            </Text>
            <Text
              style={{
                fontFamily: f.display700,
                fontSize: 100,
                color: '#f0ead4',
                lineHeight: 88,
                marginBottom: 28,
                letterSpacing: -3,
              }}
            >
              Ever{'\n'}ly.
            </Text>
            <Text
              style={{
                fontFamily: f.body500,
                fontSize: 16,
                color: '#88a880',
                lineHeight: 23,
                marginBottom: 32,
                maxWidth: 280,
              }}
            >
              From first feed to first car. One app. One story.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                gap: 8,
                borderWidth: 1.5,
                borderColor: 'rgba(240,234,212,0.28)',
                paddingVertical: 14,
                paddingHorizontal: 28,
                borderRadius: 100,
              }}
            >
              <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#f0ead4' }}>Get Started Free</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#f0ead4" strokeWidth={2.5} strokeLinecap="round">
                <Path d="M5 12h14M12 5l7 7-7 7" />
              </Svg>
            </View>
          </View>
        </View>

        {/* ── Cream "what makes it different" ── */}
        <View style={{ backgroundColor: '#f3eadf', paddingTop: 36, paddingHorizontal: 28 }}>
          <Text
            style={{
              fontFamily: f.body800,
              fontSize: 10,
              color: '#9a7a50',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            What makes it different
          </Text>
          <View style={{ gap: 28 }}>
            <ManifestPoint
              n="1"
              title="One app, birth to adulthood"
              body="No re-platforming. Your family history never gets left behind."
            />
            <ManifestPoint
              n="2"
              title="Your data, your device"
              body="Local-first. No cloud. No analytics. No compromise on privacy."
            />
            <ManifestPoint
              n="3"
              title="Newborn tracking, free forever"
              body="We earn your trust at the start. No bait and switch."
            />
          </View>
        </View>

        {/* ── Dark green CTA footer ── */}
        <View
          style={{
            backgroundColor: '#102418',
            marginTop: 36,
            paddingTop: 26,
            paddingHorizontal: 28,
            paddingBottom: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f.body700, fontSize: 15, color: '#f0ead4', marginBottom: 2 }}>
              Start your family story
            </Text>
            <Text style={{ fontFamily: f.body400, fontSize: 12, color: '#486050' }}>
              Free · No credit card needed
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#b8d898',
              paddingVertical: 13,
              paddingHorizontal: 22,
              borderRadius: 100,
            }}
          >
            <Text style={{ fontFamily: f.body800, fontSize: 14, color: '#0b2117' }}>Start →</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ManifestPoint({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-start' }}>
      <Text
        style={{
          fontFamily: f.display700,
          fontSize: 54,
          color: '#e2ceac',
          lineHeight: 54,
          width: 54,
        }}
      >
        {n}
      </Text>
      <View style={{ flex: 1, paddingTop: 10 }}>
        <Text style={{ fontFamily: f.body800, fontSize: 14, color: '#1a2616', marginBottom: 4 }}>{title}</Text>
        <Text style={{ fontFamily: f.body400, fontSize: 12.5, color: '#7a6248', lineHeight: 18.75 }}>{body}</Text>
      </View>
    </View>
  );
}
