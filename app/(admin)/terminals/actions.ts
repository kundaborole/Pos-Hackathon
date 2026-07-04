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

export async function openSessionAction(payload: {
  terminal_id: string;
  cashier_id: string;
  opening_cash: number;
}) {
  const supabase = createAdminClient();
  const profile = await requireAuth();
  const restaurant_id = profile.restaurant_id;

  const { error } = await supabase
    .from('pos_sessions')
    .insert({
      restaurant_id,
      terminal_id: payload.terminal_id,
      cashier_id: payload.cashier_id,
      opening_cash: payload.opening_cash,
      status: 'open',
      opened_at: new Date().toISOString()
    });

  if (error) return { success: false, error: error.message };

  revalidatePath('/terminals');
  return { success: true };
}

export async function closeSessionAction(payload: {
  session_id: string;
  expected_cash: number;
  counted_cash: number;
  closing_notes?: string;
}) {
  const supabase = createAdminClient();
  const profile = await requireAuth();
  
  const { error } = await supabase
    .from('pos_sessions')
    .update({
      status: 'closed',
      expected_cash: payload.expected_cash,
      counted_cash: payload.counted_cash,
      closing_notes: payload.closing_notes,
      closed_at: new Date().toISOString()
    })
    .eq('id', payload.session_id)
    .eq('restaurant_id', profile.restaurant_id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/terminals');
  return { success: true };
}
