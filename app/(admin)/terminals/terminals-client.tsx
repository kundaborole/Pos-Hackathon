"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { MonitorSmartphone, Play, Square, MapPin, Plus, Loader2 } from "lucide-react";
import { savePOSTerminalAction, openSessionAction, closeSessionAction } from "./actions";
import { useRouter } from "next/navigation";

export default function TerminalsClient({ initialTerminals, cashiers = [], initialSessions = [] }: { initialTerminals: any[], cashiers?: any[], initialSessions?: any[] }) {
  const router = useRouter();
  
  const formattedTerminals = initialTerminals.map(t => ({
    ...t,
    status: t.is_active ? 'online' : 'offline'
  }));

  const [terminals, setTerminals] = React.useState(formattedTerminals);
  
  React.useEffect(() => {
    setTerminals(formattedTerminals);
  }, [initialTerminals]);

  const [sessions, setSessions] = React.useState(initialSessions);
  
  React.useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);
  
  const [isTerminalModalOpen, setIsTerminalModalOpen] = React.useState(false);
  const [editingTerminal, setEditingTerminal] = React.useState<POSTerminal | null>(null);
  const [isPending, startTransition] = React.useTransition();
  
  const [openSessionTerminal, setOpenSessionTerminal] = React.useState<POSTerminal | null>(null);
  const [closeSessionTerminal, setCloseSessionTerminal] = React.useState<POSTerminal | null>(null);

  const handleOpenSession = async (formData: FormData) => {
    startTransition(async () => {
      if (!openSessionTerminal) return;
      const cashier_id = formData.get("cashier_id") as string;
      const opening_cash = parseFloat(formData.get("opening_cash") as string) || 0;

      if (!cashier_id) {
        alert("Please select a cashier");
        return;
      }

      const res = await openSessionAction({
        terminal_id: openSessionTerminal.id,
        cashier_id,
        opening_cash
      });

      if (res.success) {
        setOpenSessionTerminal(null);
        router.refresh();
      } else {
        alert("Failed to open session: " + res.error);
      }
    });
  };

  const handleCloseSession = async (formData: FormData) => {
    startTransition(async () => {
      if (!closeSessionTerminal) return;
      const activeSession = sessions.find(s => s.terminal_id === closeSessionTerminal.id && s.status === 'open');
      if (!activeSession) return;

      const counted_cash = parseFloat(formData.get("counted_cash") as string) || 0;
      const closing_notes = formData.get("closing_notes") as string;
      const expected_cash = activeSession.opening_cash || 0; // In reality, add sales to this

      const res = await closeSessionAction({
        session_id: activeSession.id,
        expected_cash,
        counted_cash,
        closing_notes
      });

      if (res.success) {
        setCloseSessionTerminal(null);
        router.refresh();
      } else {
        alert("Failed to close session: " + res.error);
      }
    });
  };

  const handleCloseTerminalModal = () => {
    setIsTerminalModalOpen(false);
    setEditingTerminal(null);
  };

  const handleSaveTerminal = async (formData: FormData) => {
    startTransition(async () => {
      const name = formData.get("name") as string;
      const location = formData.get("location") as string;
      const is_active = editingTerminal ? editingTerminal.status === 'online' : true;

      if (!name) return;

      const res = await savePOSTerminalAction({
        id: editingTerminal?.id,
        name,
        location,
        is_active
      });

      if (res.success) {
        handleCloseTerminalModal();
        router.refresh();
      } else {
        alert("Failed to save terminal: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="POS Terminals" 
        description="Manage register sessions, track cash drawers, and terminal status." 
        actions={
          <Button onClick={() => setIsTerminalModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add POS Terminal
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {terminals.map(terminal => {
          const activeSession = sessions.find(s => s.terminal_id === terminal.id && s.status === 'open');

          return (
            <Card key={terminal.id} className="border border-border-warm bg-bg-surface overflow-hidden">
              <CardHeader className="bg-bg-secondary border-b border-border-warm pb-4 flex flex-row items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-border-warm">
                    <MonitorSmartphone className="h-6 w-6 text-text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{terminal.name}</CardTitle>
                    <div className="flex items-center text-sm text-text-secondary mt-1">
                      <MapPin className="h-3 w-3 mr-1" /> {terminal.location}
                    </div>
                  </div>
                </div>
                <StatusBadge 
                  status={terminal.status === 'online' ? "success" : "inactive"} 
                  label={terminal.status === 'online' ? "Online" : "Offline"} 
                />
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-6">
                  
                  {activeSession ? (
                    <div className="bg-primary-green/5 border border-primary-green/20 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="font-bold text-primary-forest flex items-center">
                          <div className="w-2 h-2 bg-primary-green rounded-full animate-pulse mr-2" /> Active Session
                        </div>
                        <div className="text-sm font-medium text-text-primary">{activeSession.id}</div>
                      </div>
                      <div className="text-text-secondary mb-4">Register is currently open.</div>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-left">
                        <div>
                          <div className="text-text-secondary">Cashier</div>
                          <div className="font-medium text-text-primary">{activeSession.profiles?.full_name || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="text-text-secondary">Opened At</div>
                          <div className="font-medium text-text-primary" suppressHydrationWarning>{new Date(activeSession.opened_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-white border-border-warm text-text-primary hover:bg-bg-secondary" 
                          variant="outline"
                          onClick={() => setCloseSessionTerminal(terminal)}
                        >
                          <Square className="mr-2 h-4 w-4" /> Close
                        </Button>
                        <Button className="flex-1 bg-ready-blue hover:bg-ready-blue/90 text-white" onClick={() => router.push('/pos')}>
                          <MonitorSmartphone className="mr-2 h-4 w-4" /> Enter POS
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-bg-secondary/50 border border-border-warm rounded-lg p-4 text-center">
                      <div className="text-text-secondary mb-4">Register is currently closed.</div>
                      {terminal.lastClosingAmount !== undefined && (
                        <div className="text-sm text-text-primary mb-4 font-medium">
                          Last closing amount: ₹{terminal.lastClosingAmount.toFixed(2)}
                        </div>
                      )}
                      <Button 
                        className="w-full font-bold bg-ready-blue hover:bg-ready-blue/90 text-white"
                        onClick={() => setOpenSessionTerminal(terminal)}
                      >
                        <Play className="mr-2 h-4 w-4" /> Open Register
                      </Button>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Terminal Modal */}
      <Modal 
        isOpen={isTerminalModalOpen} 
        onClose={handleCloseTerminalModal} 
        title={editingTerminal ? "Edit POS Terminal" : "Add POS Terminal"}
      >
        <form action={handleSaveTerminal} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Terminal Name</label>
            <Input name="name" defaultValue={editingTerminal?.name || ""} placeholder="e.g. Main Register 1" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Location</label>
            <Input name="location" defaultValue={editingTerminal?.location || ""} placeholder="e.g. Front Counter" />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border-warm mt-4 pt-4">
            <div>
              <div className="text-sm font-medium text-text-primary">Active Status</div>
              <div className="text-xs text-text-secondary">Can this terminal be used?</div>
            </div>
            <Switch checked={editingTerminal ? editingTerminal.status === 'online' : true} readOnly />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm mt-4">
            <Button type="button" variant="ghost" onClick={handleCloseTerminalModal} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Terminal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Open Session Modal */}
      <Modal 
        isOpen={!!openSessionTerminal} 
        onClose={() => setOpenSessionTerminal(null)} 
        title={`Open Register: ${openSessionTerminal?.name}`}
      >
        <form action={handleOpenSession} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Cashier Name</label>
            <select 
              name="cashier_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue=""
              required
            >
              <option value="" disabled>Select a cashier...</option>
              {cashiers.map((cashier) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.full_name} ({cashier.staff_id})
                </option>
              ))}
              {cashiers.length === 0 && (
                <option value="" disabled>No cashiers found. Please add a cashier.</option>
              )}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Opening Cash (₹)</label>
            <Input name="opening_cash" type="number" defaultValue="500" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Notes (Optional)</label>
            <Input name="opening_notes" placeholder="Any opening remarks..." />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm mt-4">
            <Button type="button" variant="ghost" onClick={() => setOpenSessionTerminal(null)} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="bg-ready-blue hover:bg-ready-blue/90" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Session Modal */}
      <Modal 
        isOpen={!!closeSessionTerminal} 
        onClose={() => setCloseSessionTerminal(null)} 
        title={`Close Register: ${closeSessionTerminal?.name}`}
      >
        <form action={handleCloseSession} className="space-y-4 pt-4">
          <div className="bg-bg-secondary/50 p-4 rounded-lg space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Expected Cash:</span>
              <span className="font-medium text-text-primary">₹{sessions.find(s => s.terminal_id === closeSessionTerminal?.id && s.status === 'open')?.opening_cash?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Counted Cash (₹)</label>
            <Input name="counted_cash" type="number" defaultValue="0" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Closing Notes (Optional)</label>
            <Input name="closing_notes" placeholder="Any discrepancies..." />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm mt-4">
            <Button type="button" variant="ghost" onClick={() => setCloseSessionTerminal(null)} disabled={isPending}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              End Session
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
