"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, ReceiptText, Utensils } from "lucide-react";

export default function PaymentSuccessPage({ params }: { params: { tableToken: string } }) {
  const router = useRouter();
  const token = params.tableToken;
  
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const scrollToReceipt = () => {
    receiptRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <CustomerMobileShell hideNav>
      <div className="flex flex-col min-h-screen bg-bg-surface relative">
        
        {/* Success Header */}
        <div className="bg-primary-forest px-4 pt-12 pb-16 text-center rounded-b-[40px] shadow-sm relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
            <div className="w-14 h-14 bg-primary-green rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Payment Successful!</h1>
          <div className="text-4xl font-black text-white mb-4">₹794.40</div>
          
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white text-sm">
            <span className="font-medium opacity-80">Paid via UPI</span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span className="font-bold tracking-wider uppercase text-primary-green">Paid</span>
          </div>
        </div>

        <div className="px-4 -mt-8 relative z-20 space-y-4">
          
          {/* Quick Info Card */}
          <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Order Number</div>
              <div className="font-black text-text-primary">#ORD000124</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Table</div>
              <div className="font-black text-text-primary">03</div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-14 bg-white border-border-warm text-text-primary hover:bg-bg-secondary" onClick={scrollToReceipt}>
              <ReceiptText className="mr-2 h-4 w-4 text-text-secondary" /> View Receipt
            </Button>
            <Button className="h-14 bg-primary-forest text-white hover:bg-primary-forest/90" onClick={() => router.push(`/order/${token}/menu`)}>
              <Utensils className="mr-2 h-4 w-4" /> Order More
            </Button>
          </div>

          {/* Rating Prompt */}
          <div className="bg-white border border-border-warm rounded-2xl p-6 shadow-sm text-center mt-2">
            <h3 className="font-bold text-text-primary mb-2">How was your food?</h3>
            <p className="text-xs text-text-secondary mb-4">Rate your experience to help us improve</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-border-warm hover:border-muted-gold text-muted-gold/30 hover:text-muted-gold transition-colors">
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Digital Receipt (scrollable) */}
        <div ref={receiptRef} className="px-4 mt-8 pb-12">
          <div className="bg-white border border-border-warm rounded-t-2xl border-b-0 p-6 relative">
            
            {/* Scalloped top edge decoration */}
            <div className="absolute top-0 left-0 right-0 h-3 flex overflow-hidden -mt-1.5 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-border-warm -ml-2 shrink-0"></div>
              ))}
            </div>

            <div className="text-center mb-6 pt-2">
              <h2 className="font-black text-xl text-text-primary mb-1">Cafe Hub</h2>
              <p className="text-xs text-text-secondary">Digital Receipt</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-primary">1x Margherita Pizza</span>
                <span className="text-text-secondary">₹250.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-primary">1x Cheese Burger</span>
                <span className="text-text-secondary">₹200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-primary">2x Cappuccino</span>
                <span className="text-text-secondary">₹240.00</span>
              </div>
            </div>

            <div className="border-t border-border-warm border-dashed pt-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium text-text-primary">₹690.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax (15.13%)</span>
                <span className="font-medium text-text-primary">₹104.40</span>
              </div>
            </div>

            <div className="bg-bg-secondary rounded-lg p-4 flex justify-between items-center">
              <span className="font-bold text-text-primary">Total Paid</span>
              <span className="text-xl font-black text-primary-forest">₹794.40</span>
            </div>
            
            <div className="text-center text-[10px] text-text-secondary mt-6 font-medium">
              Thank you for dining with us!<br/>
              GSTIN: 27AAAAA0000A1Z5
            </div>

          </div>
          
          {/* Jagged bottom edge decoration */}
          <div className="bg-white border border-border-warm border-t-0 h-4 relative overflow-hidden rounded-b-lg">
            <div className="absolute bottom-0 left-0 right-0 h-3 flex overflow-hidden -mb-1.5 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-border-warm -ml-2 shrink-0"></div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </CustomerMobileShell>
  );
}
