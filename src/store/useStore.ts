import { create } from "zustand";

export interface CartItem {
  id: string;
  nameKey: string; // Message key for internationalization
  price: number;
  quantity: number;
  type: "perfume" | "polo" | "pack";
}

export type Region = "tr" | "en" | "de" | "fr";

interface State {
  currentRegion: Region;
  hoveredProduct: "perfume" | "polo" | null;
  isAudioEnabled: boolean;
  cartItems: CartItem[];
  setRegion: (region: Region) => void;
  setHoveredProduct: (product: "perfume" | "polo" | null) => void;
  toggleAudio: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useStore = create<State>((set) => ({
  currentRegion: "tr",
  hoveredProduct: null,
  isAudioEnabled: false,
  cartItems: [],

  setRegion: (region) => set({ currentRegion: region }),

  setHoveredProduct: (product) => set({ hoveredProduct: product }),

  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

  addToCart: (item) =>
    set((state) => {
      const existing = state.cartItems.find((i) => i.id === item.id);
      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cartItems: [...state.cartItems, { ...item, quantity: 1 }] };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ cartItems: [] }),
}));
