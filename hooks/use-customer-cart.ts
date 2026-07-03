import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartVariant {
  id: string; // product_variant_values.id
  name: string;
  priceDelta: number;
  variantGroupId: string; // product_variants.id
  variantGroupName: string;
}

export interface CartAddon {
  id: string; // product_addons.id
  name: string;
  price: number;
}

export interface CustomerCartItem {
  cartItemId: string; // random unique id for the cart
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  variants: CartVariant[];
  addons: CartAddon[];
  specialInstructions?: string;
  totalPrice: number;
}

interface CustomerCartState {
  items: CustomerCartItem[];
  addItem: (item: Omit<CustomerCartItem, 'cartItemId' | 'totalPrice'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCustomerCart = create<CustomerCartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        let unitPrice = item.basePrice;
        item.variants.forEach(v => { unitPrice += v.priceDelta; });
        item.addons.forEach(a => { unitPrice += a.price; });
        
        const cartItemId = crypto.randomUUID();
        const totalPrice = unitPrice * item.quantity;
        
        set((state) => ({
          items: [...state.items, { ...item, cartItemId, totalPrice }]
        }));
      },
      
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId)
        }));
      },
      
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) return get().removeItem(cartItemId);
        
        set((state) => ({
          items: state.items.map((i) => {
            if (i.cartItemId === cartItemId) {
              let unitPrice = i.basePrice;
              i.variants.forEach(v => { unitPrice += v.priceDelta; });
              i.addons.forEach(a => { unitPrice += a.price; });
              return { ...i, quantity, totalPrice: unitPrice * quantity };
            }
            return i;
          })
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      }
    }),
    {
      name: 'cafe-hub-customer-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
