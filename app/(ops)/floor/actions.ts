"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function updateTableStatusAction(tableId: string, status: string) {
  const profile = await requireAuth();
  
  if (!['admin', 'waiter', 'cashier'].includes(profile.role)) {
    throw new Error('Unauthorized role for this action');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('restaurant_tables')
    .update({ status })
    .eq('id', tableId)
    .eq('restaurant_id', profile.restaurant_id);

  if (error) {
    return { success: false, error: 'Failed to update table status' };
  }

  return { success: true };
}
