"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Button } from "@/components/ui/button";
import { Wifi, CheckCircle2, CircleDashed, Check, Bell, Receipt } from "lucide-react";

export default function OrderTrackingPage({ params }: { params: { tableToken: string, orderId: string } }) {
  const router = useRouter();
  const token = params.tableToken;
  const orderId = params.orderId === 'latest' ? 'ORD000124' : params.orderId;

  return (
    <CustomerMobileShell>
      <div className="flex flex-col min-h-screen bg-bg-surface relative">
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-border-warm pt-safe px-4 py-3 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">#{orderId}</h1>
            <div className="text-xs font-bold text-text-secondary">Table 03 • Dine In</div>
          </div>
          <div className="flex items-center space-x-1 bg-primary-green/10 text-primary-forest px-2 py-1 rounded text-[10px] font-bold">
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </div>
        </div>

        <div className="p-4 space-y-6">
          
          {/* Main Status Card */}
          <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm text-center">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Estimated Time</h2>
            <div className="text-4xl font-black text-primary-forest mb-1">15 min</div>
            <p className="text-sm text-text-secondary">Your order is currently being prepared.</p>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-5">Order Status</h3>
            <div className="space-y-0 relative">
              {/* Connecting line */}
              <div className="absolute left-4 top-4 bottom-8 w-0.5 bg-border-warm z-0"></div>

              {/* Step 1 */}
              <div className="flex items-start space-x-4 relative z-10 pb-6">
                <div className="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div className="pt-1.5">
                  <h4 className="font-bold text-text-primary text-sm">Order Received</h4>
                  <p className="text-xs text-text-secondary">10:42 AM</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4 relative z-10 pb-6">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-primary-green flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]">
                  <div className="w-2.5 h-2.5 bg-primary-green rounded-full animate-pulse"></div>
                </div>
                <div className="pt-1.5">
                  <h4 className="font-bold text-primary-green text-sm">Preparing</h4>
                  <p className="text-xs text-text-secondary">Kitchen is working on your food</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4 relative z-10 pb-6 opacity-50">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-border-warm flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]">
                  <CircleDashed className="h-4 w-4 text-border-warm" />
                </div>
                <div className="pt-1.5">
                  <h4 className="font-bold text-text-primary text-sm">Ready to Serve</h4>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4 relative z-10 opacity-50">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-border-warm flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFF]">
                  <CircleDashed className="h-4 w-4 text-border-warm" />
                </div>
                <div className="pt-1.5">
                  <h4 className="font-bold text-text-primary text-sm">Served</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Item Level Breakdown */}
          <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4 border-b border-border-warm pb-2">Item Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-text-primary">1x Margherita Pizza</span>
                <span className="text-xs font-bold text-ready-blue bg-ready-blue/10 px-2 py-1 rounded">Preparing</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-text-primary">1x Cheese Burger</span>
                <span className="text-xs font-bold text-ready-blue bg-ready-blue/10 px-2 py-1 rounded">Preparing</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-text-primary">2x Cappuccino</span>
                <span className="text-xs font-bold text-primary-green bg-primary-green/10 px-2 py-1 rounded flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1 border-border-warm text-text-secondary hover:bg-bg-secondary">
              <Bell className="mr-2 h-4 w-4" /> Waiter
            </Button>
            <Button className="flex-[2]" onClick={() => router.push(`/order/${token}/payment`)}>
              <Receipt className="mr-2 h-4 w-4" /> Pay ₹794.40
            </Button>
          </div>

        </div>
      </div>
    </CustomerMobileShell>
  );
}
