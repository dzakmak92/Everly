import React from 'react';
import { Pressable, View } from 'react-native';
import { Tabs } from 'expo-router';
import { color, font, shadow } from '../../../src/theme/tokens';
import { Home, Calendar, User, Settings, Plus } from '../../../src/components/icons';

/** Raised center FAB used as the quick-add tab button. */
function FabButton({ onPress }: { onPress?: (e: any) => void }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[{ width: 54, height: 54, borderRadius: 27, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center', marginTop: -22 }, shadow.periwinkleButton]}>
        <Plus size={26} color="#fff" />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.muted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: color.hairline,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 8,
          paddingBottom: 18,
        },
        tabBarLabelStyle: { fontFamily: font.body600, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color: c, size }) => <Home size={size} color={c as string} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ color: c, size }) => <Calendar size={size} color={c as string} /> }} />
      <Tabs.Screen name="quick-add" options={{ title: '', tabBarButton: (p) => <FabButton onPress={p.onPress as any} /> }} />
      <Tabs.Screen name="family" options={{ title: 'Family', tabBarIcon: ({ color: c, size }) => <User size={size} color={c as string} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color: c, size }) => <Settings size={size} color={c as string} /> }} />
    </Tabs>
  );
}
