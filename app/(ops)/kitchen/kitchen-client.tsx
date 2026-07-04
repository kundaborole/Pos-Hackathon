"use client";

import * as React from "react";
import { OperationalHeader } from "@/components/layout/operational-header";
import { Button } from "@/components/ui/button";
import { Clock, Menu, CheckCircle2, ChevronRight, AlertCircle, Wifi, WifiOff, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { KitchenStation, KitchenTicket, KitchenTicketItem } from "@/lib/api/kitchen";
import { updateOrderItemStatusAction, updateOrderKitchenStatusAction } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function KitchenClient({
  initialTickets,
  stations,
  restaurantId
}: {
  initialTickets: KitchenTicket[];
  stations: KitchenStation[];
  restaurantId: string;
}) {
  const router = useRouter();
  const [tickets, setTickets] = React.useState<KitchenTicket[]>(initialTickets);
  const [activeStation, setActiveStation] = React.useState("ALL");
  const [isOnline, setIsOnline] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [processingItems, setProcessingItems] = React.useState<Set<string>>(new Set());
  const [processingOrders, setProcessingOrders] = React.useState<Set<string>>(new Set());

  // Setup Robust Polling
  React.useEffect(() => {
    setIsOnline(true);
    
    const interval = setInterval(() => {
      if (!isRefreshing) {
        router.refresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [router, isRefreshing]);

  // Sync state when initialTickets changes (due to router.refresh)
  React.useEffect(() => {
    // eslint-disable-next-line
    setTickets(prev => JSON.stringify(prev) !== JSON.stringify(initialTickets) ? initialTickets : prev);
  }, [initialTickets]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStationIdForItem = (item: KitchenTicketItem) => {
    return item.product?.kitchen_station_id || item.product?.category?.kitchen_station_id || 'MAIN';
  };

  const isItemForActiveStation = (item: KitchenTicketItem) => {
    if (activeStation === "ALL") return true;
    return getStationIdForItem(item) === activeStation;
  };

  const isTicketForActiveStation = (ticket: KitchenTicket) => {
    if (activeStation === "ALL") return true;
    return ticket.items.some(item => isItemForActiveStation(item));
  };

  const filteredTickets = tickets.filter(isTicketForActiveStation);

  const toCook = filteredTickets.filter(t => t.kitchen_status === 'pending');
  const preparing = filteredTickets.filter(t => t.kitchen_status === 'preparing');
  const completed = filteredTickets.filter(t => t.kitchen_status === 'completed');

  const advanceTicket = async (orderId: string, currentStatus: string) => {
    if (processingOrders.has(orderId)) return;
    
    setProcessingOrders(prev => new Set(prev).add(orderId));
    
    try {
      const nextStatus = currentStatus === 'pending' ? 'preparing' : 'completed';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await updateOrderKitchenStatusAction(orderId, nextStatus as any);
      if (res.success) {
        // Optimistic update locally
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTickets(prev => prev.map(t => t.id === orderId ? { ...t, kitchen_status: nextStatus as any } : t));
        router.refresh(); // Ensure strict sync
      }
    } finally {
      setProcessingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const toggleItemCompletion = async (ticketId: string, item: KitchenTicketItem) => {
    if (processingItems.has(item.id)) return;
    
    // Don't allow interacting if ticket is completed
    if (item.kitchen_status === 'completed' && tickets.find(t => t.id === ticketId)?.kitchen_status === 'completed') {
      return; 
    }

    setProcessingItems(prev => new Set(prev).add(item.id));
    
    try {
      const nextStatus = item.kitchen_status === 'completed' ? 'preparing' : 'completed';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await updateOrderItemStatusAction(item.id, nextStatus as any);
      if (res.success) {
        // Optimistic update locally
        setTickets(prev => prev.map(t => {
          if (t.id === ticketId) {
            return {
              ...t,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items: t.items.map(i => i.id === item.id ? { ...i, kitchen_status: nextStatus as any } : i)
            };
          }
          return t;
        }));
        router.refresh(); // Ensure strict sync
      }
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const diffMs = new Date().getTime() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins}m`;
  };

  const isDelayed = (createdAt: string) => {
    const diffMs = new Date().getTime() - new Date(createdAt).getTime();
    return diffMs > 15 * 60000; // 15 mins delay warning
  };

  const renderTicket = (ticket: KitchenTicket) => {
    // For specific stations, only show items assigned to that station
    const itemsToDisplay = activeStation === "ALL" 
      ? ticket.items 
      : ticket.items.filter(item => isItemForActiveStation(item));

    if (itemsToDisplay.length === 0) return null;

    const delayed = isDelayed(ticket.created_at);
    const elapsedTime = getElapsedTime(ticket.created_at);
    const isProcessing = processingOrders.has(ticket.id);

    return (
      <div key={ticket.id} className={cn(
        "bg-bg-surface rounded-xl border-2 overflow-hidden shadow-sm flex flex-col transition-all",
        delayed && ticket.kitchen_status !== 'completed' ? "border-coral/50" : "border-border-warm",
        isProcessing ? "opacity-50 pointer-events-none" : ""
      )}>
        {/* Header */}
        <div className={cn(
          "p-3 flex justify-between items-center border-b",
          ticket.kitchen_status === 'pending' ? "bg-bg-secondary border-border-warm" : 
          ticket.kitchen_status === 'preparing' ? "bg-amber/10 border-amber/20" : 
          "bg-primary-green/10 border-primary-green/20"
        )}>
          <div>
            <div className="font-bold text-lg text-text-primary">#{ticket.order_number}</div>
            <div className="text-xs font-medium text-text-secondary uppercase">
              {ticket.table ? `Table ${ticket.table.table_number}` : 'Takeaway'} • {ticket.source}
            </div>
          </div>
          <div className={cn(
            "flex items-center space-x-1 font-bold text-sm px-2 py-1 rounded-md",
            delayed && ticket.kitchen_status !== 'completed' ? "bg-coral text-white" : "bg-bg-base text-text-primary"
          )}>
            {delayed && ticket.kitchen_status !== 'completed' && <AlertCircle className="h-4 w-4 mr-1" />}
            <Clock className="h-4 w-4" />
            <span>{elapsedTime}</span>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[300px]">
          {itemsToDisplay.map(item => (
            <button 
              key={item.id} 
              onClick={() => toggleItemCompletion(ticket.id, item)}
              disabled={processingItems.has(item.id)}
              className={cn(
                "w-full text-left flex items-start space-x-3 group",
                processingItems.has(item.id) && "opacity-50"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {item.kitchen_status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-primary-green" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-border-warm group-hover:border-text-secondary transition-colors" />
                )}
              </div>
              <div className={cn("flex-1 transition-all", item.kitchen_status === 'completed' && "opacity-50 line-through")}>
                <div className="font-bold text-text-primary"><span className="text-primary-forest">{item.quantity}x</span> {item.product_name_snapshot}</div>
                {item.special_instructions && (
                  <div className="text-coral text-xs font-medium mt-0.5 uppercase tracking-wide bg-coral/10 inline-block px-1 rounded">
                    {item.special_instructions}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer / Action */}
        <div className="p-3 border-t border-border-warm bg-bg-secondary/50">
          <div className="text-xs text-text-secondary font-medium mb-2 uppercase">
            {activeStation === "ALL" ? "All Stations" : stations.find(s => s.id === activeStation)?.name}
          </div>
          {ticket.kitchen_status !== 'completed' && (
            <Button 
              className={cn(
                "w-full font-bold",
                ticket.kitchen_status === 'pending' ? "bg-amber hover:bg-amber/90 text-white" : "bg-primary-green hover:bg-primary-hover text-white"
              )}
              onClick={() => advanceTicket(ticket.id, ticket.kitchen_status)}
              disabled={isProcessing}
            >
              {ticket.kitchen_status === 'pending' ? "Start Preparing" : "Mark Completed"} 
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
      <OperationalHeader 
        title="Kitchen Display System"
        actions={
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={handleRefresh}
            >
              <RotateCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
            </Button>
            <div className={cn(
              "flex items-center space-x-2 text-white/90 text-sm font-medium px-3 py-1.5 rounded-full transition-colors",
              isOnline ? "bg-white/10" : "bg-coral/20 text-coral"
            )}>
              {isOnline ? (
                <><Wifi className="h-4 w-4 text-green-400" /><span>Connected</span></>
              ) : (
                <><WifiOff className="h-4 w-4" /><span>Offline</span></>
              )}
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="p-4 bg-bg-surface border-b border-border-warm flex items-center justify-between shrink-0">
        <div className="w-64">
          <Select value={activeStation} onChange={(e) => setActiveStation(e.target.value)}>
            <option value="ALL">All Stations</option>
            {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 md:p-6 bg-bg-base">
        <div className="flex gap-6 h-full min-w-max">
          
          {/* TO COOK COLUMN */}
          <div className="w-80 lg:w-[350px] flex flex-col h-full bg-bg-surface/50 rounded-2xl border border-border-warm overflow-hidden">
            <div className="p-4 border-b border-border-warm bg-bg-surface flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg text-text-primary">To Cook</h2>
              <span className="bg-bg-secondary text-text-primary px-2 py-0.5 rounded text-sm font-bold">{toCook.length}</span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {toCook.map(renderTicket)}
            </div>
          </div>

          {/* PREPARING COLUMN */}
          <div className="w-80 lg:w-[350px] flex flex-col h-full bg-amber/5 rounded-2xl border border-amber/20 overflow-hidden">
            <div className="p-4 border-b border-amber/20 bg-amber/10 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg text-amber-800">Preparing</h2>
              <span className="bg-white/50 text-amber-900 px-2 py-0.5 rounded text-sm font-bold">{preparing.length}</span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {preparing.map(renderTicket)}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div className="w-80 lg:w-[350px] flex flex-col h-full bg-primary-green/5 rounded-2xl border border-primary-green/20 overflow-hidden">
            <div className="p-4 border-b border-primary-green/20 bg-primary-green/10 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg text-primary-forest">Completed</h2>
              <span className="bg-white/50 text-primary-forest px-2 py-0.5 rounded text-sm font-bold">{completed.length}</span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto opacity-70">
              {completed.map(renderTicket)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
