"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, CheckCircle2, CircleDashed, Check, Bell, Receipt } from "lucide-react";
import type { FullOrder } from "@/lib/api/orders";

import { cn } from "@/lib/utils";

export default function OrderTrackerClient({
  order,
  tableToken
}: {
  order: FullOrder;
  tableToken: string;
}) {
  const router = useRouter();
  const isOnline = true; // Hardcoded true for hackathon demo

  React.useEffect(() => {
    // Fallback polling
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const getStepStatus = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableStatus = (order as any).table?.status;

    // Fully completed by cashier
    if (order.order_status === 'completed') return 4;
    
    // Waiter has served the food, table is now eating/waiting for payment
    if (tableStatus === 'waiting_payment') return 4;
    
    // Kitchen completed, waiting for Waiter to serve
    if (order.kitchen_status === 'completed' && order.order_status !== 'served') return 3;
    
    if (order.kitchen_status === 'preparing') return 2;
    if (order.kitchen_status === 'pending') return 1;
    
    return 1;
  };

  const step = getStepStatus();

  return (
    <CustomerMobileShell>
      <div className="flex flex-col min-h-screen bg-bg-surface relative">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-border-warm pt-safe px-4 py-3 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">#{order.order_number}</h1>
            <div className="text-xs font-bold text-text-secondary">Dine In</div>
          </div>
          <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold",
            isOnline ? "bg-primary-green/10 text-primary-forest" : "bg-coral/10 text-coral"
          )}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? "Connected" : "Offline"}</span>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Main Status Card */}
          <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm text-center">
            {step === 1 && (
              <>
                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Status</h2>
                <div className="text-2xl font-black text-text-primary mb-1">Order Received</div>
                <p className="text-sm text-text-secondary">Waiting for kitchen to start.</p>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Estimated Time</h2>
                <div className="text-4xl font-black text-primary-forest mb-1">15 min</div>
                <p className="text-sm text-text-secondary">Your order is currently being prepared.</p>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Status</h2>
                <div className="text-2xl font-black text-primary-forest mb-1">Ready!</div>
                <p className="text-sm text-text-secondary">Your order is ready to be served.</p>
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Status</h2>
                <div className="text-2xl font-black text-text-primary mb-1">Served</div>
                <p className="text-sm text-text-secondary">Enjoy your meal!</p>
              </>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-5">Order Status</h3>
            <div className="space-y-0 relative">
              <div className="absolute left-4 top-4 bottom-8 w-0.5 bg-border-warm z-0"></div>

              {/* Step 1 */}
              <div className={cn("flex items-start space-x-4 relative z-10 pb-6", step >= 1 ? "" : "opacity-50")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]",
                  step > 1 ? "bg-primary-green" : (step === 1 ? "bg-white border-2 border-primary-green" : "bg-white border-2 border-border-warm")
                )}>
                  {step > 1 ? <Check className="h-4 w-4 text-white" /> : (step === 1 ? <div className="w-2.5 h-2.5 bg-primary-green rounded-full animate-pulse"></div> : <CircleDashed className="h-4 w-4 text-border-warm" />)}
                </div>
                <div className="pt-1.5">
                  <h4 className={cn("font-bold text-sm", step >= 1 ? "text-text-primary" : "text-text-secondary")}>Order Received</h4>
                </div>
              </div>

              {/* Step 2 */}
              <div className={cn("flex items-start space-x-4 relative z-10 pb-6", step >= 2 ? "" : "opacity-50")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]",
                  step > 2 ? "bg-primary-green" : (step === 2 ? "bg-white border-2 border-primary-green" : "bg-white border-2 border-border-warm")
                )}>
                  {step > 2 ? <Check className="h-4 w-4 text-white" /> : (step === 2 ? <div className="w-2.5 h-2.5 bg-primary-green rounded-full animate-pulse"></div> : <CircleDashed className="h-4 w-4 text-border-warm" />)}
                </div>
                <div className="pt-1.5">
                  <h4 className={cn("font-bold text-sm", step === 2 ? "text-primary-green" : (step > 2 ? "text-text-primary" : "text-text-secondary"))}>Preparing</h4>
                </div>
              </div>

              {/* Step 3 */}
              <div className={cn("flex items-start space-x-4 relative z-10 pb-6", step >= 3 ? "" : "opacity-50")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]",
                  step > 3 ? "bg-primary-green" : (step === 3 ? "bg-white border-2 border-primary-green" : "bg-white border-2 border-border-warm")
                )}>
                  {step > 3 ? <Check className="h-4 w-4 text-white" /> : (step === 3 ? <div className="w-2.5 h-2.5 bg-primary-green rounded-full animate-pulse"></div> : <CircleDashed className="h-4 w-4 text-border-warm" />)}
                </div>
                <div className="pt-1.5">
                  <h4 className={cn("font-bold text-sm", step === 3 ? "text-primary-green" : (step > 3 ? "text-text-primary" : "text-text-secondary"))}>Ready to Serve</h4>
                </div>
              </div>

              {/* Step 4 */}
              <div className={cn("flex items-start space-x-4 relative z-10", step >= 4 ? "" : "opacity-50")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]",
                  step === 4 ? "bg-primary-green" : "bg-white border-2 border-border-warm"
                )}>
                  {step === 4 ? <Check className="h-4 w-4 text-white" /> : <CircleDashed className="h-4 w-4 text-border-warm" />}
                </div>
                <div className="pt-1.5">
                  <h4 className={cn("font-bold text-sm", step === 4 ? "text-primary-green" : "text-text-secondary")}>Served</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Item Level Breakdown */}
          <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4 border-b border-border-warm pb-2">Item Status</h3>
            <div className="space-y-3 text-sm">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">{item.quantity}x {item.product_name_snapshot}</span>
                  {item.kitchen_status === 'completed' ? (
                    <span className="text-xs font-bold text-primary-green bg-primary-green/10 px-2 py-1 rounded flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
                    </span>
                  ) : item.kitchen_status === 'preparing' ? (
                    <span className="text-xs font-bold text-ready-blue bg-ready-blue/10 px-2 py-1 rounded">Preparing</span>
                  ) : (
                    <span className="text-xs font-bold text-text-secondary bg-bg-secondary px-2 py-1 rounded">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1 border-border-warm text-text-secondary hover:bg-bg-secondary" disabled>
              <Bell className="mr-2 h-4 w-4" /> Waiter
            </Button>
            <Button className="flex-[2]" onClick={() => router.push(`/order/${tableToken}/payment/${order.id}`)}>
              <Receipt className="mr-2 h-4 w-4" /> Pay ₹{order.total_amount.toFixed(2)}
            </Button>
          </div>

        </div>
      </div>
    </CustomerMobileShell>
  );
}
