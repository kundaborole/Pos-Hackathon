"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, MapPin, Search } from "lucide-react";

export default function OrderConfirmationPage({ params }: { params: Promise<{ tableToken: string }> }) {
  const router = useRouter();
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setToken(p.tableToken));
  }, [params]);
  
  if (!token) return null;

  return (
    <CustomerMobileShell hideNav>
      <div className="flex flex-col min-h-screen bg-primary-forest relative p-6">
        
        {/* Confetti / Success Graphic Area */}
        <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-4">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-white text-center mb-2">Order Confirmed!</h1>
          <p className="text-white/80 text-center text-sm px-4">
            The kitchen has received your order and is starting preparation.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-2xl p-6 relative">
          
          {/* Jagged top edge effect using CSS radial gradients if needed, or just standard box */}
          
          <div className="text-center pb-4 border-b border-border-warm border-dashed mb-4">
            <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Order Number</div>
            <div className="text-3xl font-black text-text-primary">#ORD000124</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-secondary rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <MapPin className="h-5 w-5 text-text-secondary mb-1" />
              <span className="text-xs text-text-secondary font-medium">Table</span>
              <span className="font-bold text-text-primary">03</span>
            </div>
            <div className="bg-bg-secondary rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <Clock className="h-5 w-5 text-primary-green mb-1" />
              <span className="text-xs text-text-secondary font-medium">Est. Time</span>
              <span className="font-bold text-text-primary">15-20 min</span>
            </div>
          </div>

          {/* Compact Item Summary */}
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-warm pb-2">Order Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-primary">1x Margherita Pizza</span>
              <span className="text-text-secondary">₹250</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-primary">1x Cheese Burger</span>
              <span className="text-text-secondary">₹200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-primary">2x Cappuccino</span>
              <span className="text-text-secondary">₹240</span>
            </div>
          </div>

          <div className="border-t border-border-warm border-dashed pt-4 flex justify-between items-center">
            <span className="font-bold text-text-secondary">Total Amount</span>
            <span className="text-xl font-black text-text-primary">₹794.40</span>
          </div>

        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button 
            className="w-full h-14 bg-white text-primary-forest hover:bg-bg-surface text-lg font-bold"
            onClick={() => router.push(`/order/${token}/track/ORD000124`)}
          >
            Track Order Progress
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-14 text-white hover:bg-white/10 font-bold"
            onClick={() => router.push(`/order/${token}/menu`)}
          >
            <Search className="mr-2 h-4 w-4" /> Continue Browsing
          </Button>
        </div>

      </div>
    </CustomerMobileShell>
  );
}
