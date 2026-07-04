"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { FloorWithTables } from "@/lib/api/floors";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BookingClient({
  initialFloors
}: {
  initialFloors: FloorWithTables[];
}) {
  const router = useRouter();
  const [activeFloorId, setActiveFloorId] = React.useState(initialFloors[0]?.id || "");

  const activeFloor = initialFloors.find(f => f.id === activeFloorId);
  const tables = activeFloor?.tables || [];

  const handleTableClick = (table: FloorWithTables['tables'][number]) => {
    if (table.status === 'available') {
      router.push(`/qr/${table.qr_token}`);
    } else {
      alert("Please select another option, this table is occupied.");
    }
  };

  // Helper to determine table size class based on capacity
  const getTableSizeClass = (capacity: number) => {
    if (capacity <= 2) return "col-span-1 aspect-square";
    if (capacity <= 4) return "col-span-2 aspect-[2/1]";
    return "col-span-3 aspect-[3/1]";
  };

  return (
    <CustomerMobileShell hideNav={true}>
      <div className="flex flex-col min-h-screen bg-bg-surface">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-border-warm pt-safe px-4 py-4 flex items-center shadow-sm">
          <Link href="/" className="mr-4 p-2 -ml-2 rounded-full hover:bg-bg-secondary active:scale-95 transition-all">
            <ArrowLeft className="h-6 w-6 text-text-primary" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary">Select a Table</h1>
            <div className="text-xs font-bold text-text-secondary">Choose where you&apos;d like to sit</div>
          </div>
        </div>

        {/* Floor Selection */}
        <div className="px-4 py-4 bg-white border-b border-border-warm overflow-x-auto hide-scrollbar flex space-x-3 shadow-sm">
          {initialFloors.map(floor => (
            <button 
              key={floor.id}
              onClick={() => setActiveFloorId(floor.id)}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2",
                activeFloorId === floor.id 
                  ? "bg-primary-forest text-white border-primary-forest shadow-md" 
                  : "bg-white text-text-secondary border-border-warm hover:bg-bg-secondary"
              )}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Table Map Area */}
        <div className="flex-1 p-6 bg-bg-surface">
          {tables.length === 0 ? (
            <div className="text-center py-20 text-text-secondary font-medium">
              No tables found on this floor.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {tables.map((table: FloorWithTables['tables'][number]) => {
                const isAvailable = table.status === 'available';
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={cn(
                      "relative rounded-2xl border-4 transition-all flex flex-col items-center justify-center p-2 shadow-sm active:scale-95",
                      getTableSizeClass(table.capacity || 2),
                      isAvailable 
                        ? "bg-white border-primary-green hover:shadow-md" 
                        : "bg-bg-secondary border-border-warm opacity-70"
                    )}
                  >
                    <div className={cn(
                      "text-xl font-black mb-1",
                      isAvailable ? "text-text-primary" : "text-text-secondary"
                    )}>
                      {table.table_number}
                    </div>
                    <div className={cn(
                      "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                      isAvailable ? "bg-primary-green/10 text-primary-forest" : "bg-black/5 text-text-secondary"
                    )}>
                      <Users className="h-3 w-3 mr-1" />
                      {table.capacity || 2}
                    </div>
                    {!isAvailable && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-coral"></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CustomerMobileShell>
  );
}
