"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePOSTerminalAction(payload: {
  id?: string;
  name: string;
  location: string;
  is_active: boolean;
}) {
  const supabase = createAdminClient();
  const profile = await requireAuth();
  const restaurant_id = profile.restaurant_id;

  if (!restaurant_id) throw new Error("No restaurant found for current user");

  if (payload.id) {
    const { error } = await supabase
      .from('pos_terminals')
      .update({
        name: payload.name,
        location: payload.location,
        is_active: payload.is_active,
      })
      .eq('id', payload.id)
      .eq('restaurant_id', restaurant_id);
    
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('pos_terminals')
      .insert({
        restaurant_id,
        name: payload.name,
        location: payload.location,
        is_active: payload.is_active,
      });
      
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/terminals');
  return { success: true };
}
