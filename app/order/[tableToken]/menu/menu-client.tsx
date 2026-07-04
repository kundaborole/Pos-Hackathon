"use client";

import * as React from "react";
import Link from "next/link";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FullCategory, ValidatedSession } from "@/lib/api/customer";
import { useCustomerCart } from "@/hooks/use-customer-cart";

export default function MenuClient({
  categories,
  session
}: {
  categories: FullCategory[];
  session: ValidatedSession;
}) {
  const [activeCategory, setActiveCategory] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { items, addItem } = useCustomerCart();

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Flatten products for "ALL" view or filtered view
  const filteredProducts = categories
    .flatMap(cat => cat.products)
    .filter(p => {
      const matchesCategory = activeCategory === "ALL" || p.category_id === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  return (
    <CustomerMobileShell>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-bg-surface border-b border-border-warm pt-safe">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">{session.restaurant_name}</h1>
            <div className="text-xs font-bold text-text-secondary">{session.floor_name} - Table {session.table_number} • Dine In</div>
          </div>
          <Link href={`/order/${session.public_token}/cart`} className="relative p-2 bg-bg-secondary rounded-full">
            <ShoppingBag className="h-5 w-5 text-text-primary" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-green text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input 
              className="pl-9 bg-bg-secondary border-none" 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-3 overflow-x-auto hide-scrollbar flex space-x-2">
          <button 
            onClick={() => setActiveCategory("ALL")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              activeCategory === "ALL" 
                ? "bg-primary-forest text-white" 
                : "bg-bg-secondary text-text-secondary hover:bg-border-warm"
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                activeCategory === cat.id 
                  ? "bg-primary-forest text-white" 
                  : "bg-bg-secondary text-text-secondary hover:bg-border-warm"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 space-y-4">
        {filteredProducts.map(product => (
          <Link key={product.id} href={`/order/${session.public_token}/product/${product.id}`} className="block">
            <div className="bg-white border border-border-warm rounded-xl p-3 flex gap-3 shadow-sm hover:border-primary-green transition-colors">
              <div className="w-24 h-24 bg-bg-secondary rounded-lg shrink-0 flex items-center justify-center text-xs text-text-secondary overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-center opacity-50 px-2">{product.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col py-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-text-primary leading-tight">{product.name}</h3>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                  {product.description || "Delicious preparation tailored to perfection."}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-black text-text-primary text-sm">₹{product.base_price.toFixed(2)}</span>
                  {!product.is_available ? (
                    <span className="text-[10px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded">Sold Out</span>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const hasOptions = (product.variants && product.variants.length > 0) || (product.addons && product.addons.length > 0);
                        if (hasOptions) {
                          // Navigate to details if options exist
                          window.location.href = `/order/${session.public_token}/product/${product.id}`;
                        } else {
                          // Directly add to cart
                          addItem({
                            productId: product.id,
                            name: product.name,
                            basePrice: Number(product.base_price),
                            quantity: 1,
                            variants: [],
                            addons: [],
                            specialInstructions: ""
                          });
                        }
                      }}
                      className="bg-primary-forest text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm border border-primary-green/20"
                    >
                      ADD +
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            No products found matching your criteria.
          </div>
        )}
      </div>

    </CustomerMobileShell>
  );
}
