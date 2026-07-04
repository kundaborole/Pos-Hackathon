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

export async function requireAuth(): Promise<Profile> {
  // Bypassed for hackathon demo — uses a real admin profile from the DB
  return {
    id: '87935d5b-1e15-4e0b-a243-7c433633bb89',
    restaurant_id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Admin User',
    email: 'admin@cafehub.com',
    role: 'admin',
    staff_id: 'STAFF001',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Redirects if the user does not have one of the required roles.
 */
export async function requireRole(allowedRoles: Database['public']['Enums']['staff_role'][]) {
  const profile = await requireAuth();

  // Bypassed for hackathon demo
  // if (!allowedRoles.includes(profile.role)) {
  //   redirect('/');
  // }

  return profile;
}
