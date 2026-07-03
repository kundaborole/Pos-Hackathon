"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

export async function saveFloorAction(payload: { id?: string; name: string; is_active: boolean }) {
  const supabase = createAdminClient();
  
  // Use the actual authenticated user's restaurant ID
  const profile = await requireAuth();
  const restaurant_id = profile.restaurant_id;

  if (!restaurant_id) throw new Error("No restaurant found for current user");

  if (payload.id) {
    const { error } = await supabase
      .from('floors')
      .update({ name: payload.name, is_active: payload.is_active })
      .eq('id', payload.id)
      .eq('restaurant_id', restaurant_id);
    
    if (error) {
      console.error("Update floor error:", error);
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('floors')
      .insert({
        name: payload.name,
        restaurant_id: restaurant_id,
        is_active: payload.is_active
      });
      
    if (error) {
      console.error("Insert floor error:", error);
      return { success: false, error: error.message };
    }
  }
  
  revalidatePath('/floors');
  return { success: true };
}
