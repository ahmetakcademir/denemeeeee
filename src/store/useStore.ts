import { create } from "zustand";
import catalog from "@/data/products.json";

export type Region = "tr" | "en" | "de" | "fr";

export interface DBProductDetails {
  id: string;
  nameKey: string;
  descKey: string;
  specs?: Record<Region, string[]>;
}

export interface CustomProduct {
  id: string;
  name: Record<Region, string> | string;
  description: Record<Region, string> | string;
  image: string;
  category: "parfum" | "giyim" | "aksesuar" | "diger";
  specs: string[];
  createdAt: string;
}

export interface DBProductDataset {
  perfume: DBProductDetails;
  polo: DBProductDetails;
  pack: { id: string; nameKey: string; descKey: string };
  customProducts?: CustomProduct[];
}

interface State {
  hoveredProduct: "perfume" | "polo" | "custom" | null;
  isAudioEnabled: boolean;
  dbProducts: DBProductDataset;
  isQuizActive: boolean;
  setHoveredProduct: (product: "perfume" | "polo" | "custom" | null) => void;
  toggleAudio: () => void;
  setIsQuizActive: (active: boolean) => void;
}

export const useStore = create<State>((set) => ({
  hoveredProduct: null,
  isAudioEnabled: false,
  dbProducts: catalog as DBProductDataset,
  isQuizActive: false,
  setHoveredProduct: (product) => set({ hoveredProduct: product }),
  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
  setIsQuizActive: (active) => set({ isQuizActive: active }),
}));
