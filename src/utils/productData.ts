export interface ProductDetails {
  id: string;
  nameKey: string;
  descKey: string;
}

export const PRODUCTS: Record<string, ProductDetails> = {
  perfume: {
    id: "nard-perfume-01",
    nameKey: "Products.perfumeTitle",
    descKey: "Products.perfumeDesc",
  },
  polo: {
    id: "nard-polo-01",
    nameKey: "Products.poloTitle",
    descKey: "Products.poloDesc",
  },
};

export const SOVEREIGN_PACK: ProductDetails = {
  id: "nard-sovereign-pack",
  nameKey: "Quiz.matchPack",
  descKey: "Quiz.packDesc",
};
