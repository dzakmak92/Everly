import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Connection settings. The anon/publishable key is *designed* to be public —
 * every row is protected by Row-Level Security (see the SQL migrations), so the
 * key only grants the access RLS already permits. Override via EXPO_PUBLIC_*
 * env vars (e.g. for staging) without code changes.
 */
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ertsbomehtfotflbdndm.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_FumsAiKXaH55wrrASjQQ5g_Lu7QwUL-';

const isWeb = Platform.OS === 'web';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // On web the SDK uses localStorage; on native we hand it AsyncStorage.
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Only the web/PWA flow returns the session in the URL hash.
    detectSessionInUrl: isWeb,
  },
});

export { SUPABASE_URL };
