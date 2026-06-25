import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSupabase } from '../../src/lib/supabase';
import { Splash } from '../../src/components/forms';

/** The app is for signed-in users only; bounce to welcome otherwise. */
export default function AppLayout() {
  const { loading, session } = useSupabase();
  if (loading) return <Splash />;
  if (!session) return <Redirect href="/(auth)/welcome" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
