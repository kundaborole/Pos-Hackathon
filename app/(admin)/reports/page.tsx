import { getDashboardMetrics } from "@/lib/api/metrics";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportsClient from "./reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('restaurant_id').eq('id', user.id).single();
  if (!profile) return redirect('/login');

  const metrics = await getDashboardMetrics(profile.restaurant_id);

  return <ReportsClient metrics={metrics} />;
}
