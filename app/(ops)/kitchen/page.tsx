"use client";

import * as React from "react";
import { OperationalHeader } from "@/components/layout/operational-header";
import { Button } from "@/components/ui/button";
import { Clock, Menu, CheckCircle2, ChevronRight, AlertCircle, Wifi } from "lucide-react";
import { MOCK_KITCHEN_TICKETS, KitchenTicket, MOCK_KITCHEN_STATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

export default function KDSPage() {
  const [tickets, setTickets] = React.useState(MOCK_KITCHEN_TICKETS);
  const [activeStation, setActiveStation] = React.useState("ALL");

  const filteredTickets = tickets.filter(t => activeStation === "ALL" || t.station === activeStation);

  const toCook = filteredTickets.filter(t => t.status === 'To Cook');
  const preparing = filteredTickets.filter(t => t.status === 'Preparing');
  const completed = filteredTickets.filter(t => t.status === 'Completed');

  const advanceTicket = (ticketId: string, currentStatus: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        if (currentStatus === 'To Cook') return { ...t, status: 'Preparing' };
        if (currentStatus === 'Preparing') return { ...t, status: 'Completed' };
      }
      return t;
    }));
  };

  const toggleItemCompletion = (ticketId: string, itemId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          items: t.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
        };
      }
      return t;
    }));
  };

  const renderTicket = (ticket: KitchenTicket) => (
    <div key={ticket.id} className={cn(
      "bg-bg-surface rounded-xl border-2 overflow-hidden shadow-sm flex flex-col transition-all",
      ticket.delayed ? "border-coral/50" : "border-border-warm"
    )}>
      {/* Header */}
      <div className={cn(
        "p-3 flex justify-between items-center border-b",
        ticket.status === 'To Cook' ? "bg-bg-secondary border-border-warm" : 
        ticket.status === 'Preparing' ? "bg-amber/10 border-amber/20" : 
        "bg-primary-green/10 border-primary-green/20"
      )}>
        <div>
          <div className="font-bold text-lg text-text-primary">{ticket.orderId}</div>
          <div className="text-xs font-medium text-text-secondary">{ticket.table} • {ticket.source}</div>
        </div>
        <div className={cn(
          "flex items-center space-x-1 font-bold text-sm px-2 py-1 rounded-md",
          ticket.delayed ? "bg-coral text-white" : "bg-bg-base text-text-primary"
        )}>
          {ticket.delayed && <AlertCircle className="h-4 w-4 mr-1" />}
          <Clock className="h-4 w-4" />
          <span>{ticket.elapsedTime}</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {ticket.items.map(item => (
          <button 
            key={item.id} 
            onClick={() => toggleItemCompletion(ticket.id, item.id)}
            className="w-full text-left flex items-start space-x-3 group"
          >
            <div className="mt-0.5 shrink-0">
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary-green" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-border-warm group-hover:border-text-secondary transition-colors" />
              )}
            </div>
            <div className={cn("flex-1 transition-all", item.completed && "opacity-50 line-through")}>
              <div className="font-bold text-text-primary"><span className="text-primary-forest">{item.qty}x</span> {item.name}</div>
              {item.instructions && (
                <div className="text-coral text-xs font-medium mt-0.5 uppercase tracking-wide bg-coral/10 inline-block px-1 rounded">
                  {item.instructions}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer / Action */}
      <div className="p-3 border-t border-border-warm bg-bg-secondary/50">
        <div className="text-xs text-text-secondary font-medium mb-2">{ticket.station}</div>
        {ticket.status !== 'Completed' && (
          <Button 
            className={cn(
              "w-full font-bold",
              ticket.status === 'To Cook' ? "bg-amber hover:bg-amber/90 text-white" : "bg-primary-green hover:bg-primary-hover text-white"
            )}
            onClick={() => advanceTicket(ticket.id, ticket.status)}
          >
            {ticket.status === 'To Cook' ? "Start Preparing" : "Mark Completed"} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
      <OperationalHeader 
        title="Kitchen Display System"
        actions={
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white/90 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
              <Wifi className="h-4 w-4 text-green-400" />
              <span>Connected</span>
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
            {MOCK_KITCHEN_STATIONS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
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
