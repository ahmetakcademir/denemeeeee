import { Region } from "@/store/useStore";

export interface ProductDetails {
  id: string;
  nameKey: string;
  descKey: string;
  basePrice: {
    tr: number; // ₺ TRY
    en: number; // $ USD
    de: number; // € EUR
    fr: number; // € EUR
  };
}

export const PRODUCTS: Record<string, ProductDetails> = {
  perfume: {
    id: "nard-perfume-01",
    nameKey: "Products.perfumeTitle",
    descKey: "Products.perfumeDesc",
    basePrice: {
      tr: 1250,
      en: 85,
      de: 79,
      fr: 79,
    },
  },
  polo: {
    id: "nard-polo-01",
    nameKey: "Products.poloTitle",
    descKey: "Products.poloDesc",
    basePrice: {
      tr: 1450,
      en: 95,
      de: 89,
      fr: 89,
    },
  },
};

// Sovereign Pack Set (Perfume + Polo Combo discount)
export const SOVEREIGN_PACK = {
  id: "nard-sovereign-pack",
  nameKey: "Quiz.matchPack",
  descKey: "Quiz.packDesc",
  basePrice: {
    tr: 2400, // 2700 normal => 300 TL discount
    en: 160,  // 180 normal => 20 USD discount
    de: 148,  // 168 normal => 20 EUR discount
    fr: 148,
  },
};

/**
 * Format price dynamically using native Intl.NumberFormat based on region
 */
export function formatRegionalPrice(amount: number, region: Region): string {
  const currencyMap: Record<Region, { code: string; locale: string }> = {
    tr: { code: "TRY", locale: "tr-TR" },
    en: { code: "USD", locale: "en-US" },
    de: { code: "EUR", locale: "de-DE" },
    fr: { code: "EUR", locale: "fr-FR" },
  };

  const { code, locale } = currencyMap[region] || currencyMap.tr;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
