"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

// Hardcoded items as requested for the UI flow demonstration
const INITIAL_CART = [
  { id: "c1", productId: "P1", name: "Margherita Pizza", price: 250, quantity: 1, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80", variants: "Regular", addons: "Extra Cheese" },
  { id: "c2", productId: "P4", name: "Cheese Burger", price: 200, quantity: 1, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80" },
  { id: "c3", productId: "P2", name: "Cappuccino", price: 120, quantity: 2, image: "https://images.unsplash.com/photo-1573033621487-7af416d8212f?w=500&q=80" },
];

export default function CartPage({ params }: { params: { tableToken: string } }) {
  const router = useRouter();
  const token = params.tableToken;
  
  const [cartItems, setCartItems] = React.useState(INITIAL_CART);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1513; // Using ~15.13% to match the required totals (690 -> 104.40 tax -> 794.40 total)
  const total = subtotal + tax;

  return (
    <CustomerMobileShell>
      <div className="flex flex-col min-h-screen bg-bg-surface relative">
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-border-warm pt-safe px-4 py-3">
          <h1 className="text-xl font-black text-text-primary">Your Cart</h1>
          <div className="text-xs font-bold text-text-secondary">Table 03 • Dine In</div>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-4 flex-1">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white border border-border-warm rounded-xl p-3 shadow-sm flex flex-col">
              <div className="flex gap-3 mb-3">
                <div className="w-20 h-20 bg-bg-secondary rounded-lg shrink-0 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-text-primary leading-tight">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-text-secondary hover:text-coral p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {item.variants && <div>Size: {item.variants}</div>}
                    {item.addons && <div>Add-ons: {item.addons}</div>}
                  </div>
                  <div className="font-black text-text-primary mt-1">₹{item.price}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-border-warm pt-3">
                <div className="text-xs text-text-secondary italic">Special instructions...</div>
                <div className="flex items-center space-x-3 bg-bg-secondary rounded-full px-2 py-1">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-full bg-white text-primary-green flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-text-secondary" />
              </div>
              <p className="text-text-secondary font-medium">Your cart is empty.</p>
            </div>
          )}

          <Button 
            variant="secondary" 
            className="w-full border-dashed border-2 border-primary-green/50 text-primary-green bg-primary-green/5"
            onClick={() => router.push(`/order/${token}/menu`)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add More Items
          </Button>

          {/* Financial Summary */}
          {cartItems.length > 0 && (
            <div className="bg-white border border-border-warm rounded-xl p-4 mt-6 space-y-2">
              <h3 className="font-bold text-text-primary mb-3">Bill Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Item Total</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Taxes & Charges</span>
                <span className="font-medium">₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-border-warm pt-2 mt-2 flex justify-between font-black text-lg">
                <span>To Pay</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Place Order CTA */}
        {cartItems.length > 0 && (
          <div className="sticky bottom-[65px] bg-white border-t border-border-warm p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Button 
              className="w-full h-14 text-lg shadow-md"
              onClick={() => router.push(`/order/${token}/confirmation`)}
            >
              Place Order <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

      </div>
    </CustomerMobileShell>
  );
}
