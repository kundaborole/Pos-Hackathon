import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import TerminalsClient from "./terminals-client";

export const dynamic = 'force-dynamic';

export default async function TerminalsPage() {
  const supabase = createAdminClient();
  const profile = await requireAuth();

  const { data: terminals, error } = await supabase
    .from("pos_terminals")
    .select("*")
    .eq("restaurant_id", profile.restaurant_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching terminals:", error);
  }

  const { data: cashiers, error: cashiersError } = await supabase
    .from("profiles")
    .select("id, full_name, staff_id")
    .eq("restaurant_id", profile.restaurant_id)
    .eq("role", "cashier");

  if (cashiersError) {
    console.error("Error fetching cashiers:", cashiersError);
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("pos_sessions")
    .select("*, profiles:cashier_id(full_name)")
    .eq("restaurant_id", profile.restaurant_id);

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
  }

  return <TerminalsClient 
    initialTerminals={terminals || []} 
    // @ts-expect-error Partial type
    cashiers={cashiers || []} 
    initialSessions={sessions || []}
  />;
}
