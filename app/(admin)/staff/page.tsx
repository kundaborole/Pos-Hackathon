import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import StaffClient from "./staff-client";

export default async function StaffPage() {
  const supabase = createAdminClient();
  const profile = await requireAuth();

  const { data: staffList, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("restaurant_id", profile.restaurant_id)
    .in("role", ["admin", "cashier", "waiter", "kitchen"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching staff:", error);
  }

  return <StaffClient initialStaff={staffList || []} />;
}
