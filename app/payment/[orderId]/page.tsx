"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Banknote, QrCode, CheckCircle2, ChevronLeft, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentState = 'selecting' | 'processing_upi' | 'success';

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const [paymentState, setPaymentState] = React.useState<PaymentState>('selecting');
  
  // Hardcoded mock order as requested
  const orderId = params.orderId;
  const table = "03";
  const subtotal = 690.00;
  const tax = 104.40;
  const total = 794.40;
  
  const items = [
    { name: "Margherita Pizza", qty: 1, price: 250 },
    { name: "Cheese Burger", qty: 1, price: 200 },
    { name: "Cappuccino", qty: 2, price: 240 },
  ];

  const handleUPISelect = () => {
    setPaymentState('processing_upi');
  };

  const confirmPayment = () => {
    setPaymentState('success');
  };

  const cancelUPI = () => {
    setPaymentState('selecting');
  };

  if (paymentState === 'success') {
    return (
      <div className="min-h-screen bg-primary-forest flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-bg-surface rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-primary-green rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Payment Successful</h1>
          <div className="text-4xl font-black text-primary-forest mb-6">₹{total.toFixed(2)}</div>
          
          <div className="w-full bg-bg-secondary rounded-lg p-4 mb-8 space-y-2 text-sm text-text-secondary text-left">
            <div className="flex justify-between"><span>Order</span><span className="font-medium text-text-primary">#{orderId}</span></div>
            <div className="flex justify-between"><span>Table</span><span className="font-medium text-text-primary">{table}</span></div>
            <div className="flex justify-between"><span>Method</span><span className="font-medium text-text-primary">UPI</span></div>
            <div className="flex justify-between"><span>Status</span><span className="font-bold text-primary-green uppercase">Paid</span></div>
          </div>

          <div className="w-full space-y-3">
            <Link href="/floor" className="block w-full">
              <Button className="w-full h-14 text-base font-bold">Return to Floor View</Button>
            </Link>
            <Button variant="ghost" className="w-full h-12 border border-border-warm bg-bg-surface"><Receipt className="mr-2 h-4 w-4"/> View Receipt</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg-base">
      
      {/* Left Column: Order Summary */}
      <div className="w-full md:w-[350px] lg:w-[400px] bg-bg-surface border-r border-border-warm flex flex-col shrink-0">
        <div className="p-6 border-b border-border-warm bg-primary-forest text-white">
          <Link href="/pos" className="inline-block mb-6 text-white/80 hover:text-white transition-colors">
            <div className="flex items-center text-sm font-medium">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to POS
            </div>
          </Link>
          <h2 className="text-2xl font-bold">Order #{orderId}</h2>
          <div className="flex justify-between mt-2 text-white/80">
            <span>Table {table}</span>
            <span>Dine In</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <h3 className="font-semibold text-text-primary mb-4">Order Details</h3>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-medium text-text-primary mr-2">{item.name}</span>
                  <span className="text-text-secondary">× {item.qty}</span>
                </div>
                <div className="font-medium text-text-primary">₹{item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-bg-secondary/50 border-t border-border-warm">
          <div className="space-y-2 text-sm text-text-secondary mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold text-text-primary">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Payment Interaction */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {paymentState === 'selecting' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Select Payment</h1>
                <p className="text-text-secondary mt-2">Choose how the customer wants to pay.</p>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={handleUPISelect}
                  className="flex items-center p-6 bg-bg-surface border-2 border-border-warm rounded-xl hover:border-primary-green hover:shadow-md transition-all group text-left"
                >
                  <div className="w-12 h-12 bg-primary-green/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary-green group-hover:text-white transition-colors">
                    <QrCode className="h-6 w-6 text-primary-green group-hover:text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-text-primary">UPI QR</div>
                    <div className="text-sm text-text-secondary">Scan to pay via GPay, PhonePe, Paytm</div>
                  </div>
                </button>
                
                <button className="flex items-center p-6 bg-bg-surface border-2 border-border-warm rounded-xl hover:border-primary-green hover:shadow-md transition-all group text-left">
                  <div className="w-12 h-12 bg-ready-blue/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-ready-blue group-hover:text-white transition-colors">
                    <CreditCard className="h-6 w-6 text-ready-blue group-hover:text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-text-primary">Card Terminal</div>
                    <div className="text-sm text-text-secondary">Credit or Debit card</div>
                  </div>
                </button>

                <button className="flex items-center p-6 bg-bg-surface border-2 border-border-warm rounded-xl hover:border-primary-green hover:shadow-md transition-all group text-left">
                  <div className="w-12 h-12 bg-muted-gold/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-muted-gold group-hover:text-white transition-colors">
                    <Banknote className="h-6 w-6 text-muted-gold group-hover:text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-text-primary">Cash</div>
                    <div className="text-sm text-text-secondary">Exact or with change</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {paymentState === 'processing_upi' && (
            <div className="bg-bg-surface border border-border-warm rounded-2xl p-8 shadow-lg text-center animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="flex justify-start mb-6">
                <button onClick={cancelUPI} className="text-text-secondary hover:text-text-primary flex items-center text-sm font-medium">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-text-primary mb-2">Scan to Pay</h2>
              <p className="text-text-secondary mb-8">Customer can scan this QR code with any UPI app</p>
              
              {/* Mock QR Placeholder */}
              <div className="w-64 h-64 mx-auto bg-white border-2 border-border-warm rounded-xl flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                <QrCode className="h-32 w-32 text-text-secondary opacity-20" />
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80 mix-blend-multiply"></div>
              </div>

              <div className="space-y-1 mb-8">
                <div className="text-3xl font-black text-primary-forest">₹{total.toFixed(2)}</div>
                <div className="text-sm font-medium text-text-secondary">cafehub@upi</div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-ready-blue animate-pulse mb-6">
                <div className="w-2 h-2 bg-ready-blue rounded-full"></div>
                <span className="font-medium text-sm">Waiting for confirmation...</span>
              </div>

              <Button onClick={confirmPayment} className="w-full h-14 text-base font-bold bg-primary-green hover:bg-primary-hover shadow-md">
                Mock: Simulate Payment Success
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
