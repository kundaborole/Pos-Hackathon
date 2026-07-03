"use client";

import * as React from "react";
import Link from "next/link";
import { OperationalHeader } from "@/components/layout/operational-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Menu, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloorWithTables } from "@/lib/api/floors";
import { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type TableStatus = Database['public']['Enums']['table_status'];

// Helper to determine border and background colors based on status
const getTableColors = (status: TableStatus) => {
  switch (status) {
    case 'available': return "border-primary-green bg-primary-green/5";
    case 'occupied': return "border-ready-blue bg-ready-blue/5";
    case 'preparing': return "border-amber bg-amber/5";
    case 'ready': return "border-coral bg-coral/5";
    case 'waiting_payment': return "border-muted-gold bg-muted-gold/10";
    case 'cleaning': return "border-text-secondary bg-bg-secondary";
    default: return "border-border-warm bg-bg-surface";
  }
};

const getStatusBadgeColors = (status: TableStatus) => {
  switch (status) {
    case 'available': return "bg-primary-green text-white";
    case 'occupied': return "bg-ready-blue text-white";
    case 'preparing': return "bg-amber text-white";
    case 'ready': return "bg-coral text-white";
    case 'waiting_payment': return "bg-muted-gold text-white";
    case 'cleaning': return "bg-text-secondary text-white";
    default: return "bg-text-secondary text-white";
  }
};

const formatStatus = (status: TableStatus) => {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function OperationalFloorClient({
  initialFloors
}: {
  initialFloors: FloorWithTables[];
}) {
  const [activeFloorId, setActiveFloorId] = React.useState(initialFloors[0]?.id || "");
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const supabase = createClient();
    
    // We can just listen to the whole restaurant_tables table and refresh the view
    // so we get fresh floors & tables data securely from the server.
    const channel = supabase.channel('floor_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_tables'
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const activeFloor = initialFloors.find(f => f.id === activeFloorId);
  const activeTables = (activeFloor?.tables || []).filter(t => 
    t.table_number.includes(search)
  );

  const totalSeats = activeTables.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const occupiedTables = activeTables.filter(t => t.status !== 'available' && t.status !== 'cleaning').length;

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
      <OperationalHeader 
        title="Floor View"
        actions={
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>
        }
      />

      {/* Main Floor Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Controls & Occupancy Summary */}
        <div className="bg-bg-surface border-b border-border-warm p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex space-x-2">
            {initialFloors.map(floor => (
              <Button 
                key={floor.id}
                variant={activeFloorId === floor.id ? "primary" : "ghost"}
                onClick={() => setActiveFloorId(floor.id)}
                className={activeFloorId === floor.id ? "" : "bg-bg-secondary text-text-primary"}
              >
                {floor.name}
              </Button>
            ))}
            {initialFloors.length === 0 && (
              <div className="text-sm text-text-secondary py-2 px-4">No active floors.</div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input 
                placeholder="Search table..." 
                className="pl-9 w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-text-primary">{occupiedTables} / {activeTables.length}</div>
                <div className="text-text-secondary text-xs">Tables Active</div>
              </div>
              <div className="text-center border-l border-border-warm pl-4">
                <div className="font-bold text-text-primary">{totalSeats}</div>
                <div className="text-text-secondary text-xs">Total Capacity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="px-4 py-2 shrink-0 flex items-center justify-center space-x-4 flex-wrap gap-y-2 bg-bg-secondary border-b border-border-warm text-xs font-medium">
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-primary-green"></div><span>Available</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-ready-blue"></div><span>Occupied</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-amber"></div><span>Preparing</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-coral"></div><span>Ready</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-muted-gold"></div><span>Waiting Payment</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 rounded-full bg-text-secondary"></div><span>Cleaning</span></div>
        </div>

        {/* Tables Grid */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-bg-base">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {activeTables.map(table => (
              <Card key={table.id} className={cn("border-2 shadow-sm transition-all hover:shadow-md", getTableColors(table.status || 'available'))}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold text-text-primary tracking-tight">T-{table.table_number}</div>
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Users className="h-3 w-3" />
                      <span>{table.capacity || 2}</span>
                    </div>
                  </div>

                  <div className="mt-1 mb-4 flex-1">
                    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", getStatusBadgeColors(table.status || 'available'))}>
                      {formatStatus(table.status || 'available')}
                    </div>
                    {/* Add current order ID / amount here later when orders API supports it efficiently by table */}
                  </div>

                  <div className="flex items-center justify-between mt-auto border-t border-black/10 pt-3">
                    <div className="flex items-center text-xs text-text-secondary">
                      {/* Active time omitted for now until realtime status tracks it */}
                    </div>
                    
                    {(table.status === 'available' || !table.status) && (
                      <Link href={`/pos?table_id=${table.id}`}>
                        <Button size="sm" variant="secondary" className="h-7 text-xs px-2">Open</Button>
                      </Link>
                    )}
                    {table.status === 'occupied' && (
                      <Link href={`/pos?table_id=${table.id}`}>
                        <Button size="sm" variant="secondary" className="h-7 text-xs px-2">Order</Button>
                      </Link>
                    )}
                    {table.status === 'preparing' && (
                      <Button size="sm" variant="secondary" className="h-7 text-xs px-2">View</Button>
                    )}
                    {table.status === 'ready' && (
                      <Button size="sm" className="h-7 text-xs px-2 bg-coral hover:bg-coral/90 text-white">Serve</Button>
                    )}
                    {table.status === 'waiting_payment' && (
                      <Button size="sm" className="h-7 text-xs px-2 bg-muted-gold hover:bg-muted-gold/90 text-white border-none shadow-sm flex items-center">
                        Pay <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                    {table.status === 'cleaning' && (
                      <Button size="sm" variant="secondary" className="h-7 text-xs px-2">Available</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
