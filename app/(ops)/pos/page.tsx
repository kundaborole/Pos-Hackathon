"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, Trash2, ArrowRight, PauseCircle } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_POS_SESSION, Product } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
}

export default function POSOrderScreen() {
  const [activeCategory, setActiveCategory] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesCat = activeCategory === "ALL" || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch && p.availableForSale;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, cartItemId: Math.random().toString() }];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% mock tax
  const total = subtotal + tax;

  return (
    <div className="flex h-full w-full bg-bg-base overflow-hidden">
      
      {/* LEFT: Category Nav */}
      <div className="w-24 md:w-32 bg-bg-surface border-r border-border-warm flex flex-col overflow-y-auto shrink-0">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={cn(
            "p-4 text-center border-b border-border-warm transition-colors min-h-[80px] flex items-center justify-center font-medium text-sm",
            activeCategory === "ALL" ? "bg-primary-green/10 text-primary-green border-l-4 border-l-primary-green" : "text-text-secondary hover:bg-bg-secondary"
          )}
        >
          All
        </button>
        {MOCK_CATEGORIES.filter(c => c.active).map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "p-4 text-center border-b border-border-warm transition-colors min-h-[80px] flex items-center justify-center font-medium text-sm",
              activeCategory === cat.id ? "bg-primary-green/10 text-primary-green border-l-4 border-l-primary-green" : "text-text-secondary hover:bg-bg-secondary"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* CENTER: Product Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg-base relative">
        <div className="p-4 bg-bg-surface border-b border-border-warm shrink-0 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 bg-bg-secondary border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="hidden lg:flex text-xs text-text-secondary space-x-4 ml-4">
            <div>Session: <span className="font-medium text-text-primary">{MOCK_POS_SESSION.id}</span></div>
            <div>Cashier: <span className="font-medium text-text-primary">{MOCK_POS_SESSION.cashier}</span></div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-bg-surface rounded-xl overflow-hidden border border-border-warm shadow-sm hover:shadow-md hover:border-primary-green/50 transition-all text-left flex flex-col group active:scale-95"
              >
                <div className="h-32 bg-bg-secondary w-full relative">
                  {/* Image Placeholder */}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm leading-tight group-hover:text-primary-green transition-colors line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="font-bold text-text-primary mt-2">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart Panel */}
      <div className="w-80 lg:w-96 bg-bg-surface border-l border-border-warm flex flex-col shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-border-warm bg-bg-secondary/50 flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-text-primary">Current Order</h2>
            <div className="text-xs font-semibold bg-ready-blue/10 text-ready-blue px-2 py-1 rounded">Table 03</div>
          </div>
          <div className="flex justify-between items-center text-xs text-text-secondary">
            <span>Dine In</span>
            <span>Source: POS</span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary space-y-2">
              <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-2">
                <Search className="h-8 w-8 opacity-20" />
              </div>
              <p>Cart is empty</p>
              <p className="text-xs">Select items from the catalog</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="flex gap-3 pb-4 border-b border-border-warm last:border-0 last:pb-0">
                <div className="flex flex-col items-center justify-between bg-bg-secondary rounded-lg p-1 w-10 shrink-0 h-[88px]">
                  <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 hover:bg-bg-surface rounded text-text-primary"><Plus className="h-4 w-4" /></button>
                  <span className="font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 hover:bg-bg-surface rounded text-text-primary"><Minus className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-text-primary text-sm line-clamp-2">{item.name}</h4>
                    <span className="font-bold text-sm ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="mt-auto flex justify-between items-end pt-2">
                    <div className="text-xs text-text-secondary">
                      ${item.price.toFixed(2)} each
                    </div>
                    <button onClick={() => removeFromCart(item.cartItemId)} className="text-coral hover:bg-coral/10 p-1.5 rounded transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 bg-bg-surface border-t border-border-warm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5 mb-4 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-text-primary pt-2 border-t border-border-warm mt-2">
              <span>Total</span>
              <span className="text-primary-forest">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button variant="ghost" className="w-full text-xs h-10 border border-border-warm bg-bg-surface" onClick={() => setCart([])}>
              Clear Cart
            </Button>
            <Button variant="secondary" className="w-full text-xs h-10">
              <PauseCircle className="mr-1.5 h-4 w-4" /> Hold Order
            </Button>
          </div>
          <Link href="/payment/ORD000124" className="block">
            <Button 
              className="w-full h-14 text-base font-bold bg-primary-green hover:bg-primary-hover shadow-md"
              disabled={cart.length === 0}
            >
              Take Payment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}
