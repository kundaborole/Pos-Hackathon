"use client";

import * as React from "react";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, Trash2, ArrowRight, PauseCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { FullProduct, CategoryWithProductCount } from "@/lib/api/products";
import { FloorWithTables } from "@/lib/api/floors";
import { submitPosOrderAction } from "./actions";
import { Database } from "@/types/supabase";

type POSSession = Database['public']['Tables']['pos_sessions']['Row'];

interface CartItem {
  cartItemId: string;
  product: FullProduct;
  quantity: number;
  selectedVariants: { value_id: string, name: string, price: number }[];
  selectedAddons: { addon_id: string, name: string, price: number }[];
  specialInstructions: string;
}

export default function POSOrderClient({
  products,
  categories,
  floors,
  activeSession,
  profileName,
  initialTableId
}: {
  products: FullProduct[];
  categories: CategoryWithProductCount[];
  floors: FloorWithTables[];
  activeSession: POSSession | null;
  profileName: string;
  initialTableId?: string;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = React.useState<string>(initialTableId || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Variant/Addon Selection Modal State
  const [selectedProduct, setSelectedProduct] = React.useState<FullProduct | null>(null);
  const [tempVariants, setTempVariants] = React.useState<Record<string, { value_id: string, name: string, price: number }>>({});
  const [tempAddons, setTempAddons] = React.useState<Record<string, { addon_id: string, name: string, price: number }>>({});

  const allTables = floors.flatMap(f => f.tables).filter(t => t.is_active);
  const activeTableObj = allTables.find(t => t.id === selectedTableId);

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === "ALL" || p.category_id === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleProductClick = (product: FullProduct) => {
    if ((product.variants && product.variants.length > 0) || (product.addons && product.addons.length > 0)) {
      setSelectedProduct(product);
      setTempVariants({});
      setTempAddons({});
    } else {
      addToCart(product, [], []);
    }
  };

  const confirmProductSelection = () => {
    if (!selectedProduct) return;
    
    // Convert temp objects to arrays
    const variantsList = Object.values(tempVariants);
    const addonsList = Object.values(tempAddons);
    
    addToCart(selectedProduct, variantsList, addonsList);
    setSelectedProduct(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addToCart = (product: FullProduct, variants: any[], addons: any[]) => {
    setCart(prev => {
      // Find exact match (same product, variants, and addons)
      const existing = prev.find(item => {
        if (item.product.id !== product.id) return false;
        
        const sameVariants = item.selectedVariants.length === variants.length && 
          item.selectedVariants.every(v => variants.find(nv => nv.value_id === v.value_id));
          
        const sameAddons = item.selectedAddons.length === addons.length && 
          item.selectedAddons.every(a => addons.find(na => na.addon_id === a.addon_id));
          
        return sameVariants && sameAddons && item.specialInstructions === "";
      });

      if (existing) {
        return prev.map(item => item.cartItemId === existing.cartItemId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { 
        cartItemId: crypto.randomUUID(), 
        product, 
        quantity: 1, 
        selectedVariants: variants,
        selectedAddons: addons,
        specialInstructions: ""
      }];
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

  const calculateItemTotal = (item: CartItem) => {
    let price = item.product.base_price;
    item.selectedVariants.forEach(v => price += v.price);
    item.selectedAddons.forEach(a => price += a.price);
    return price * item.quantity;
  };

  const subtotal = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  
  // Tax logic (approximate display only, server is authoritative)
  const tax = cart.reduce((acc, item) => {
    const itemTotal = calculateItemTotal(item);
    const taxRate = item.product.tax_rate || 0;
    return acc + (itemTotal * (taxRate / 100));
  }, 0);
  
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      table_id: selectedTableId || undefined,
      pos_session_id: activeSession?.id || undefined,
      source: "waiter",
      order_type: selectedTableId ? "dine_in" : "takeaway",
      special_instructions: "",
      idempotency_key: crypto.randomUUID(),
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        special_instructions: item.specialInstructions,
        variants: item.selectedVariants.map(v => ({ value_id: v.value_id })),
        addons: item.selectedAddons.map(a => ({ addon_id: a.addon_id }))
      }))
    };

    try {
      const res = await submitPosOrderAction(payload);
      if (res.success) {
        setCart([]);
        router.push(`/orders/${res.order_id}`);
      } else {
        setErrorMsg(res.error || "Failed to create order");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {categories.filter(c => c.is_active).map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "p-4 text-center border-b border-border-warm transition-colors min-h-[80px] flex items-center justify-center font-medium text-sm flex-col",
              activeCategory === cat.id ? "bg-primary-green/10 text-primary-green border-l-4 border-l-primary-green" : "text-text-secondary hover:bg-bg-secondary"
            )}
          >
            <span>{cat.name}</span>
            {cat.product_count && cat.product_count > 0 ? (
              <span className="text-[10px] mt-1 opacity-70">{cat.product_count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* CENTER: Product Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg-base relative">
        <div className="p-4 bg-bg-surface border-b border-border-warm shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 bg-bg-secondary border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <select 
              className="bg-bg-secondary border-none text-sm rounded-md px-3 py-2 outline-none cursor-pointer text-text-primary font-medium"
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
            >
              <option value="">No Table (Takeaway)</option>
              {floors.map(floor => (
                <optgroup key={floor.id} label={floor.name}>
                  {floor.tables.filter(t => t.is_active).map(table => (
                    <option key={table.id} value={table.id}>Table {table.table_number}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-coral/10 text-coral border-b border-coral/20 text-sm font-medium">
            {errorMsg}
          </div>
        )}
        
        {!activeSession && (
          <div className="p-4 bg-amber/10 text-amber border-b border-amber/20 text-sm font-medium flex items-center justify-between">
            <span>No active POS Session. You cannot process orders.</span>
            <Button size="sm" variant="ghost" className="border-amber text-amber hover:bg-amber hover:text-white" onClick={() => router.push('/settings')}>Open Session</Button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-bg-surface rounded-xl overflow-hidden border border-border-warm shadow-sm hover:shadow-md hover:border-primary-green/50 transition-all text-left flex flex-col group active:scale-95"
              >
                <div className="h-32 bg-bg-secondary w-full relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary opacity-30">No Image</div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm leading-tight group-hover:text-primary-green transition-colors line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="font-bold text-text-primary mt-2 flex justify-between items-center">
                    ${product.base_price.toFixed(2)}
                    {((product.variants && product.variants.length > 0) || (product.addons && product.addons.length > 0)) && (
                      <span className="text-[10px] bg-bg-secondary text-text-secondary px-1.5 py-0.5 rounded uppercase">Opts</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-20 text-text-secondary">
                No products found in this category.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart Panel */}
      <div className="w-80 lg:w-96 bg-bg-surface border-l border-border-warm flex flex-col shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-border-warm bg-bg-secondary/50 flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-text-primary">Current Order</h2>
            {activeTableObj && (
              <div className="text-xs font-semibold bg-ready-blue/10 text-ready-blue px-2 py-1 rounded">T-{activeTableObj.table_number}</div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-text-secondary">
            <span>{activeTableObj ? 'Dine In' : 'Takeaway'}</span>
            <span>By: {profileName}</span>
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
              <p className="text-xs">Select items from the menu</p>
            </div>
          ) : (
            cart.map(item => {
              const itemTotal = calculateItemTotal(item);
              return (
                <div key={item.cartItemId} className="flex gap-3 pb-4 border-b border-border-warm last:border-0 last:pb-0">
                  <div className="flex flex-col items-center justify-between bg-bg-secondary rounded-lg p-1 w-10 shrink-0 h-[88px]">
                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 hover:bg-bg-surface rounded text-text-primary"><Plus className="h-4 w-4" /></button>
                    <span className="font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 hover:bg-bg-surface rounded text-text-primary"><Minus className="h-4 w-4" /></button>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-text-primary text-sm leading-tight">{item.product.name}</h4>
                      <span className="font-bold text-sm ml-2">${itemTotal.toFixed(2)}</span>
                    </div>
                    {item.selectedVariants.length > 0 && (
                      <div className="text-xs text-text-secondary mt-1">
                        {item.selectedVariants.map(v => v.name).join(", ")}
                      </div>
                    )}
                    {item.selectedAddons.length > 0 && (
                      <div className="text-xs text-text-secondary mt-0.5">
                        + {item.selectedAddons.map(a => a.name).join(", ")}
                      </div>
                    )}
                    <div className="mt-auto flex justify-between items-end pt-2">
                      <div className="text-xs text-text-secondary">
                        ${(itemTotal / item.quantity).toFixed(2)} each
                      </div>
                      <button onClick={() => removeFromCart(item.cartItemId)} className="text-coral hover:bg-coral/10 p-1.5 rounded transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
              <span>Tax (Est.)</span>
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
          <Button 
            className="w-full h-14 text-base font-bold bg-primary-green hover:bg-primary-hover shadow-md flex items-center justify-center"
            disabled={cart.length === 0 || !activeSession || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <span className="flex items-center">Processing...</span>
            ) : (
              <span className="flex items-center">Send Order <ArrowRight className="ml-2 h-5 w-5" /></span>
            )}
          </Button>
        </div>
      </div>

      {/* Product Selection Modal (Variants/Addons) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-md bg-bg-base h-full flex flex-col shadow-2xl animate-in slide-in-from-right-full">
            <div className="p-4 bg-bg-surface border-b border-border-warm flex items-center shadow-sm z-10 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h3 className="font-bold text-text-primary text-lg">{selectedProduct.name}</h3>
                <p className="text-text-secondary text-sm font-medium">${selectedProduct.base_price.toFixed(2)} Base</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-bg-base">
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="space-y-6">
                  {selectedProduct.variants.map(variant => (
                    <div key={variant.id} className="space-y-3">
                      <h4 className="font-semibold text-text-primary flex justify-between items-center border-b border-border-warm pb-2">
                        <span>{variant.name}</span>
                        <span className="text-xs bg-bg-secondary px-2 py-1 rounded">Required</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {variant.values.map(val => (
                          <label key={val.id} className={cn(
                            "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                            tempVariants[variant.id]?.value_id === val.id 
                              ? "border-primary-green bg-primary-green/5" 
                              : "border-border-warm bg-bg-surface hover:bg-bg-secondary"
                          )}>
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name={`variant_${variant.id}`} 
                                className="accent-primary-green"
                                checked={tempVariants[variant.id]?.value_id === val.id}
                                onChange={() => setTempVariants(prev => ({
                                  ...prev, 
                                  [variant.id]: { value_id: val.id, name: val.name, price: val.price_delta }
                                }))}
                              />
                              <span className="font-medium text-text-primary text-sm">{val.name}</span>
                            </div>
                            {val.price_delta > 0 && (
                              <span className="text-sm font-medium text-text-secondary">+${val.price_delta.toFixed(2)}</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-text-primary flex justify-between items-center border-b border-border-warm pb-2">
                    <span>Add-ons</span>
                    <span className="text-xs text-text-secondary">Optional</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedProduct.addons.map(addon => (
                      <label key={addon.id} className={cn(
                        "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                        tempAddons[addon.id] 
                          ? "border-primary-green bg-primary-green/5" 
                          : "border-border-warm bg-bg-surface hover:bg-bg-secondary"
                      )}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="accent-primary-green rounded w-4 h-4"
                            checked={!!tempAddons[addon.id]}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTempAddons(prev => ({...prev, [addon.id]: { addon_id: addon.id, name: addon.name, price: addon.price }}));
                              } else {
                                setTempAddons(prev => {
                                  const next = {...prev};
                                  delete next[addon.id];
                                  return next;
                                });
                              }
                            }}
                          />
                          <span className="font-medium text-text-primary text-sm">{addon.name}</span>
                        </div>
                        <span className="text-sm font-medium text-text-secondary">+${addon.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-bg-surface border-t border-border-warm shadow-md shrink-0">
              <Button 
                className="w-full h-14 text-base font-bold bg-primary-green hover:bg-primary-hover"
                onClick={confirmProductSelection}
                disabled={selectedProduct.variants?.some(v => !tempVariants[v.id])} // Must select all variants
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
