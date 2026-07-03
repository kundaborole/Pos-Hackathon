import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import KitchenClient from "./kitchen-client";

export default async function KitchenConfigPage() {
  const supabase = createAdminClient();
  const profile = await requireAuth();

  const [{ data: stations }, { data: categories }] = await Promise.all([
    supabase
      .from("kitchen_stations")
      .select("*")
      .eq("restaurant_id", profile.restaurant_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", profile.restaurant_id)
  ]);

  // We need to map categories to their respective stations
  const formattedStations = (stations || []).map(station => {
    const stationCategories = (categories || [])
      .filter(c => c.kitchen_station_id === station.id)
      .map(c => c.name);
      
    return {
      ...station,
      categories: stationCategories
    };
  });

  return (
    <KitchenClient 
      initialStations={formattedStations} 
      allCategories={categories || []} 
    />
  );
}
