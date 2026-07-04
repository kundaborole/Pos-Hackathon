"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveProductAction(payload: {
  id?: string;
  name: string;
  category_id: string;
  base_price: number;
  is_available: boolean;
  send_to_kitchen: boolean;
  image_url?: string | null;
}) {
  const supabase = createAdminClient();
  const profile = await requireAuth();
  const restaurant_id = profile.restaurant_id;

  if (!restaurant_id) throw new Error("No restaurant found for current user");

  if (payload.id) {
    const { error } = await supabase
      .from('products')
      .update({
        name: payload.name,
        category_id: payload.category_id,
        base_price: payload.base_price,
        is_available: payload.is_available,
        send_to_kitchen: payload.send_to_kitchen,
        image_url: payload.image_url,
      })
      .eq('id', payload.id)
      .eq('restaurant_id', restaurant_id);
    
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('products')
      .insert({
        restaurant_id,
        name: payload.name,
        category_id: payload.category_id,
        base_price: payload.base_price,
        is_available: payload.is_available,
        send_to_kitchen: payload.send_to_kitchen,
        image_url: payload.image_url,
      });
      
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/products');
  return { success: true };
}
