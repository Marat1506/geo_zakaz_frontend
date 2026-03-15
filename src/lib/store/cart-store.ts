import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart } from '@/types/cart';
import { MenuItem } from '@/types/menu';

interface CartState extends Cart {
  addItem: (
    item: MenuItem,
    quantity?: number,
    specialInstructions?: string,
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

const TAX_RATE = 0.08;
const DELIVERY_FEE = 5.99;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      deliveryFee: DELIVERY_FEE,
      total: 0,

      addItem: (menuItem, quantity = 1, specialInstructions) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.menuItem.id === menuItem.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.menuItem.id === menuItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { menuItem, quantity, specialInstructions },
            ],
          };
        });
        get().calculateTotals();
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== itemId),
        }));
        get().calculateTotals();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === itemId ? { ...item, quantity } : item,
          ),
        }));
        get().calculateTotals();
      },

      updateInstructions: (itemId, instructions) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === itemId
              ? { ...item, specialInstructions: instructions }
              : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], subtotal: 0, tax: 0, total: 0 });
      },

      calculateTotals: () => {
        set((state) => {
          const subtotal = state.items.reduce(
            (sum, item) => sum + item.menuItem.price * item.quantity,
            0,
          );
          const tax = subtotal * TAX_RATE;
          const total = subtotal + tax + DELIVERY_FEE;

          return { subtotal, tax, total };
        });
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    },
  ),
);
