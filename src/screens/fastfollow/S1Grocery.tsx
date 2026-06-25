import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { color, font, shadow } from '../../theme/tokens';
import { StatusBar } from '../../components/ui';

const f = font;
const c = color;

/* S1 · Grocery List — store tabs, category groups, voice-add FAB, meal-plan sync chip. */
export default function S1Grocery() {
  return (
    <View style={{ backgroundColor: c.canvas }}>
      <StatusBar />

      {/* title + profile avatar */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 14,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: f.display700, fontSize: 22, color: c.ink }}>Grocery list</Text>
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: '#E7E4FB',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={15} height={15} viewBox="0 0 20 20" fill="#6B6FC9">
            <Circle cx="10" cy="7.5" r="5" />
            <Path d="M2 19Q2 13 10 13Q18 13 18 19Z" />
          </Svg>
        </View>
      </View>

      {/* store tabs */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', gap: 6 }}>
        <StoreTab label="All" active />
        <StoreTab label="Lidl" />
        <StoreTab label="Tesco" />
        <StoreTab label="Pharmacy" />
      </View>

      {/* meal-plan sync chip */}
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          backgroundColor: '#E7E4FB',
          borderRadius: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2} strokeLinecap="round">
          <Path d="M12 22V10M12 10C12 6 8 3 4 5M12 10C12 6 16 3 20 5" />
          <Circle cx="12" cy="4" r="2" fill="#6B6FC9" stroke="none" />
        </Svg>
        <Text style={{ flex: 1, fontFamily: f.body600, fontSize: 12, lineHeight: 17, color: '#54579E' }}>
          Add items from this week's meal plan?
        </Text>
        <Text style={{ fontFamily: f.body700, fontSize: 12, color: '#6B6FC9' }}>Add →</Text>
      </View>

      {/* category groups */}
      <View style={{ paddingHorizontal: 20, gap: 4 }}>
        <GroupLabel>Fresh produce</GroupLabel>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            overflow: 'hidden',
            shadowColor: '#33324A',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          }}
        >
          <Item name="Bananas" qty="× 6" divider />
          <Item name="Apples" qty="× 4" checked divider />
          <Item name="Avocados" qty="× 2" />
        </View>

        <GroupLabel>Baby / Oliver</GroupLabel>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            overflow: 'hidden',
            shadowColor: '#33324A',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          }}
        >
          <Item name="Whole milk" qty="× 2L" divider />
          <Item name="Formula tin" tag="Oliver" />
        </View>
      </View>

      {/* add item row */}
      <View
        style={{
          marginVertical: 12,
          marginHorizontal: 20,
          backgroundColor: '#fff',
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6FC9" strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14" />
        </Svg>
        <Text style={{ fontFamily: f.body400, fontSize: 14, color: '#C8C6DC' }}>Add item…</Text>
      </View>

      {/* voice-add FAB */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 32 }}>
        <View
          style={[
            {
              width: 52,
              height: 52,
              backgroundColor: '#6B6FC9',
              borderRadius: 26,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.periwinkleButton,
          ]}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
            <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <Line x1="12" y1="19" x2="12" y2="23" />
            <Line x1="8" y1="23" x2="16" y2="23" />
          </Svg>
        </View>
      </View>
    </View>
  );
}

function StoreTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: active ? '#6B6FC9' : '#fff',
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: active ? 16 : 14,
        borderWidth: active ? 0 : 1,
        borderColor: 'rgba(51,50,74,0.08)',
      }}
    >
      <Text
        style={{
          fontFamily: active ? f.body700 : f.body600,
          fontSize: 12,
          color: active ? '#fff' : '#6F6E86',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: f.body700,
        fontSize: 11,
        letterSpacing: 0.9,
        textTransform: 'uppercase',
        color: '#9C9AB2',
        paddingVertical: 5,
        paddingHorizontal: 4,
      }}
    >
      {children}
    </Text>
  );
}

function Item({
  name,
  qty,
  tag,
  checked = false,
  divider = false,
}: {
  name: string;
  qty?: string;
  tag?: string;
  checked?: boolean;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: 'rgba(51,50,74,0.04)',
      }}
    >
      {checked ? (
        <View
          style={{
            width: 22,
            height: 22,
            backgroundColor: '#D8F0E6',
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#3FA98A" strokeWidth={2.5} strokeLinecap="round">
            <Path d="M5 13l4 4L19 7" />
          </Svg>
        </View>
      ) : (
        <View
          style={{
            width: 22,
            height: 22,
            backgroundColor: '#F4F3FB',
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: 'rgba(51,50,74,0.12)',
          }}
        />
      )}
      <Text
        style={{
          flex: 1,
          fontFamily: f.body600,
          fontSize: 14,
          color: checked ? '#9C9AB2' : '#33324A',
          textDecorationLine: checked ? 'line-through' : 'none',
        }}
      >
        {name}
      </Text>
      {tag ? (
        <View style={{ backgroundColor: '#D8F0E6', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 }}>
          <Text style={{ fontFamily: f.body700, fontSize: 10, color: '#3FA98A' }}>{tag}</Text>
        </View>
      ) : (
        <Text style={{ fontFamily: f.body400, fontSize: 12, color: checked ? '#C8C6DC' : '#9C9AB2' }}>{qty}</Text>
      )}
    </View>
  );
}
