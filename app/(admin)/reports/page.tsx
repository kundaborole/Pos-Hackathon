import { getDashboardMetrics } from "@/lib/api/metrics";

import ReportsClient from "./reports-client";

export default async function ReportsPage() {
  const profile = { restaurant_id: process.env.NEXT_PUBLIC_RESTAURANT_ID || '11111111-1111-1111-1111-111111111111' };

  const metrics = await getDashboardMetrics(profile.restaurant_id);

  return <ReportsClient metrics={metrics} />;
}
