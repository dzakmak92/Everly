import { supabase } from './client';
import type { Profile } from './types';

/**
 * Account + auth helpers (thin server only). No child/maternal/health data is
 * ever read or written here — that all lives on-device. This module touches
 * exactly: Supabase Auth and the `profiles` account/billing mirror.
 */

export async function signUp(params: { email: string; password: string; name?: string }) {
  return supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: params.name ? { name: params.name } : undefined },
  });
}

export async function signIn(params: { email: string; password: string }) {
  return supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Fetch the signed-in user's profile (account + billing mirror). */
export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) return null;
  return data;
}

/** Update the user-editable account fields. Billing columns are server-guarded. */
export async function updateMyProfile(
  patch: Partial<Pick<Profile, 'name' | 'locale' | 'currency'>>,
) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  return supabase.from('profiles').update(patch).eq('id', auth.user.id);
}

/** Whether the signed-in account has any operator-admin role (RBAC, PRD §10.6). */
export async function isAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return Boolean(data);
}
