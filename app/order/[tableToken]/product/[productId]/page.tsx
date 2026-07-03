"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductDetailsPage({ params }: { params: { tableToken: string, productId: string } }) {
  const router = useRouter();
  const token = params.tableToken;
  const product = MOCK_PRODUCTS.find(p => p.id === params.productId);

  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState<string | null>(
    product?.variants?.[0]?.id || null
  );
  const [selectedAddons, setSelectedAddons] = React.useState<Set<string>>(new Set());
  const [instructions, setInstructions] = React.useState("");

  if (!product) {
    return (
      <CustomerMobileShell hideNav>
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
          <p>Product not found.</p>
          <Button onClick={() => router.push(`/order/${token}/menu`)}>Back to Menu</Button>
        </div>
      </CustomerMobileShell>
    );
  }

  const handleAddonToggle = (addonId: string) => {
    const next = new Set(selectedAddons);
    if (next.has(addonId)) {
      next.delete(addonId);
    } else {
      next.add(addonId);
    }
    setSelectedAddons(next);
  };

  // Calculate total price for CTA
  let unitPrice = product.price;
  if (selectedVariant && product.variants) {
    const v = product.variants.find(v => v.id === selectedVariant);
    if (v) unitPrice += v.additionalPrice;
  }
  if (product.addons) {
    product.addons.forEach(a => {
      if (selectedAddons.has(a.id)) unitPrice += a.price;
    });
  }
  const totalPrice = unitPrice * quantity;

  return (
    <CustomerMobileShell hideNav>
      <div className="flex flex-col min-h-screen bg-bg-surface relative pb-28">
        
        {/* Header Image & Back Button */}
        <div className="relative w-full h-64 bg-bg-secondary">
          <button 
            onClick={() => router.back()}
            className="absolute top-safe mt-4 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary">No Image</div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 bg-white">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-black text-text-primary leading-tight">{product.name}</h1>
            <span className="text-xl font-bold text-text-primary">₹{product.price}</span>
          </div>
          <p className="text-sm text-text-secondary">
            {product.description || "Delicious preparation tailored to perfection."}
          </p>
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-2 bg-white p-4">
            <h3 className="font-bold text-text-primary mb-3">Size Options</h3>
            <div className="space-y-3">
              {product.variants.map(variant => (
                <label key={variant.id} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="variant"
                      className="w-5 h-5 text-primary-green focus:ring-primary-green accent-primary-green"
                      checked={selectedVariant === variant.id}
                      onChange={() => setSelectedVariant(variant.id)}
                    />
                    <span className="text-sm font-medium text-text-primary">{variant.name}</span>
                  </div>
                  {variant.additionalPrice > 0 && (
                    <span className="text-sm text-text-secondary">+₹{variant.additionalPrice}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Addons */}
        {product.addons && product.addons.length > 0 && (
          <div className="mt-2 bg-white p-4">
            <h3 className="font-bold text-text-primary mb-3">Add-ons</h3>
            <div className="space-y-3">
              {product.addons.map(addon => (
                <label key={addon.id} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-primary-green focus:ring-primary-green rounded accent-primary-green"
                      checked={selectedAddons.has(addon.id)}
                      onChange={() => handleAddonToggle(addon.id)}
                    />
                    <span className="text-sm font-medium text-text-primary">{addon.name}</span>
                  </div>
                  <span className="text-sm text-text-secondary">+₹{addon.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="mt-2 bg-white p-4">
          <h3 className="font-bold text-text-primary mb-3">Special Instructions</h3>
          <textarea 
            className="w-full border border-border-warm rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-green min-h-[80px]"
            placeholder="e.g. Less spicy, allergy notes..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {/* Sticky Footer CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-warm p-4 pb-safe flex items-center justify-between max-w-[430px] mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center space-x-4">
            <button 
              className="w-10 h-10 rounded-full border border-border-warm flex items-center justify-center hover:bg-bg-secondary disabled:opacity-50"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-bold text-lg w-4 text-center">{quantity}</span>
            <button 
              className="w-10 h-10 rounded-full border border-primary-green text-primary-green flex items-center justify-center hover:bg-primary-green/10"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <Button className="flex-1 ml-6 h-12" onClick={() => router.push(`/order/${token}/cart`)}>
            Add to Cart - ₹{totalPrice}
          </Button>
        </div>

      </div>
    </CustomerMobileShell>
  );
}
