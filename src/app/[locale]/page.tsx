"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useStore } from "@/store/useStore";
import { PRODUCTS, SOVEREIGN_PACK, formatRegionalPrice } from "@/utils/productData";
import { motion, AnimatePresence } from "framer-motion";
import FluidSimulation from "@/components/canvas/FluidSimulation";
import InteractiveHeader from "@/components/layout/InteractiveHeader";
import ParallaxCard3D from "@/components/ui/3DParallaxCard";

export default function Home() {
  const t = useTranslations("Hero");
  const tp = useTranslations("Products");
  const tq = useTranslations("Quiz");

  const currentRegion = useStore((s) => s.currentRegion);
  const addToCart = useStore((s) => s.addToCart);
  
  // Dynamic JSON Hydration States
  const dbProducts = useStore((s) => s.dbProducts);
  const setDbProducts = useStore((s) => s.setDbProducts);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setDbProducts(data);
        }
      })
      .catch((err) => console.error("NARD Storefront: Dynamic hydration failed:", err));
  }, [setDbProducts]);

  // Bind dynamic prices
  const perfumePrice = dbProducts ? dbProducts.perfume.basePrice[currentRegion] : PRODUCTS.perfume.basePrice[currentRegion];
  const poloPrice = dbProducts ? dbProducts.polo.basePrice[currentRegion] : PRODUCTS.polo.basePrice[currentRegion];
  const packPrice = dbProducts ? dbProducts.pack.basePrice[currentRegion] : SOVEREIGN_PACK.basePrice[currentRegion];

  // Quiz states
  const isQuizActive = useStore((s) => s.isQuizActive);
  const setIsQuizActive = useStore((s) => s.setIsQuizActive);
  const addToast = useStore((s) => s.addToast);

  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    breakdown: string;
    recipeExplanation: string;
    matchedProductId: string;
  } | null>(null);

  const fetchAiSynthesis = async (answers: number[]) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, locale: currentRegion }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult({
          breakdown: data.breakdown,
          recipeExplanation: data.recipeExplanation,
          matchedProductId: data.matchedProductId
        });
      }
    } catch (err) {
      console.error("NARD Storefront: AI Scent synthesis failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const updatedAnswers = [...quizAnswers, answerIndex];
    setQuizAnswers(updatedAnswers);

    if (quizStep < 3) {
      setQuizStep(quizStep + 1);
    } else {
      setIsQuizComplete(true);
      fetchAiSynthesis(updatedAnswers);
    }
  };

  const resetQuiz = () => {
    setQuizStep(1);
    setQuizAnswers([]);
    setIsQuizComplete(false);
    setAiResult(null);
    setIsQuizActive(false);
  };

  const getMatchedProductDetails = (id: string) => {
    if (id === PRODUCTS.perfume.id) {
      return {
        id: PRODUCTS.perfume.id,
        name: currentRegion === "tr" ? "NARD Spikenard Parfüm" : "NARD Spikenard Perfume",
        desc: currentRegion === "tr" ? "Himalayalar'ın zirvesinden gelen asil koku." : "Noble fragrance from the Himalayan heights.",
        price: perfumePrice,
        image: "/perfume.png",
        type: "perfume" as const
      };
    }
    if (id === PRODUCTS.polo.id) {
      return {
        id: PRODUCTS.polo.id,
        name: currentRegion === "tr" ? "NARD Sage Green Polo Tişört" : "NARD Sage Green Polo Shirt",
        desc: currentRegion === "tr" ? "280 GSM organik keten pamuk örgü tişört." : "280 GSM organic linen cotton knit polo.",
        price: poloPrice,
        image: "/polo.png",
        type: "polo" as const
      };
    }
    
    // Check custom products
    if (dbProducts?.customProducts) {
      const custom = dbProducts.customProducts.find((p) => p.id === id);
      if (custom) {
        const localizedName = typeof custom.name === "string" ? custom.name : (custom.name[currentRegion] || custom.name.tr || "");
        const localizedDesc = typeof custom.description === "string" ? custom.description : (custom.description[currentRegion] || custom.description.tr || "");
        return {
          id: custom.id,
          name: localizedName,
          desc: localizedDesc,
          price: custom.basePrice[currentRegion] || custom.basePrice.tr,
          image: custom.image,
          type: "custom" as const
        };
      }
    }

    // Default to Sovereign Pack Set
    return {
      id: SOVEREIGN_PACK.id,
      name: currentRegion === "tr" ? "NARD Sovereign Set" : "NARD Sovereign Pack Set",
      desc: currentRegion === "tr" ? "Parfüm ve polo tişört asil kombinasyonu." : "The luxury fragrance and clothing combination.",
      price: packPrice,
      image: "/sovereign-pack.png",
      type: "pack" as const
    };
  };

  const handleAddMatchedToCart = (matched: ReturnType<typeof getMatchedProductDetails>) => {
    addToCart({
      id: matched.id,
      nameKey: matched.name,
      price: matched.price,
      type: matched.type === "custom" ? "custom" as any : matched.type,
    });
    resetQuiz();
    addToast(
      currentRegion === "tr"
        ? `${matched.name} sepete eklendi!`
        : `${matched.name} added to cart!`,
      "success"
    );
  };

  // Helper to split translation specs by colon dynamically (enabling gorgeous dual-side lookbook rows)
  const renderSpecRow = (text: string) => {
    const colonIndex = text.indexOf(":");
    if (colonIndex === -1) return { label: "", value: text };
    return {
      label: text.substring(0, colonIndex).trim(),
      value: text.substring(colonIndex + 1).trim()
    };
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden pt-24 pb-12 select-none">
      {/* WebGL GPU Liquid Fluid Simulation Background */}
      <FluidSimulation />

      {/* Elegant Radial Vignette Overlay for supreme high-contrast typography readability */}
      <div className="fixed inset-0 -z-40 bg-radial-vignette pointer-events-none" />

      {/* Nav bar */}
      <InteractiveHeader />

      {/* Hero Section — Lookbook Minimalist Vibe */}
      <section className="min-h-[85vh] w-full flex flex-col justify-center items-center text-center px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl flex flex-col items-center gap-6"
        >
          <h1 className="text-6xl md:text-9xl font-light tracking-[0.25em] md:tracking-[0.35em] text-[#ECE8E1] select-none hover:text-[#C29F68] transition-colors duration-700 uppercase">
            {t("title")}
          </h1>
          <p className="text-xs md:text-sm tracking-[0.18em] font-sans font-light text-[#ECE8E1]/70 max-w-2xl leading-relaxed mt-2">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mt-10">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="#collection"
              className="px-10 py-4.5 bg-[#ECE8E1] border border-[#ECE8E1] hover:bg-transparent hover:text-[#ECE8E1] hover:border-[#C29F68]/40 text-[#0b0b0b] text-[10px] font-sans font-semibold tracking-[0.2em] transition-luxury glow-amber rounded-none uppercase"
            >
              {t("ctaShop")}
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsQuizActive(true)}
              className="px-10 py-4.5 bg-transparent border border-white/15 hover:border-[#C29F68] hover:bg-[#C29F68]/5 text-[#ECE8E1] hover:text-[#C29F68] text-[10px] font-sans font-semibold tracking-[0.2em] transition-luxury rounded-none uppercase"
            >
              {t("ctaQuiz")}
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="w-full max-w-7xl px-6 py-24 flex flex-col gap-12 relative z-10 scroll-mt-20">
        <div className="text-left border-b border-white/5 pb-4 mb-8">
          <span className="text-[10px] font-mono text-[#C29F68] tracking-[0.3em] uppercase">
            NARD // THE DUAL ESSENCE
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-[#ECE8E1] mt-2">
            {tp("collections" as any)}
          </h2>
        </div>

        {/* Dual column Products grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch min-h-[700px]">
          
          {/* Left Column: Spikenard Perfume */}
          <div className="flex flex-col h-full">
            <ParallaxCard3D productType="perfume" className="flex-1 min-h-[550px]">
              <div className="h-full flex flex-col text-left justify-between p-2">
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[9px] font-mono text-[#C29F68] tracking-widest">
                      BASE_FORMULA // 01
                    </span>
                    <span className="text-[8px] font-mono text-[#ECE8E1]/30">
                      SPIKENARD_EXTRACT
                    </span>
                  </div>
                  
                  {/* Premium Product Image Frame */}
                  <div className="relative w-full h-80 my-6 p-1.5 bg-white/[0.01] border border-white/5 transition-luxury hover:border-[#C29F68]/20 group">
                    <div className="relative w-full h-full overflow-hidden border border-white/10">
                      <img 
                        src="/perfume.png" 
                        alt="NARD Spikenard Perfume" 
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 filter brightness-[0.88] contrast-105 saturate-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-light text-[#ECE8E1] tracking-wide">
                    {tp("perfumeTitle" as any)}
                  </h3>
                  <p className="text-xs text-[#ECE8E1]/65 leading-relaxed font-light mt-4 font-sans">
                    {tp("perfumeDesc" as any)}
                  </p>
                </div>

                {/* Scent Molecular Notes Symmetrical Rows */}
                <div className="my-6 flex flex-col gap-3">
                  <span className="text-[#ECE8E1]/45 uppercase tracking-[0.2em] text-[9px] font-semibold block">
                    {tp("notesTitle" as any)}
                  </span>
                  <div className="flex flex-col gap-2">
                    {(dbProducts?.perfume.specs?.[currentRegion] || [tp("notesTop" as any), tp("notesHeart" as any), tp("notesBase" as any)]).map((noteText, idx) => {
                      const { label, value } = renderSpecRow(noteText);
                      return (
                        <div 
                          key={idx} 
                          className="px-4 py-3 bg-white/[0.02] border border-white/5 hover:border-[#C29F68]/30 hover:bg-[#C29F68]/5 transition-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#C29F68]/60 group-hover:bg-[#C29F68] transition-colors" />
                            <span className="text-[9px] font-mono text-[#C29F68] tracking-widest uppercase font-semibold">
                              {label}
                            </span>
                          </div>
                          <span className="text-xs font-sans font-light text-[#ECE8E1]/85 sm:text-right">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-[#ECE8E1]/30 tracking-wider">PRICE // REGIONAL_VAL</span>
                    <span className="text-3xl font-serif font-light text-[#ECE8E1] tracking-wide mt-0.5">
                      {formatRegionalPrice(perfumePrice, currentRegion)}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      addToCart({
                        id: PRODUCTS.perfume.id,
                        nameKey: PRODUCTS.perfume.nameKey,
                        price: perfumePrice,
                        type: "perfume",
                      });
                      addToast(
                        currentRegion === "tr"
                          ? "NARD Spikenard Parfüm sepete eklendi!"
                          : "NARD Spikenard Perfume added to cart!",
                        "success"
                      );
                    }}
                    className="px-8 py-4 bg-transparent border border-[#C29F68] hover:bg-[#C29F68] hover:text-[#0b0b0b] text-[#C29F68] text-[10px] font-mono font-semibold tracking-[0.2em] transition-luxury rounded-none uppercase cursor-pointer glow-amber-hover"
                  >
                    {tp("addToCart" as any)}
                  </motion.button>
                </div>
              </div>
            </ParallaxCard3D>
          </div>

          {/* Right Column: Organic Polo */}
          <div className="flex flex-col h-full">
            <ParallaxCard3D productType="polo" className="flex-1 min-h-[550px]">
              <div className="h-full flex flex-col text-left justify-between p-2">
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[9px] font-mono text-[#5E6D62] tracking-widest">
                      KNIT_STRUCTURE // 280GSM
                    </span>
                    <span className="text-[8px] font-mono text-[#ECE8E1]/30">
                      SAGE_GREEN_EDITION
                    </span>
                  </div>

                  {/* Premium Product Image Frame */}
                  <div className="relative w-full h-80 my-6 p-1.5 bg-white/[0.01] border border-white/5 transition-luxury hover:border-[#5E6D62]/20 group">
                    <div className="relative w-full h-full overflow-hidden border border-white/10">
                      <img 
                        src="/polo.png" 
                        alt="NARD Heavyweight Polo" 
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 filter brightness-[0.88] contrast-105 saturate-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-light text-[#ECE8E1] tracking-wide">
                    {tp("poloTitle" as any)}
                  </h3>
                  <p className="text-xs text-[#ECE8E1]/65 leading-relaxed font-light mt-4 font-sans">
                    {tp("poloDesc" as any)}
                  </p>
                </div>

                {/* Fabric Specifications Symmetrical Rows */}
                <div className="my-6 flex flex-col gap-3">
                  <span className="text-[#ECE8E1]/45 uppercase tracking-[0.2em] text-[9px] font-semibold block">
                    {tp("featuresTitle" as any)}
                  </span>
                  <div className="flex flex-col gap-2">
                    {(dbProducts?.polo.specs?.[currentRegion] || [tp("featuresGsm" as any), tp("featuresKnit" as any), tp("featuresColor" as any)]).map((featText, idx) => {
                      const { label, value } = renderSpecRow(featText);
                      return (
                        <div 
                          key={idx} 
                          className="px-4 py-3 bg-white/[0.02] border border-white/5 hover:border-[#5E6D62]/30 hover:bg-[#5E6D62]/5 transition-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#5E6D62]/60 group-hover:bg-[#5E6D62] transition-colors" />
                            <span className="text-[9px] font-mono text-[#5E6D62] tracking-widest uppercase font-semibold">
                              {label}
                            </span>
                          </div>
                          <span className="text-xs font-sans font-light text-[#ECE8E1]/85 sm:text-right">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-[#ECE8E1]/30 tracking-wider">PRICE // REGIONAL_VAL</span>
                    <span className="text-3xl font-serif font-light text-[#ECE8E1] tracking-wide mt-0.5">
                      {formatRegionalPrice(poloPrice, currentRegion)}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      addToCart({
                        id: PRODUCTS.polo.id,
                        nameKey: PRODUCTS.polo.nameKey,
                        price: poloPrice,
                        type: "polo",
                      });
                      addToast(
                        currentRegion === "tr"
                          ? "NARD Heavyweight Polo sepete eklendi!"
                          : "NARD Heavyweight Polo added to cart!",
                        "success"
                      );
                    }}
                    className="px-8 py-4 bg-transparent border border-[#5E6D62] hover:bg-[#5E6D62] hover:text-[#ece8e1] text-[#5E6D62] text-[10px] font-mono font-semibold tracking-[0.2em] transition-luxury rounded-none uppercase cursor-pointer glow-sage-hover"
                  >
                    {tp("addToCart" as any)}
                  </motion.button>
                </div>
              </div>
            </ParallaxCard3D>
          </div>
        </div>

        {/* ── Özel Ürünler (Admin'den eklenenler) ── */}
        {dbProducts?.customProducts && dbProducts.customProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/5 w-full">
            <div className="text-left pb-4 mb-12">
              <span className="text-[10px] font-mono text-[#C29F68] tracking-[0.3em] uppercase">
                NARD // ÖZEL KOLEKSİYON
              </span>
              <h2 className="text-4xl md:text-5xl font-light text-[#ECE8E1] mt-2">
                Diğer Ürünler
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 items-stretch">
              {dbProducts.customProducts.map((product, idx) => {
                const priceValue = product.basePrice[currentRegion] ?? product.basePrice.tr;
                const catColors: Record<string, string> = {
                  parfum: "#C29F68",
                  giyim: "#5E6D62",
                  aksesuar: "#8B7EA4",
                  diger: "#6B8CAE",
                };
                const accent = catColors[product.category] || "#C29F68";
                
                // Multilingual name and description extraction
                const localizedName = typeof product.name === "string" 
                  ? product.name 
                  : (product.name[currentRegion] || product.name.tr || "");
                const localizedDesc = typeof product.description === "string" 
                  ? product.description 
                  : (product.description[currentRegion] || product.description.tr || "");

                return (
                  <div key={product.id} className="min-h-[520px] flex flex-col">
                    <ParallaxCard3D productType="custom" glowColor={accent} className="flex-1">
                      <div className="h-full flex flex-col justify-between text-left relative z-20">
                        {/* Header details inside card */}
                        <div>
                          <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-5">
                            <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: accent }}>
                              {({ parfum: "🌿 Parfüm", giyim: "👕 Giyim", aksesuar: "💎 Aksesuar", diger: "📦 Ürün" } as any)[product.category] || product.category}
                            </span>
                            <span className="text-[7px] font-mono text-[#ECE8E1]/20 uppercase">
                              NARD_BESPOKE // {product.id.substring(0, 8)}
                            </span>
                          </div>

                          {/* Image inside card */}
                          <div className="relative w-full h-56 overflow-hidden bg-white/[0.01] border border-white/5 p-1 group">
                            <div className="relative w-full h-full overflow-hidden border border-white/10">
                              <img
                                src={product.image}
                                alt={localizedName}
                                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 filter brightness-[0.88] contrast-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='central' fill='%23333' font-size='48'%3E📦%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/60 via-transparent to-transparent pointer-events-none" />
                            </div>
                          </div>

                          {/* Text elements */}
                          <h3 className="text-2xl font-light text-[#ECE8E1] tracking-wide mt-6 leading-tight">
                            {localizedName}
                          </h3>
                          {localizedDesc && (
                            <p className="text-xs text-[#ECE8E1]/60 leading-relaxed font-light mt-3 font-sans max-w-sm">
                              {localizedDesc}
                            </p>
                          )}

                          {/* Specs rendering block */}
                          {product.specs && product.specs.length > 0 && (
                            <div className="flex flex-col gap-2 mt-5 mb-2">
                              {product.specs.filter(Boolean).map((spec, si) => {
                                const parts = spec.split(":");
                                const lbl = parts.length > 1 ? parts[0].trim() : null;
                                const val = parts.length > 1 ? parts.slice(1).join(":").trim() : spec;
                                return (
                                  <div key={si} className="flex items-center gap-2.5 text-[10px]">
                                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />
                                    {lbl ? (
                                      <>
                                        <span className="font-mono uppercase tracking-widest font-semibold" style={{ color: accent }}>{lbl}:</span>
                                        <span className="text-[#ECE8E1]/70 font-sans font-light">{val}</span>
                                      </>
                                    ) : (
                                      <span className="text-[#ECE8E1]/70 font-sans font-light">{val}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Price & Cart button */}
                        <div className="flex justify-between items-center mt-auto pt-5 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-mono text-[#ECE8E1]/30 tracking-wider mb-0.5">PRICE // VALUE</span>
                            <span className="text-2xl font-serif font-light text-[#ECE8E1]">
                              {formatRegionalPrice(priceValue, currentRegion)}
                            </span>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              addToCart({
                                id: product.id,
                                nameKey: localizedName,
                                price: priceValue,
                                type: "custom" as any,
                              });
                              addToast(
                                currentRegion === "tr"
                                  ? `${localizedName} sepete eklendi!`
                                  : `${localizedName} added to cart!`,
                                "success"
                              );
                            }}
                            className="px-6 py-3 bg-transparent text-[10px] font-mono font-semibold tracking-[0.2em] uppercase transition-luxury border cursor-pointer"
                            style={{ borderColor: accent, color: accent }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = accent; (e.currentTarget as HTMLButtonElement).style.color = "#0b0b0b"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = accent; }}
                          >
                            {currentRegion === "tr" ? "Sepete Ekle" : "Add to Cart"}
                          </motion.button>
                        </div>
                      </div>
                    </ParallaxCard3D>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Molecular Synthesizer Interactive Quiz Modal Overlay */}
      <AnimatePresence>
        {isQuizActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0b0b0b]/92 backdrop-blur-md flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 190 }}
              className="w-full max-w-lg glass-panel border border-white/10 p-8 glow-amber relative text-left"
            >
              {/* Close Button */}
              <button
                onClick={resetQuiz}
                className="absolute top-6 right-6 text-[10px] font-mono text-[#C29F68] hover:text-white transition-colors tracking-widest uppercase"
              >
                CLOSE // X
              </button>

              {!isQuizComplete ? (
                // Active Quiz steps
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[9px] font-mono text-[#C29F68] tracking-widest block">
                      SYNTHESIZER // PHASE 0{quizStep}_OF_03
                    </span>
                    <h3 className="text-2xl font-light text-[#ECE8E1] mt-2 tracking-wide font-serif">
                      {quizStep === 1 ? tq("q1") : quizStep === 2 ? tq("q2") : tq("q3")}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    {quizStep === 1 && (
                      <>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(1)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q1a1")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">01 // SELECT</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(2)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q1a2")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">02 // SELECT</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(3)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q1a3")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">03 // SELECT</span>
                        </motion.button>
                      </>
                    )}

                    {quizStep === 2 && (
                      <>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(1)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q2a1")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">01 // SELECT</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(2)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q2a2")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">02 // SELECT</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(3)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q2a3")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">03 // SELECT</span>
                        </motion.button>
                      </>
                    )}

                    {quizStep === 3 && (
                      <>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(1)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q3a1")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">01 // SELECT</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(2)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q3a2")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">02 // SELECT</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleQuizAnswer(3)}
                          className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#C29F68]/30 border border-white/5 text-xs text-left tracking-[0.08em] font-light transition-luxury flex justify-between items-center group"
                        >
                          <span className="text-[#ECE8E1]/85 group-hover:text-white transition-colors">{tq("q3a3")}</span>
                          <span className="text-[9px] font-mono text-[#C29F68] opacity-0 group-hover:opacity-100 transition-opacity">03 // SELECT</span>
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              ) : aiLoading ? (
                // Siberian-minimalist luxury loading sequence
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 border-2 border-[#C29F68]/20 border-t-[#C29F68] rounded-full animate-spin mb-6" />
                  <p className="text-[10px] font-mono text-[#C29F68] tracking-[0.25em] uppercase animate-pulse">
                    SYNTHESIZING // MOLECULAR_AURA
                  </p>
                  <p className="text-[9px] text-[#ECE8E1]/30 font-mono mt-3 leading-relaxed">
                    Analyzing frequency waves · Calculating scent matrices · Matching haute-couture catalog
                  </p>
                </div>
              ) : aiResult ? (
                // Dynamic AI Custom Alchemical recommendation
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[9px] font-mono text-green-400 tracking-widest animate-pulse">
                      SYNTHESIS // COMPLETED
                    </span>
                    <h3 className="text-3xl font-light text-[#ECE8E1] mt-2 font-serif tracking-wide">
                      {tq("resultTitle")}
                    </h3>
                  </div>

                  <p className="text-xs text-[#ECE8E1]/65 leading-relaxed font-light font-sans">
                    {tq("resultDesc")}{" "}
                    <span className="text-[#C29F68] font-semibold tracking-wider font-mono">
                      {aiResult.breakdown.toUpperCase()}
                    </span>
                  </p>

                  {(() => {
                    const matched = getMatchedProductDetails(aiResult.matchedProductId);
                    return (
                      <div className="glass-panel p-6 border border-white/5 rounded-none mt-2">
                        <span className="text-[9px] font-mono text-[#C29F68] tracking-widest block mb-1">
                          {matched.id.toUpperCase()} // MATCHER_RESULT
                        </span>
                        <h4 className="text-xl font-light text-[#ECE8E1] tracking-wide font-serif">
                          {matched.name}
                        </h4>
                        
                        {/* Matched Product Luxury Image Frame */}
                        <div className="relative w-full h-52 my-4 p-1.5 bg-white/[0.01] border border-white/5 transition-luxury group">
                          <div className="relative w-full h-full overflow-hidden border border-white/10">
                            <img 
                              src={matched.image} 
                              alt={matched.name} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-[0.88] contrast-105 saturate-95"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/60 via-transparent to-transparent pointer-events-none" />
                          </div>
                        </div>

                        <p className="text-[11px] text-[#ECE8E1]/85 leading-relaxed font-light font-sans italic mb-4">
                          "{aiResult.recipeExplanation}"
                        </p>

                        <p className="text-[10px] text-[#ECE8E1]/55 leading-relaxed font-light font-mono">
                          {matched.desc}
                        </p>
                        
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-mono text-[#ECE8E1]/30 tracking-wider">SET_PRICE // SPECIAL_MATCH</span>
                            <span className="text-2xl font-serif font-light text-[#ECE8E1] tracking-wide mt-0.5">
                              {formatRegionalPrice(matched.price, currentRegion)}
                            </span>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddMatchedToCart(matched)}
                            className="px-8 py-4 bg-[#C29F68] hover:bg-transparent border border-[#C29F68] hover:text-[#C29F68] text-[#0b0b0b] text-[10px] font-mono font-semibold tracking-[0.2em] transition-luxury rounded-none uppercase cursor-pointer glow-amber-hover"
                          >
                            {currentRegion === "tr" ? "Sepete Ekle" : "Add to Cart"}
                          </motion.button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // Fallback standard complete display if error or missing result
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[9px] font-mono text-green-400 tracking-widest animate-pulse">
                      SYNTHESIS // COMPLETED
                    </span>
                    <h3 className="text-3xl font-light text-[#ECE8E1] mt-2 font-serif tracking-wide">
                      {tq("resultTitle")}
                    </h3>
                  </div>

                  <p className="text-xs text-[#ECE8E1]/65 leading-relaxed font-light font-sans">
                    {tq("resultDesc")}{" "}
                    <span className="text-[#C29F68] font-semibold tracking-wider font-mono">
                      {quizAnswers[0] === 1
                        ? "EARTHY ORGANIC SUITE"
                        : quizAnswers[0] === 2
                        ? "NOCTURNAL SAPPHIRE VEIL"
                        : "SOVEREIGN GOLD AURA"}
                    </span>
                  </p>

                  <div className="glass-panel p-6 border border-white/5 rounded-none mt-2">
                    <span className="text-[9px] font-mono text-[#C29F68] tracking-widest block mb-1">
                      {SOVEREIGN_PACK.id.toUpperCase()} // MATCHER_RESULT
                    </span>
                    <h4 className="text-xl font-light text-[#ECE8E1] tracking-wide font-serif">
                      {tq("matchPack")}
                    </h4>
                    
                    {/* Sovereign Pack Luxury Image Frame */}
                    <div className="relative w-full h-52 my-4 p-1.5 bg-white/[0.01] border border-white/5 transition-luxury group">
                      <div className="relative w-full h-full overflow-hidden border border-white/10">
                        <img 
                          src="/sovereign-pack.png" 
                          alt="NARD Sovereign Pack" 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-[0.88] contrast-105 saturate-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/60 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                    <p className="text-[10.5px] text-[#ECE8E1]/55 leading-relaxed font-light font-sans">
                      {tq("packDesc")}
                    </p>
                    
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-[#ECE8E1]/30 tracking-wider">SET_PRICE // SPECIAL_MATCH</span>
                        <span className="text-3xl font-serif font-light text-[#ECE8E1] tracking-wide mt-0.5">
                          {formatRegionalPrice(packPrice, currentRegion)}
                        </span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAddMatchedToCart(getMatchedProductDetails(SOVEREIGN_PACK.id))}
                        className="px-8 py-4 bg-[#C29F68] hover:bg-transparent border border-[#C29F68] hover:text-[#C29F68] text-[#0b0b0b] text-[10px] font-mono font-semibold tracking-[0.2em] transition-luxury rounded-none uppercase cursor-pointer glow-amber-hover"
                      >
                        {tq("addPack")}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber Monospace dynamic indicators Footer */}
      <footer className="w-full max-w-7xl border-t border-white/5 mt-24 pt-6 px-6 flex flex-col md:flex-row justify-between items-center text-[9px] font-mono text-[#ECE8E1]/40 gap-4 select-none">
        <div className="flex gap-6">
          <span>AMBIENT_FREQ: 432HZ</span>
          <span>GPU_RENDER: WebGL_ACTIVE</span>
          <span>FPS: 60_LOCKED</span>
        </div>
        <div className="flex gap-6">
          <span>HOSTING: HOSTINGER_SECURE</span>
          <span>NARD_CORE // ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </main>
  );
}
