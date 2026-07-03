"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { useCustomerCart } from "@/hooks/use-customer-cart";
import { ValidatedSession } from "@/lib/api/customer";
import { submitQrOrderAction } from "./actions";

export default function CartClient({ session }: { session: ValidatedSession }) {
  const router = useRouter();
  
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCustomerCart();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const subtotal = getTotal();
  const tax = subtotal * 0.1513; // Simulated tax for UI calculation
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const payloadItems = items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        special_instructions: item.specialInstructions,
        variants: item.variants.map(v => ({ value_id: v.id })),
        addons: item.addons.map(a => ({ addon_id: a.id }))
      }));

      const res = await submitQrOrderAction(session.public_token, payloadItems, "");

      if (res.success && res.orderId) {
        clearCart(); // Clear local cart
        router.push(`/order/${session.public_token}/track/${res.orderId}`);
      } else {
        setError(res.error || "Failed to place order.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerMobileShell>
      <div className="flex flex-col min-h-screen bg-bg-surface relative">
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-border-warm pt-safe px-4 py-3">
          <h1 className="text-xl font-black text-text-primary">Your Cart</h1>
          <div className="text-xs font-bold text-text-secondary">{session.restaurant_name} • Table {session.table_number}</div>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-4 flex-1 pb-32">
          {error && (
            <div className="bg-coral/10 text-coral p-3 rounded-lg text-sm font-medium border border-coral/20">
              {error}
            </div>
          )}

          {items.map(item => (
            <div key={item.cartItemId} className="bg-white border border-border-warm rounded-xl p-3 shadow-sm flex flex-col">
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-text-primary leading-tight">{item.name}</h3>
                    <button onClick={() => removeItem(item.cartItemId)} className="text-text-secondary hover:text-coral p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {item.variants.length > 0 && <div>Variants: {item.variants.map(v => v.name).join(', ')}</div>}
                    {item.addons.length > 0 && <div>Add-ons: {item.addons.map(a => a.name).join(', ')}</div>}
                  </div>
                  <div className="font-black text-text-primary mt-1">₹{item.totalPrice.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-border-warm pt-3">
                <div className="text-xs text-text-secondary italic line-clamp-1 max-w-[150px]">
                  {item.specialInstructions || "No special instructions"}
                </div>
                <div className="flex items-center space-x-3 bg-bg-secondary rounded-full px-2 py-1">
                  <button 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-50"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-white text-primary-green flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
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
            onClick={() => router.push(`/order/${session.public_token}/menu`)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add More Items
          </Button>

          {/* Financial Summary */}
          {items.length > 0 && (
            <div className="bg-white border border-border-warm rounded-xl p-4 mt-6 space-y-2">
              <h3 className="font-bold text-text-primary mb-3">Bill Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Item Total</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Taxes & Charges (est)</span>
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
        {items.length > 0 && (
          <div className="fixed bottom-[65px] left-0 right-0 z-50 max-w-[430px] mx-auto bg-white border-t border-border-warm p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Button 
              className="w-full h-14 text-lg shadow-md font-black"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing Order...</>
              ) : (
                <>Place Order <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        )}

      </div>
    </CustomerMobileShell>
  );
}
