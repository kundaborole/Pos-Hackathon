"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Edit2, ChefHat, Loader2 } from "lucide-react";

import { saveKitchenStationAction } from "./actions";
import { useRouter } from "next/navigation";

import { Database } from "@/types/supabase";
type Station = Database['public']['Tables']['kitchen_stations']['Row'] & { active?: boolean | null; categories: string[] };
type Category = Database['public']['Tables']['categories']['Row'];

export default function KitchenClient({ initialStations, allCategories }: { initialStations: Station[], allCategories: Category[] }) {
  const router = useRouter();
  
  const formattedStations = initialStations.map(s => ({
    ...s,
    active: s.is_active !== undefined ? s.is_active : true,
  }));

  const [stations, setStations] = React.useState(formattedStations);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStations(formattedStations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStations]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStation, setEditingStation] = React.useState<Station | null>(null);
  
  // Track selected categories in form
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

  const [isPending, startTransition] = React.useTransition();

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    // Find category IDs that belong to this station
    const assignedIds = allCategories
      .filter(c => c.kitchen_station_id === station.id)
      .map(c => c.id);
    setSelectedCategoryIds(assignedIds);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStation(null);
    setSelectedCategoryIds([]);
  };

  const handleSaveStation = async (formData: FormData) => {
    startTransition(async () => {
      const name = formData.get("name") as string;
      const is_active = editingStation ? (editingStation.active ?? true) : true;

      if (!name) return;

      const res = await saveKitchenStationAction({
        id: editingStation?.id,
        name,
        is_active,
        categoryIds: selectedCategoryIds
      });

      if (res.success) {
        handleCloseModal();
        router.refresh();
      } else {
        alert("Failed to save kitchen station: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Kitchen Configuration" 
        description="Manage kitchen routing, stations, and printer mappings." 
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Station
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map(station => (
          <Card key={station.id} className="border border-border-warm bg-bg-surface overflow-hidden">
            <div className="bg-bg-secondary p-4 flex justify-between items-start border-b border-border-warm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ChefHat className="h-5 w-5 text-text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{station.name}</h3>
                  <StatusBadge 
                    status={station.active ? "success" : "inactive"} 
                    label={station.active ? "Active" : "Offline"} 
                    className="mt-1 scale-90 origin-left"
                  />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(station)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Assigned Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {station.categories.map((cat, idx) => (
                    <span key={idx} className="text-xs font-medium bg-bg-secondary px-2 py-1 rounded-md text-text-primary border border-border-warm">
                      {cat}
                    </span>
                  ))}
                  {station.categories.length === 0 && (
                    <span className="text-xs text-text-secondary italic">No categories assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingStation ? "Edit Kitchen Station" : "Add Kitchen Station"}
      >
        <form action={handleSaveStation} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Station Name</label>
            <Input name="name" defaultValue={editingStation?.name || ""} placeholder="e.g. Grill Station" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Assigned Categories</label>
            <div className="border border-border-warm rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-bg-secondary">
              {allCategories.length === 0 ? (
                <div className="text-sm text-text-secondary italic">No categories available.</div>
              ) : (
                allCategories.map(cat => (
                  <label key={cat.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border-warm text-ready-blue focus:ring-ready-blue"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategoryIds(prev => [...prev, cat.id]);
                        } else {
                          setSelectedCategoryIds(prev => prev.filter(id => id !== cat.id));
                        }
                      }}
                    />
                    <span className="text-sm text-text-primary">{cat.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border-warm mt-4 pt-4">
            <div>
              <div className="text-sm font-medium text-text-primary">Active Status</div>
              <div className="text-xs text-text-secondary">Route tickets to this station</div>
            </div>
            <Switch checked={editingStation ? (editingStation.active ?? true) : true} readOnly />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm mt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Station
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
