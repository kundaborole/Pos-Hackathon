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

export async function saveTableAction(payload: { 
  id?: string; 
  floor_id: string; 
  table_number: string; 
  capacity: number; 
  is_active: boolean; 
  qr_token: string;
}) {
  const supabase = createAdminClient();
  const profile = await requireAuth();
  const restaurant_id = profile.restaurant_id;

  if (!restaurant_id) throw new Error("No restaurant found for current user");

  if (payload.id) {
    const { error } = await supabase
      .from('restaurant_tables')
      .update({
        table_number: payload.table_number,
        capacity: payload.capacity,
        is_active: payload.is_active,
        floor_id: payload.floor_id,
        qr_token: payload.qr_token
      })
      .eq('id', payload.id)
      .eq('restaurant_id', restaurant_id);
    
    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `Table number "${payload.table_number}" already exists in your restaurant.` };
      }
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('restaurant_tables')
      .insert({
        restaurant_id,
        floor_id: payload.floor_id,
        table_number: payload.table_number,
        capacity: payload.capacity,
        is_active: payload.is_active,
        qr_token: payload.qr_token,
        status: 'available'
      });
      
    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `Table number "${payload.table_number}" already exists in your restaurant.` };
      }
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/floors');
  return { success: true };
}

export async function deleteTableAction(tableId: string) {
  const supabase = createAdminClient();
  const profile = await requireAuth();
  
  if (!profile.restaurant_id) throw new Error("No restaurant found");

  const { error } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', tableId)
    .eq('restaurant_id', profile.restaurant_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/floors');
  return { success: true };
}
