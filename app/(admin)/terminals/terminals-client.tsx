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
import { MOCK_POS_TERMINALS, MOCK_POS_SESSION_SUMMARIES, POSTerminal } from "@/lib/mock-data";
import { savePOSTerminalAction } from "./actions";
import { useRouter } from "next/navigation";

export default function TerminalsClient({ initialTerminals }: { initialTerminals: any[] }) {
  const router = useRouter();
  
  const formattedTerminals = initialTerminals.map(t => ({
    ...t,
    status: t.is_active ? 'online' : 'offline'
  }));

  const [terminals, setTerminals] = React.useState(formattedTerminals);
  
  React.useEffect(() => {
    setTerminals(formattedTerminals);
  }, [initialTerminals]);

  const [sessions, setSessions] = React.useState(MOCK_POS_SESSION_SUMMARIES);
  
  const [isTerminalModalOpen, setIsTerminalModalOpen] = React.useState(false);
  const [editingTerminal, setEditingTerminal] = React.useState<POSTerminal | null>(null);
  const [isPending, startTransition] = React.useTransition();
  
  const [openSessionTerminal, setOpenSessionTerminal] = React.useState<POSTerminal | null>(null);
  const [closeSessionTerminal, setCloseSessionTerminal] = React.useState<POSTerminal | null>(null);

  const handleOpenSession = (terminalId: string) => {
    // mock behavior
    setSessions(prev => [
      ...prev,
      { id: `SES-${Math.floor(Math.random()*1000)}`, terminalId, cashier: "Demo User", status: "open", openedAt: "Just now" }
    ]);
    setTerminals(prev => prev.map(t => t.id === terminalId ? { ...t, currentSessionId: `SES-new` } : t));
    setOpenSessionTerminal(null);
  };

  const handleCloseSession = (terminalId: string) => {
    setSessions(prev => prev.map(s => s.terminalId === terminalId && s.status === 'open' ? { ...s, status: 'closed', closedAt: "Just now" } : s));
    setTerminals(prev => prev.map(t => t.id === terminalId ? { ...t, currentSessionId: undefined, lastClosingAmount: 1250.00 } : t));
    setCloseSessionTerminal(null);
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
          const activeSession = sessions.find(s => s.terminalId === terminal.id && s.status === 'open');

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
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-text-secondary">Cashier</div>
                          <div className="font-medium text-text-primary">{activeSession.cashier}</div>
                        </div>
                        <div>
                          <div className="text-text-secondary">Opened At</div>
                          <div className="font-medium text-text-primary">{activeSession.openedAt}</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="destructive" 
                        className="w-full font-bold"
                        onClick={() => setCloseSessionTerminal(terminal)}
                      >
                        <Square className="mr-2 h-4 w-4" /> Close Register
                      </Button>
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
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Cashier Name</label>
            <Input placeholder="Enter your name or ID" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Opening Cash (₹)</label>
            <Input type="number" defaultValue="500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Notes (Optional)</label>
            <Input placeholder="Any opening remarks..." />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm mt-4">
            <Button variant="ghost" onClick={() => setOpenSessionTerminal(null)}>Cancel</Button>
            <Button className="bg-ready-blue hover:bg-ready-blue/90" onClick={() => openSessionTerminal && handleOpenSession(openSessionTerminal.id)}>Start Session</Button>
          </div>
        </div>
      </Modal>

      {/* Close Session Modal */}
      <Modal 
        isOpen={!!closeSessionTerminal} 
        onClose={() => setCloseSessionTerminal(null)} 
        title={`Close Register: ${closeSessionTerminal?.name}`}
      >
        <div className="space-y-6 pt-4">
          
          <div className="grid grid-cols-2 gap-4 bg-bg-secondary p-4 rounded-lg border border-border-warm">
            <div>
              <div className="text-sm text-text-secondary">Expected Cash</div>
              <div className="text-2xl font-bold text-text-primary">₹1,250.00</div>
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary mb-1">Actual Counted Cash</div>
              <Input type="number" defaultValue="1250" className="font-bold text-lg" />
            </div>
          </div>

          <div className="space-y-2 text-sm border-b border-border-warm pb-4">
            <div className="flex justify-between">
              <span className="text-text-secondary">Cash Sales</span>
              <span className="font-medium text-text-primary">₹750.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Card / UPI Sales</span>
              <span className="font-medium text-text-primary">₹2,450.00</span>
            </div>
            <div className="flex justify-between font-bold pt-2 mt-2 border-t border-border-warm">
              <span>Total Session Revenue</span>
              <span className="text-primary-forest">₹3,200.00</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Closing Notes (Optional)</label>
            <Input placeholder="Any discrepancies or remarks..." />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setCloseSessionTerminal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => closeSessionTerminal && handleCloseSession(closeSessionTerminal.id)}>Confirm & Close Register</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
