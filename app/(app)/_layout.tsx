import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSupabase } from '../../src/lib/supabase';
import { DataProvider, useData } from '../../src/lib/store';
import { Splash } from '../../src/components/forms';
import { Onboarding } from '../../src/components/Onboarding';
import { color } from '../../src/theme/tokens';

/**
 * App stack: the (tabs) group is the home, and every other screen is pushed as
 * a card so the back button returns to wherever you came from (not always Today).
 */
function Shell() {
  const { loading, children } = useData();
  if (loading) return <Splash />;
  if (children.length === 0) return <Onboarding />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.canvas } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
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
