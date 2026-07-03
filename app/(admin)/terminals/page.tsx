import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import TerminalsClient from "./terminals-client";

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

  // We are currently mocking sessions
  return <TerminalsClient initialTerminals={terminals || []} />;
}
