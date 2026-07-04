import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { redirect } from 'next/navigation';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Returns the currently authenticated user, if any.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Returns the profile for the currently authenticated user.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

/**
 * Redirects if the user is not authenticated or not active.
 * Used to protect Server Components.
 */
export async function requireAuth() {
  const profile = await getCurrentProfile();
  
  if (!profile) {
    redirect('/login');
  }

  if (!profile.is_active) {
    redirect('/login?error=account_inactive');
  }

  return profile;
}

/**
 * Redirects if the user does not have one of the required roles.
 */
export async function requireRole(allowedRoles: Database['public']['Enums']['staff_role'][]) {
  const profile = await requireAuth();

  if (!allowedRoles.includes(profile.role)) {
    redirect('/');
  }

  return profile;
}
