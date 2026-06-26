import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useSupabase } from '../../src/lib/supabase';
import { DataProvider, useData } from '../../src/lib/store';
import { Splash } from '../../src/components/forms';
import { Onboarding } from '../../src/components/Onboarding';
import { color, font } from '../../src/theme/tokens';
import { Home, Calendar, Heart, Clock, Grid } from '../../src/components/icons';

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
          height: 76,
          paddingTop: 8,
          paddingBottom: 18,
        },
        tabBarLabelStyle: { fontFamily: font.body600, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color: c, size }) => <Home size={size} color={c as string} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: ({ color: c, size }) => <Calendar size={size} color={c as string} /> }} />
      <Tabs.Screen name="health" options={{ title: 'Health', tabBarIcon: ({ color: c, size }) => <Heart size={size} color={c as string} /> }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline', tabBarIcon: ({ color: c, size }) => <Clock size={size} color={c as string} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color: c, size }) => <Grid size={size} color={c as string} /> }} />
      {/* Non-tab routes (reachable via navigation, hidden from the tab bar). */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="plans" options={{ href: null }} />
      <Tabs.Screen name="kick-counter" options={{ href: null }} />
      <Tabs.Screen name="contractions" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="routines" options={{ href: null }} />
      <Tabs.Screen name="coparent" options={{ href: null }} />
      <Tabs.Screen name="pregnancy" options={{ href: null }} />
      <Tabs.Screen name="maternal" options={{ href: null }} />
      <Tabs.Screen name="epds" options={{ href: null }} />
      <Tabs.Screen name="digest" options={{ href: null }} />
      <Tabs.Screen name="timezones" options={{ href: null }} />
      <Tabs.Screen name="insights" options={{ href: null }} />
      <Tabs.Screen name="quick-add" options={{ href: null }} />
      <Tabs.Screen name="nightlog" options={{ href: null }} />
      <Tabs.Screen name="rhythm" options={{ href: null }} />
      <Tabs.Screen name="kiosk" options={{ href: null }} />
      <Tabs.Screen name="preg-week" options={{ href: null }} />
      <Tabs.Screen name="preg-birthprep" options={{ href: null }} />
      <Tabs.Screen name="preg-names" options={{ href: null }} />
      <Tabs.Screen name="preg-care" options={{ href: null }} />
      <Tabs.Screen name="preg-appointments" options={{ href: null }} />
      <Tabs.Screen name="preg-triage" options={{ href: null }} />
      <Tabs.Screen name="preg-vitals" options={{ href: null }} />
      <Tabs.Screen name="mat-preconception" options={{ href: null }} />
      <Tabs.Screen name="mat-care" options={{ href: null }} />
      <Tabs.Screen name="mat-pelvic" options={{ href: null }} />
      <Tabs.Screen name="mat-appointments" options={{ href: null }} />
      <Tabs.Screen name="mat-timeline" options={{ href: null }} />
      <Tabs.Screen name="mat-again" options={{ href: null }} />
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
