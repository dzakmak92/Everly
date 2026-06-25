import React from 'react';
import { Redirect } from 'expo-router';
import { useSupabase } from '../src/lib/supabase';
import { Splash } from '../src/components/forms';

/**
 * Entry router. Sends signed-in users to the app, everyone else to the
 * welcome/auth flow. The design gallery lives separately at /gallery.
 */
export default function Index() {
  const { loading, session } = useSupabase();
  if (loading) return <Splash />;
  return <Redirect href={session ? '/(app)' : '/(auth)/welcome'} />;
}
