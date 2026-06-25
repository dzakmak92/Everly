import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSupabase } from '../../src/lib/supabase';
import { Splash } from '../../src/components/forms';

/** Auth screens are only for signed-out users; bounce to the app if signed in. */
export default function AuthLayout() {
  const { loading, session } = useSupabase();
  if (loading) return <Splash />;
  if (session) return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
