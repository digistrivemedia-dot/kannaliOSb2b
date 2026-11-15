import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { onSignOut } from "@/features/auth/store";

/** The cart keeps only what was chosen; prices and stock are always read fresh from the catalogue. */
type CartItem = { productId: string; quantity: number };

type Cart = {
  items: CartItem[];
  /** The branch the order is delivered to; null until chosen (the user's own branch is used). */
  branchId: string | null;
  add: (items: CartItem[]) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  setBranch: (branchId: string) => void;
  clear: () => void;
};

/** The cart, kept on the phone (CLAUDE.md §4). Adding a part already there adds to its quantity. */
export const useCart = create<Cart>()(
  persist(
    (set) => ({
      items: [],
      branchId: null,
      add: (added) =>
        set((state) => {
          const items = [...state.items];
          for (const item of added) {
            const index = items.findIndex((existing) => existing.productId === item.productId);
            if (index >= 0) {
              const existing = items[index];
              if (existing)
                items[index] = { ...existing, quantity: existing.quantity + item.quantity };
            } else items.push(item);
          }
          return { items };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      setBranch: (branchId) => set({ branchId }),
      clear: () => set({ items: [] }),
    }),
    { name: "cart", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

onSignOut(() => useCart.setState({ items: [], branchId: null }));

/** How many units are in the cart, for the cart icon. */
export function useCartCount(): number {
  return useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));
}
