import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { color, font } from '../theme/tokens';

/**
 * Native fallback for the interactive web map. Shows the picked coordinate and
 * opens the full map app, where the user can drop a precise pin.
 */
export default function MapPicker({ lat, lon, height = 220 }: { lat: number; lon: number; height?: number; onPick?: (lat: number, lon: number) => void }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`)}
      style={{ height, borderRadius: 14, backgroundColor: '#E8ECEF', alignItems: 'center', justifyContent: 'center', gap: 6 }}
    >
      <Text style={{ fontSize: 30 }}>🗺️</Text>
      <Text style={{ fontFamily: font.body700, fontSize: 12, color: color.inkSecondary }}>Open map to place the pin</Text>
      <Text style={{ fontFamily: font.body500, fontSize: 10.5, color: color.muted }}>{lat.toFixed(4)}, {lon.toFixed(4)}</Text>
    </Pressable>
  );
}
