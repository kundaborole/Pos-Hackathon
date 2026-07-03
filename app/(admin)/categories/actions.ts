"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

export async function saveCategoryAction(payload: { id?: string; name: string }) {
  const supabase = createAdminClient();
  
  // Use the actual authenticated user's restaurant ID
  const profile = await requireAuth();
  const restaurant_id = profile.restaurant_id;

  if (!restaurant_id) throw new Error("No restaurant found for current user");

  if (payload.id) {
    const { error } = await supabase
      .from('categories')
      .update({ name: payload.name })
      .eq('id', payload.id)
      .eq('restaurant_id', restaurant_id);
    
    if (error) {
      console.error("Update category error:", error);
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('categories')
      .insert({
        name: payload.name,
        restaurant_id: restaurant_id,
        is_active: true
      });
      
    if (error) {
      console.error("Insert category error:", error);
      return { success: false, error: error.message };
    }
  }
  
  revalidatePath('/categories');
  return { success: true };
}
