import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useSupabase } from '../../src/lib/supabase';
import { DataProvider, useData } from '../../src/lib/store';
import { Splash } from '../../src/components/forms';
import { Onboarding } from '../../src/components/Onboarding';
import { color, font } from '../../src/theme/tokens';
import { Home, Calendar, Heart, Clock, Settings } from '../../src/components/icons';

function AppTabs() {
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
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontFamily: font.body600, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color: c, size }) => <Home size={size} color={c as string} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ color: c, size }) => <Calendar size={size} color={c as string} /> }} />
      <Tabs.Screen name="health" options={{ title: 'Health', tabBarIcon: ({ color: c, size }) => <Heart size={size} color={c as string} /> }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline', tabBarIcon: ({ color: c, size }) => <Clock size={size} color={c as string} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color: c, size }) => <Settings size={size} color={c as string} /> }} />
      {/* Non-tab routes (reachable via navigation, hidden from the tab bar). */}
      <Tabs.Screen name="plans" options={{ href: null }} />
      <Tabs.Screen name="kick-counter" options={{ href: null }} />
      <Tabs.Screen name="contractions" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="routines" options={{ href: null }} />
      <Tabs.Screen name="child/[id]" options={{ href: null }} />
    </Tabs>
  );
}

/** Routes by on-device state: loading → splash, no children → onboarding, else tabs. */
function Shell() {
  const { loading, children } = useData();
  if (loading) return <Splash />;
  if (children.length === 0) return <Onboarding />;
  return <AppTabs />;
}

/** The app is for signed-in users only; bounce to welcome otherwise. */
export default function AppLayout() {
  const { loading, session } = useSupabase();
  if (loading) return <Splash />;
  if (!session) return <Redirect href="/(auth)/welcome" />;

  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}
