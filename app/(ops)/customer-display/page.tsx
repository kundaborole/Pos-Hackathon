"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChefHat, ShoppingBag } from "lucide-react";

type OrderStatus = 'Preparing' | 'Ready' | 'Served';

export default function CustomerDisplayPage() {
  // Use a hidden toggle to cycle through states for demonstration purposes
  const [status, setStatus] = React.useState<OrderStatus>('Preparing');

  const cycleStatus = () => {
    setStatus(prev => {
      if (prev === 'Preparing') return 'Ready';
      if (prev === 'Ready') return 'Served';
      return 'Preparing';
    });
  };

  const isPreparing = status === 'Preparing' || status === 'Ready' || status === 'Served';
  const isReady = status === 'Ready' || status === 'Served';
  const isServed = status === 'Served';

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden relative selection:bg-transparent">
      {/* Hidden toggle area for demonstration */}
      <button onClick={cycleStatus} className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-default" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Order Details */}
        <div className="w-full md:w-1/3 bg-bg-surface border-r border-border-warm flex flex-col p-8 lg:p-12 shadow-2xl z-20">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-text-secondary tracking-widest uppercase mb-2">Order Number</h2>
            <div className="text-5xl lg:text-7xl font-black text-primary-forest tracking-tighter">#124</div>
            <div className="mt-4 text-xl font-medium text-text-secondary">Table 03</div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-start text-xl lg:text-2xl font-medium text-text-primary">
              <div>
                <span>1x</span> <span className="ml-2">Margherita Pizza</span>
              </div>
            </div>
            <div className="flex justify-between items-start text-xl lg:text-2xl font-medium text-text-primary">
              <div>
                <span>1x</span> <span className="ml-2">Cheese Burger</span>
              </div>
            </div>
            <div className="flex justify-between items-start text-xl lg:text-2xl font-medium text-text-primary">
              <div>
                <span>2x</span> <span className="ml-2">Cappuccino</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t-2 border-border-warm mt-auto">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-lg text-text-secondary uppercase tracking-wider font-bold mb-1">Total</div>
                <div className="text-4xl font-black text-text-primary">₹794.40</div>
              </div>
              <div className="bg-primary-green/10 text-primary-green px-4 py-2 rounded-lg font-bold text-xl uppercase tracking-widest border border-primary-green/20">
                Paid
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Status Tracker */}
        <div className="flex-1 bg-bg-base flex flex-col items-center justify-center p-8 lg:p-20 relative">
          
          {/* Big Status Banner */}
          <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {status === 'Preparing' && (
              <>
                <div className="w-32 h-32 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <ChefHat className="h-16 w-16 text-amber-600" />
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-amber-600 tracking-tight">Preparing...</h1>
                <p className="text-2xl text-text-secondary mt-6 font-medium">Your delicious meal is being cooked.</p>
              </>
            )}
            {status === 'Ready' && (
              <>
                <div className="w-32 h-32 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <ShoppingBag className="h-16 w-16 text-coral" />
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-coral tracking-tight">Order is Ready!</h1>
                <p className="text-2xl text-text-secondary mt-6 font-medium">Please collect it from the counter.</p>
              </>
            )}
            {status === 'Served' && (
              <>
                <div className="w-32 h-32 bg-primary-green/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="h-16 w-16 text-primary-green" />
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-primary-green tracking-tight">Enjoy your meal!</h1>
                <p className="text-2xl text-text-secondary mt-6 font-medium">Thank you for dining with Cafe Hub.</p>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-3xl flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-border-warm -translate-y-1/2 z-0 rounded-full"></div>
            
            <div className="absolute top-1/2 left-0 h-2 bg-primary-green -translate-y-1/2 z-0 rounded-full transition-all duration-1000 ease-in-out" 
                 style={{ width: status === 'Preparing' ? '0%' : status === 'Ready' ? '50%' : '100%' }}>
            </div>

            <div className={cn("relative z-10 flex flex-col items-center transition-all duration-500", isPreparing ? "scale-110" : "opacity-50 grayscale")}>
              <div className={cn("w-16 h-16 rounded-full border-4 flex items-center justify-center bg-bg-surface transition-colors duration-500", 
                isPreparing ? "border-primary-green text-primary-green" : "border-border-warm text-border-warm")}>
                <ChefHat className="h-8 w-8" />
              </div>
              <div className={cn("mt-4 text-xl font-bold transition-colors duration-500", isPreparing ? "text-primary-green" : "text-text-secondary")}>Preparing</div>
            </div>

            <div className={cn("relative z-10 flex flex-col items-center transition-all duration-500", isReady ? "scale-110" : "opacity-50 grayscale")}>
              <div className={cn("w-16 h-16 rounded-full border-4 flex items-center justify-center bg-bg-surface transition-colors duration-500", 
                isReady ? "border-primary-green text-primary-green" : "border-border-warm text-border-warm")}>
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className={cn("mt-4 text-xl font-bold transition-colors duration-500", isReady ? "text-primary-green" : "text-text-secondary")}>Ready</div>
            </div>

            <div className={cn("relative z-10 flex flex-col items-center transition-all duration-500", isServed ? "scale-110" : "opacity-50 grayscale")}>
              <div className={cn("w-16 h-16 rounded-full border-4 flex items-center justify-center bg-bg-surface transition-colors duration-500", 
                isServed ? "border-primary-green text-primary-green" : "border-border-warm text-border-warm")}>
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className={cn("mt-4 text-xl font-bold transition-colors duration-500", isServed ? "text-primary-green" : "text-text-secondary")}>Served</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
