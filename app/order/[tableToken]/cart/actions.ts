"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitQrOrderAction(
  publicToken: string,
  items: Record<string, unknown>[],
  specialInstructions: string
) {
  const supabase = await createClient();

  // Create payload for the RPC
  const payload = {
    public_token: publicToken,
    items,
    special_instructions: specialInstructions,
    idempotency_key: crypto.randomUUID()
  };

  const { data, error } = await supabase.rpc('create_qr_order', { payload });

  if (error) {
    console.error('Error submitting QR order:', error);
    return { success: false, error: 'Failed to submit order. Please try again.' };
  }

  if (data && data.success) {
    return { success: true, orderId: data.order_id };
  }

  return { success: false, error: data?.message || 'Unknown error occurred' };
}
