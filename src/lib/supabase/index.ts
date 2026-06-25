// Everly thin-server data layer (Supabase).
// Scope (PRD §3/§11): accounts/auth, billing mirror, live config + feature
// flags, audit, and the zero-knowledge E2E relay (ciphertext only).
// NEVER child/maternal/health data — that is on-device.

export { supabase, SUPABASE_URL } from './client';
export * from './types';
export * from './config';
export * from './auth';
export * from './billing';
export { SupabaseProvider, useSupabase } from './SupabaseProvider';
