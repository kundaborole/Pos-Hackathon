"use client";

import * as React from "react";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullProduct, ValidatedSession } from "@/lib/api/customer";
import { useCustomerCart } from "@/hooks/use-customer-cart";

export default function ProductClient({
  product,
  session
}: {
  product: FullProduct;
  session: ValidatedSession;
}) {
  const router = useRouter();
  const { addItem } = useCustomerCart();

  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariants, setSelectedVariants] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach(group => {
        if (group.values && group.values.length > 0) {
          initial[group.id] = group.values[0].id; // Default to first option
        }
      });
    }
    return initial;
  });
  
  const [selectedAddons, setSelectedAddons] = React.useState<Set<string>>(new Set());
  const [instructions, setInstructions] = React.useState("");

  const handleVariantSelect = (groupId: string, valueId: string) => {
    setSelectedVariants(prev => ({ ...prev, [groupId]: valueId }));
  };

  const handleAddonToggle = (addonId: string) => {
    const next = new Set(selectedAddons);
    if (next.has(addonId)) next.delete(addonId);
    else next.add(addonId);
    setSelectedAddons(next);
  };

  let unitPrice = product.base_price;
  
  // Calculate variant additions
  if (product.variants) {
    product.variants.forEach(group => {
      const selectedValueId = selectedVariants[group.id];
      if (selectedValueId) {
        const val = group.values?.find(v => v.id === selectedValueId);
        if (val) unitPrice += Number(val.price_delta);
      }
    });
  }

  // Calculate addon additions
  if (product.addons) {
    product.addons.forEach(a => {
      if (selectedAddons.has(a.id)) unitPrice += Number(a.price);
    });
  }

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const cartVariants = product.variants?.map(group => {
      const valId = selectedVariants[group.id];
      const val = group.values?.find(v => v.id === valId);
      if (!val) return null;
      return {
        id: val.id,
        name: val.name,
        priceDelta: Number(val.price_delta),
        variantGroupId: group.id,
        variantGroupName: group.name
      };
    }).filter(Boolean) as Array<{ id: string; name: string; priceDelta: number; variantGroupId: string; variantGroupName: string }>;

    const cartAddons = product.addons?.filter(a => selectedAddons.has(a.id)).map(a => ({
      id: a.id,
      name: a.name,
      price: Number(a.price)
    })) || [];

    addItem({
      productId: product.id,
      name: product.name,
      basePrice: Number(product.base_price),
      quantity,
      variants: cartVariants,
      addons: cartAddons,
      specialInstructions: instructions
    });

    router.push(`/order/${session.public_token}/cart`);
  };

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
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold text-xl">{product.name}</div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 bg-white">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-black text-text-primary leading-tight">{product.name}</h1>
            <span className="text-xl font-bold text-text-primary">₹{product.base_price}</span>
          </div>
          <p className="text-sm text-text-secondary">
            {product.description || "Delicious preparation tailored to perfection."}
          </p>
        </div>

        {/* Variants */}
        {product.variants && product.variants.map(group => (
          <div key={group.id} className="mt-2 bg-white p-4">
            <h3 className="font-bold text-text-primary mb-3">{group.name}</h3>
            <div className="space-y-3">
              {group.values?.map(val => (
                <label key={val.id} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name={`variant-${group.id}`}
                      className="w-5 h-5 text-primary-green focus:ring-primary-green accent-primary-green"
                      checked={selectedVariants[group.id] === val.id}
                      onChange={() => handleVariantSelect(group.id, val.id)}
                    />
                    <span className="text-sm font-medium text-text-primary">{val.name}</span>
                  </div>
                  {Number(val.price_delta) > 0 && (
                    <span className="text-sm text-text-secondary">+₹{val.price_delta}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-warm p-4 pb-safe flex items-center justify-between w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
          
          <Button className="flex-1 ml-6 h-12" onClick={handleAddToCart}>
            Add to Cart - ₹{totalPrice.toFixed(2)}
          </Button>
        </div>

      </div>
    </CustomerMobileShell>
  );
}
