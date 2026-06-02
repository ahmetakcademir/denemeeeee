import { create } from "zustand";

export interface CartItem {
  id: string;
  nameKey: string; // Message key for internationalization
  price: number;
  quantity: number;
  type: "perfume" | "polo" | "pack";
}

export type Region = "tr" | "en" | "de" | "fr";

export interface DBProductDetails {
  id: string;
  nameKey: string;
  descKey: string;
  basePrice: Record<Region, number>;
  specs?: Record<Region, string[]>;
}

export interface CustomProduct {
  id: string;
  name: Record<Region, string> | string;
  description: Record<Region, string> | string;
  image: string;
  basePrice: Record<Region, number>;
  category: "parfum" | "giyim" | "aksesuar" | "diger";
  specs: string[];
  createdAt: string;
}

export interface DBProductDataset {
  perfume: DBProductDetails;
  polo: DBProductDetails;
  pack: {
    id: string;
    nameKey: string;
    descKey: string;
    basePrice: Record<Region, number>;
  };
  customProducts?: CustomProduct[];
  whatsappNumber?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
}

interface State {
  currentRegion: Region;
  hoveredProduct: "perfume" | "polo" | "custom" | null;
  isAudioEnabled: boolean;
  cartItems: CartItem[];
  dbProducts: DBProductDataset | null;
  isQuizActive: boolean;
  toasts: ToastMessage[];
  setRegion: (region: Region) => void;
  setHoveredProduct: (product: "perfume" | "polo" | "custom" | null) => void;
  toggleAudio: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  setDbProducts: (products: DBProductDataset) => void;
  setIsQuizActive: (active: boolean) => void;
  addToast: (message: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
}

export const useStore = create<State>((set) => ({
  currentRegion: "tr",
  hoveredProduct: null,
  isAudioEnabled: false,
  cartItems: [],
  dbProducts: null,
  isQuizActive: false,
  toasts: [],

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

  setDbProducts: (products) =>
    set((state) => ({
      dbProducts: products,
      whatsappNumber: products.whatsappNumber || state.whatsappNumber,
    })),

  setIsQuizActive: (active) => set({ isQuizActive: active }),

  addToast: (message, type = "success") =>
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9);
      // Automatically clear after 3 seconds
      setTimeout(() => {
        useStore.getState().removeToast(id);
      }, 3000);
      return { toasts: [...state.toasts, { id, message, type }] };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  updateCartQuantity: (id, quantity) =>
    set((state) => ({
      cartItems: state.cartItems
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0),
    })),

  whatsappNumber: "905336113880",
  setWhatsappNumber: (num) => set({ whatsappNumber: num }),
}));

