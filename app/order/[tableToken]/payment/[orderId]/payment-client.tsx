"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Button } from "@/components/ui/button";
import { QrCode, Banknote, CreditCard, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FullOrder } from "@/lib/api/orders";
import { processPaymentAction } from "./actions";

export default function PaymentClient({
  order,
  tableToken
}: {
  order: FullOrder;
  tableToken: string;
}) {
  const router = useRouter();
  
  const [selectedMethod, setSelectedMethod] = React.useState<"upi" | "cash" | "card">("upi");
  const [paymentState, setPaymentState] = React.useState<"waiting" | "processing" | "confirmed">("waiting");
  const [error, setError] = React.useState<string | null>(null);

  const handleSimulatePayment = async () => {
    setPaymentState("processing");
    setError(null);
    
    // Simulate slight delay for effect
    await new Promise(res => setTimeout(res, 1000));
    
    const res = await processPaymentAction(tableToken, order.id, selectedMethod, order.total_amount);

    if (res.success) {
      setPaymentState("confirmed");
      setTimeout(() => {
        router.push(`/order/${tableToken}/success/${order.id}`);
      }, 1000);
    } else {
      setError(res.error || "Payment failed");
      setPaymentState("waiting");
    }
  };

  return (
    <CustomerMobileShell hideNav>
      <div className="flex flex-col min-h-screen bg-bg-surface relative">
        
        {/* Header */}
        <div className="bg-white border-b border-border-warm pt-safe px-4 py-3 flex items-center shadow-sm">
          <button onClick={() => router.back()} className="mr-3">
            <ChevronLeft className="h-6 w-6 text-text-primary" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-text-primary">Payment</h1>
            <div className="text-xs font-bold text-text-secondary">Order #{order.order_number}</div>
          </div>
        </div>

        <div className="p-4 space-y-6 flex-1">
          
          {error && (
            <div className="bg-coral/10 text-coral p-3 rounded-lg text-sm font-medium border border-coral/20">
              {error}
            </div>
          )}

          {/* Amount Due */}
          <div className="bg-white border border-border-warm rounded-2xl p-6 shadow-sm text-center">
            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Amount Due</p>
            <div className="text-4xl font-black text-primary-forest">₹{order.total_amount.toFixed(2)}</div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-bold text-text-primary pl-1">Select Payment Method</h3>
            
            <button 
              onClick={() => setSelectedMethod("upi")}
              className={cn(
                "w-full bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm transition-all text-left",
                selectedMethod === "upi" ? "border-primary-green ring-1 ring-primary-green bg-primary-green/5" : "border-border-warm hover:border-primary-green/50"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", selectedMethod === "upi" ? "bg-primary-green/10 text-primary-forest" : "bg-bg-secondary text-text-secondary")}>
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-text-primary">UPI QR Code</div>
                  <div className="text-xs text-text-secondary">Pay instantly using any UPI app</div>
                </div>
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedMethod === "upi" ? "border-primary-green" : "border-border-warm")}>
                {selectedMethod === "upi" && <div className="w-2.5 h-2.5 bg-primary-green rounded-full" />}
              </div>
            </button>

            <button 
              onClick={() => setSelectedMethod("card")}
              className={cn(
                "w-full bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm transition-all text-left",
                selectedMethod === "card" ? "border-primary-green ring-1 ring-primary-green bg-primary-green/5" : "border-border-warm hover:border-primary-green/50"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", selectedMethod === "card" ? "bg-primary-green/10 text-primary-forest" : "bg-bg-secondary text-text-secondary")}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-text-primary">Card at Counter</div>
                  <div className="text-xs text-text-secondary">Pay physically via POS terminal</div>
                </div>
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedMethod === "card" ? "border-primary-green" : "border-border-warm")}>
                {selectedMethod === "card" && <div className="w-2.5 h-2.5 bg-primary-green rounded-full" />}
              </div>
            </button>

            <button 
              onClick={() => setSelectedMethod("cash")}
              className={cn(
                "w-full bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm transition-all text-left",
                selectedMethod === "cash" ? "border-primary-green ring-1 ring-primary-green bg-primary-green/5" : "border-border-warm hover:border-primary-green/50"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", selectedMethod === "cash" ? "bg-primary-green/10 text-primary-forest" : "bg-bg-secondary text-text-secondary")}>
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-text-primary">Cash at Counter</div>
                  <div className="text-xs text-text-secondary">Pay physically with cash</div>
                </div>
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedMethod === "cash" ? "border-primary-green" : "border-border-warm")}>
                {selectedMethod === "cash" && <div className="w-2.5 h-2.5 bg-primary-green rounded-full" />}
              </div>
            </button>
          </div>

          {/* UPI Active State Area */}
          {selectedMethod === "upi" && (
            <div className="bg-white border border-border-warm rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center mt-4">
              <div className="w-48 h-48 bg-bg-secondary rounded-xl mb-4 border-4 border-white shadow flex items-center justify-center">
                {/* Mock QR image */}
                <div className="text-center text-text-secondary">
                  <QrCode className="h-16 w-16 mx-auto mb-2 opacity-20" />
                  <span className="text-xs font-medium">Scan to Pay</span>
                </div>
              </div>
              <div className="font-bold text-text-primary mb-1">cafehub@upi</div>
              <div className="text-sm font-bold text-primary-forest bg-primary-green/10 px-3 py-1 rounded-full mb-6">
                Total: ₹{order.total_amount.toFixed(2)}
              </div>

              {paymentState === "waiting" && (
                <div className="flex items-center space-x-2 text-ready-blue text-sm font-medium animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Waiting for Confirmation...</span>
                </div>
              )}
              {paymentState === "processing" && (
                <div className="flex items-center space-x-2 text-amber-600 text-sm font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Payment...</span>
                </div>
              )}
              {paymentState === "confirmed" && (
                <div className="flex items-center space-x-2 text-primary-green text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Payment Confirmed!</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-border-warm p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button 
            className="w-full h-14 text-lg font-bold" 
            onClick={handleSimulatePayment}
            disabled={paymentState !== "waiting"}
          >
            {paymentState === "processing" ? "Processing..." : paymentState === "confirmed" ? "Success!" : "Complete Payment"}
          </Button>
        </div>

      </div>
    </CustomerMobileShell>
  );
}
