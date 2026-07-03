"use client";

import * as React from "react";
import Link from "next/link";
import { OperationalHeader } from "@/components/layout/operational-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Menu, Users, Clock } from "lucide-react";
import { MOCK_FLOORS, MOCK_TABLES, RestaurantTable } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Helper to determine border and background colors based on status
const getTableColors = (status: RestaurantTable['status']) => {
  switch (status) {
    case 'Available': return "border-primary-green bg-primary-green/5";
    case 'Occupied': return "border-ready-blue bg-ready-blue/5";
    case 'Preparing': return "border-amber bg-amber/5";
    case 'Ready': return "border-coral bg-coral/5";
    case 'Waiting Payment': return "border-muted-gold bg-muted-gold/10";
    case 'Cleaning': return "border-text-secondary bg-bg-secondary";
    default: return "border-border-warm bg-bg-surface";
  }
};

const getStatusBadgeColors = (status: RestaurantTable['status']) => {
  switch (status) {
    case 'Available': return "bg-primary-green text-white";
    case 'Occupied': return "bg-ready-blue text-white";
    case 'Preparing': return "bg-amber text-white";
    case 'Ready': return "bg-coral text-white";
    case 'Waiting Payment': return "bg-muted-gold text-white";
    case 'Cleaning': return "bg-text-secondary text-white";
    default: return "bg-text-secondary text-white";
  }
};

export default function OperationalFloorPage() {
  const [activeFloorId, setActiveFloorId] = React.useState(MOCK_FLOORS[0].id);
  const [search, setSearch] = React.useState("");

  const activeTables = MOCK_TABLES.filter(t => 
    t.floorId === activeFloorId && t.number.includes(search)
  );

  const totalSeats = activeTables.reduce((acc, t) => acc + t.seats, 0);
  const occupiedTables = activeTables.filter(t => t.status !== 'Available' && t.status !== 'Cleaning').length;

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
            {MOCK_FLOORS.map(floor => (
              <Button 
                key={floor.id}
                variant={activeFloorId === floor.id ? "primary" : "ghost"}
                onClick={() => setActiveFloorId(floor.id)}
                className={activeFloorId === floor.id ? "" : "bg-bg-secondary text-text-primary"}
              >
                {floor.name}
              </Button>
            ))}
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
              <Card key={table.id} className={cn("border-2 shadow-sm transition-all hover:shadow-md", getTableColors(table.status))}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold text-text-primary tracking-tight">T-{table.number}</div>
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Users className="h-3 w-3" />
                      <span>{table.seats}</span>
                    </div>
                  </div>

                  <div className="mt-1 mb-4 flex-1">
                    <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", getStatusBadgeColors(table.status))}>
                      {table.status}
                    </div>
                    {table.currentOrderId && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-medium text-text-primary">{table.currentOrderId}</div>
                        <div className="font-bold text-text-primary">${table.currentAmount?.toFixed(2)}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto border-t border-black/10 pt-3">
                    <div className="flex items-center text-xs text-text-secondary">
                      {table.timeOccupied && (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{table.timeOccupied}</span>
                        </>
                      )}
                    </div>
                    
                    {table.status === 'Available' && (
                      <Link href="/pos">
                        <Button size="sm" variant="secondary" className="h-7 text-xs px-2">Open</Button>
                      </Link>
                    )}
                    {table.status === 'Occupied' && (
                      <Link href={`/orders/${table.currentOrderId}`}>
                        <Button size="sm" variant="secondary" className="h-7 text-xs px-2">Order</Button>
                      </Link>
                    )}
                    {table.status === 'Preparing' && (
                      <Link href={`/orders/${table.currentOrderId}`}>
                        <Button size="sm" variant="secondary" className="h-7 text-xs px-2">View</Button>
                      </Link>
                    )}
                    {table.status === 'Ready' && (
                      <Link href={`/orders/${table.currentOrderId}`}>
                        <Button size="sm" className="h-7 text-xs px-2 bg-coral hover:bg-coral/90 text-white">Serve</Button>
                      </Link>
                    )}
                    {table.status === 'Waiting Payment' && (
                      <Link href={`/payment/${table.currentOrderId}`}>
                        <Button size="sm" className="h-7 text-xs px-2 bg-muted-gold hover:bg-muted-gold/90 text-white border-none shadow-sm flex items-center">
                          Pay <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                    {table.status === 'Cleaning' && (
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
