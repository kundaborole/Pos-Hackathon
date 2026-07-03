"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveKitchenStationAction(payload: {
  id?: string;
  name: string;
  is_active: boolean;
  categoryIds?: string[];
}) {
  const supabase = createAdminClient();
  const profile = await requireAuth();
  const restaurant_id = profile.restaurant_id;

  if (!restaurant_id) throw new Error("No restaurant found for current user");

  let stationId = payload.id;

  if (stationId) {
    const { error } = await supabase
      .from('kitchen_stations')
      .update({
        name: payload.name,
        is_active: payload.is_active,
      })
      .eq('id', stationId)
      .eq('restaurant_id', restaurant_id);
    
    if (error) return { success: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from('kitchen_stations')
      .insert({
        restaurant_id,
        name: payload.name,
        is_active: payload.is_active,
      })
      .select('id')
      .single();
      
    if (error) return { success: false, error: error.message };
    stationId = data.id;
  }

  // Update categories if categoryIds are provided
  if (stationId && payload.categoryIds) {
    // 1. Unassign categories that were previously assigned to this station but are no longer in the list
    await supabase
      .from('categories')
      .update({ kitchen_station_id: null })
      .eq('kitchen_station_id', stationId)
      .eq('restaurant_id', restaurant_id);
      
    // 2. Assign the selected categories
    if (payload.categoryIds.length > 0) {
      await supabase
        .from('categories')
        .update({ kitchen_station_id: stationId })
        .in('id', payload.categoryIds)
        .eq('restaurant_id', restaurant_id);
    }
  }

  revalidatePath('/kitchen-config');
  return { success: true };
}
