import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useSupabase } from '../../src/lib/supabase';
import { DataProvider } from '../../src/lib/store';
import { Splash } from '../../src/components/forms';
import { color, font } from '../../src/theme/tokens';
import { Home, Calendar, Heart, Clock, Settings } from '../../src/components/icons';

/** The app is for signed-in users only; bounce to welcome otherwise. */
export default function AppLayout() {
  const { loading, session } = useSupabase();
  if (loading) return <Splash />;
  if (!session) return <Redirect href="/(auth)/welcome" />;

  return (
    <DataProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.muted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: color.hairline,
          borderTopWidth: 1,
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontFamily: font.body600, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: ({ color: c, size }) => <Home size={size} color={c as string} /> }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar', tabBarIcon: ({ color: c, size }) => <Calendar size={size} color={c as string} /> }}
      />
      <Tabs.Screen
        name="health"
        options={{ title: 'Health', tabBarIcon: ({ color: c, size }) => <Heart size={size} color={c as string} /> }}
      />
      <Tabs.Screen
        name="timeline"
        options={{ title: 'Timeline', tabBarIcon: ({ color: c, size }) => <Clock size={size} color={c as string} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color: c, size }) => <Settings size={size} color={c as string} /> }}
      />
    </Tabs>
    </DataProvider>
  );
}
