"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { OperationalHeader } from "@/components/layout/operational-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Database } from "@/types/supabase";
import { 
  Receipt, CreditCard, Banknote, QrCode, 
  Search, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { processPaymentAction, closeRegisterAction } from "./actions";

type POSSession = Database['public']['Tables']['pos_sessions']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

export default function CashierDashboardClient({
  activeSession,
  profileName,
  pendingOrders,
  sessionPayments
}: {
  activeSession: POSSession | null;
  profileName: string;
  pendingOrders: Order[];
  sessionPayments: Payment[];
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  
  // Payment Modal State
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  
  // Cash Payment State
  // (Removed unused cashReceived state)
  // Close Register State
  const [isCloseModalOpen, setIsCloseModalOpen] = React.useState(false);
  const [countedCash, setCountedCash] = React.useState<string>("");
  const [closingNotes, setClosingNotes] = React.useState("");

  const filteredOrders = pendingOrders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) || 
    (o.table_id && o.table_id.includes(search.toLowerCase()))
  );

  // Totals Calculation
  const cashSales = sessionPayments.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + p.amount, 0);
  const cardSales = sessionPayments.filter(p => p.payment_method === 'card').reduce((sum, p) => sum + p.amount, 0);
  const upiSales = sessionPayments.filter(p => p.payment_method === 'upi').reduce((sum, p) => sum + p.amount, 0);
  const totalSales = cashSales + cardSales + upiSales;
  const expectedCash = (activeSession?.opening_cash || 0) + cashSales;

  const handleProcessPayment = async (method: 'cash' | 'card' | 'upi') => {
    if (!selectedOrder || !activeSession) return;
    
    setErrorMsg(null);
    setIsProcessing(true);
    
    const result = await processPaymentAction({
      order_id: selectedOrder.id,
      pos_session_id: activeSession.id,
      amount: selectedOrder.total_amount,
      payment_method: method
    });

    setIsProcessing(false);

    if (!result.success) {
      setErrorMsg(result.error || "Failed to process payment");
      return;
    }

    setSuccessMsg(`Payment of ₹${selectedOrder.total_amount.toFixed(2)} completed successfully!`);
    setTimeout(() => {
      setSelectedOrder(null);
      setSuccessMsg(null);
      router.refresh();
    }, 2000);
  };

  const handleCloseRegister = async () => {
    if (!activeSession) return;
    setIsProcessing(true);
    setErrorMsg(null);
    
    const result = await closeRegisterAction({
      pos_session_id: activeSession.id,
      expected_cash: expectedCash,
      counted_cash: parseFloat(countedCash) || 0,
      closing_notes: closingNotes
    });
    
    setIsProcessing(false);
    
    if (!result.success) {
      setErrorMsg(result.error || "Failed to close register");
      return;
    }
    
    setIsCloseModalOpen(false);
    router.refresh();
  };

  if (!activeSession) {
    return (
      <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
        <OperationalHeader title="Cashier Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-coral mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Register Closed</h2>
            <p className="text-text-secondary mb-6">You must open a register session to view pending payments.</p>
            <p className="text-sm text-text-secondary">Please use the admin panel or restart session to open.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
      <OperationalHeader 
        title="Cashier Dashboard" 
        actions={
          <div className="flex items-center space-x-4 text-white">
            <span className="text-sm">Cashier: <b>{profileName}</b></span>
            <Button variant="secondary" className="text-white border-white/20 hover:bg-white/10" onClick={() => setIsCloseModalOpen(true)}>
              Close Register
            </Button>
          </div>
        }
      />

      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-border-warm">
            <CardContent className="p-4 flex flex-col justify-center">
              <p className="text-sm text-text-secondary font-medium">Session Sales</p>
              <h3 className="text-2xl font-bold text-text-primary">₹{totalSales.toFixed(2)}</h3>
              <p className="text-xs text-text-secondary mt-1">{sessionPayments.length} transactions</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border-warm">
            <CardContent className="p-4 flex flex-col justify-center">
              <p className="text-sm text-text-secondary font-medium">Cash Sales</p>
              <h3 className="text-2xl font-bold text-primary-green">₹{cashSales.toFixed(2)}</h3>
            </CardContent>
          </Card>
          <Card className="bg-white border-border-warm">
            <CardContent className="p-4 flex flex-col justify-center">
              <p className="text-sm text-text-secondary font-medium">Card Sales</p>
              <h3 className="text-2xl font-bold text-ready-blue">₹{cardSales.toFixed(2)}</h3>
            </CardContent>
          </Card>
          <Card className="bg-white border-border-warm">
            <CardContent className="p-4 flex flex-col justify-center">
              <p className="text-sm text-text-secondary font-medium">UPI Sales</p>
              <h3 className="text-2xl font-bold text-brand-purple">₹{upiSales.toFixed(2)}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders List */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Pending Payments</h2>
            <p className="text-sm text-text-secondary">{filteredOrders.length} unpaid orders waiting</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input 
              placeholder="Search order number..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-secondary bg-white rounded-lg border border-dashed border-border-warm">
              <CheckCircle2 className="h-12 w-12 text-primary-green mx-auto mb-3 opacity-50" />
              <p>No pending payments!</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id} className="bg-white border-border-warm shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 border-b border-border-warm">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{order.order_number}</CardTitle>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-green">₹{order.total_amount.toFixed(2)}</div>
                      <div className="text-xs text-text-secondary uppercase font-bold">{order.order_type.replace('_', ' ')}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex justify-between items-center">
                  <div className="text-sm">
                    {order.table_id ? (
                      <span className="font-medium text-text-primary">Table ID: {order.table_id.substring(0,6)}</span>
                    ) : (
                      <span className="text-text-secondary italic">No table assigned</span>
                    )}
                  </div>
                  <Button onClick={() => setSelectedOrder(order)} className="bg-brand-purple hover:bg-brand-purple/90">
                    Collect Payment
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => {
        if (!isProcessing && !successMsg) setSelectedOrder(null);
      }} title="Process Payment">
        {selectedOrder && (
          <div className="space-y-6">
            {successMsg ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-16 w-16 text-primary-green mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">Payment Successful</h3>
                <p className="text-text-secondary">{successMsg}</p>
                <p className="text-xs text-text-secondary mt-4">Generating receipt...</p>
              </div>
            ) : (
              <>
                <div className="bg-bg-surface p-4 rounded-lg flex justify-between items-center border border-border-warm">
                  <div>
                    <p className="text-sm text-text-secondary font-medium">Total Amount Due</p>
                    <p className="text-3xl font-black text-text-primary">₹{selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                  <Receipt className="h-10 w-10 text-brand-purple opacity-20" />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-coral/10 text-coral text-sm rounded-md font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="secondary" 
                      className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-primary-green hover:text-primary-green"
                      onClick={() => handleProcessPayment('cash')}
                      disabled={isProcessing}
                    >
                      <Banknote className="h-6 w-6" />
                      <span>Cash</span>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-ready-blue hover:text-ready-blue"
                      onClick={() => handleProcessPayment('card')}
                      disabled={isProcessing}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span>Card</span>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-brand-purple hover:text-brand-purple"
                      onClick={() => handleProcessPayment('upi')}
                      disabled={isProcessing}
                    >
                      <QrCode className="h-6 w-6" />
                      <span>UPI</span>
                    </Button>
                  </div>
                  
                  {isProcessing && (
                    <div className="flex items-center justify-center space-x-2 text-text-secondary py-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing payment...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Close Register Modal */}
      <Modal isOpen={isCloseModalOpen} onClose={() => {
        if (!isProcessing) setIsCloseModalOpen(false);
      }} title="Close Register">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-bg-surface p-4 rounded-lg border border-border-warm">
            <div>
              <p className="text-xs text-text-secondary uppercase font-bold">Opening Cash</p>
              <p className="text-lg font-semibold">₹{(activeSession.opening_cash || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase font-bold">Cash Sales</p>
              <p className="text-lg font-semibold text-primary-green">+ ₹{cashSales.toFixed(2)}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-border-warm">
              <p className="text-sm text-text-secondary uppercase font-bold">Expected Cash in Drawer</p>
              <p className="text-3xl font-black text-text-primary">₹{expectedCash.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Actual Cash Counted</label>
              <Input 
                type="number" 
                placeholder="Enter counted amount"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="text-lg"
              />
              {countedCash && (
                <div className={`text-sm mt-2 font-medium ${parseFloat(countedCash) === expectedCash ? 'text-primary-green' : 'text-coral'}`}>
                  Difference: ₹{(parseFloat(countedCash) - expectedCash).toFixed(2)}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Closing Notes (Optional)</label>
              <Input 
                placeholder="Any remarks on discrepancy..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-coral/10 text-coral text-sm rounded-md font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-border-warm">
            <Button variant="secondary" onClick={() => setIsCloseModalOpen(false)} disabled={isProcessing}>Cancel</Button>
            <Button onClick={handleCloseRegister} disabled={isProcessing || !countedCash} className="bg-coral hover:bg-coral/90">
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
