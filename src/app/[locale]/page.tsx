"use client";

import { useState } from "react";
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

  // Quiz states
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const handleQuizAnswer = (answerIndex: number) => {
    const updatedAnswers = [...quizAnswers, answerIndex];
    setQuizAnswers(updatedAnswers);

    if (quizStep < 3) {
      setQuizStep(quizStep + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setQuizStep(1);
    setQuizAnswers([]);
    setIsQuizComplete(false);
    setIsQuizActive(false);
  };

  const handleAddPackToCart = () => {
    // Add Sovereign Pack (discounted set) to cart
    const price = SOVEREIGN_PACK.basePrice[currentRegion];
    addToCart({
      id: SOVEREIGN_PACK.id,
      nameKey: SOVEREIGN_PACK.nameKey,
      price,
      type: "pack",
    });
    resetQuiz();
    alert("NARD Sovereign Pack has been added to your cart!");
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden pt-24 pb-12 select-none">
      {/* WebGL GPU Liquid Fluid Simulation Background */}
      <FluidSimulation />

      {/* Nav bar */}
      <InteractiveHeader />

      {/* Hero Section */}
      <section className="min-h-[85vh] w-full flex flex-col justify-center items-center text-center px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl flex flex-col items-center gap-6"
        >
          <h1 className="text-7xl md:text-9xl font-extrabold tracking-[0.2em] text-[#ECE8E1] select-none hover:text-[#C29F68] transition-colors duration-500">
            {t("title")}
          </h1>
          <p className="text-xs md:text-sm tracking-widest font-mono text-[#ECE8E1]/60 max-w-2xl leading-relaxed">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href="#collection"
              className="px-8 py-4 bg-[#ECE8E1] hover:bg-[#C29F68] text-[#111111] text-[10px] font-mono font-semibold tracking-widest transition-luxury glow-amber rounded-none"
            >
              {t("ctaShop")}
            </a>
            <button
              onClick={() => setIsQuizActive(true)}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-[#ECE8E1] text-[10px] font-mono font-semibold tracking-widest transition-luxury rounded-none"
            >
              {t("ctaQuiz")}
            </button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch min-h-[600px]">
          {/* Left Column: Spikenard Perfume */}
          <div className="flex flex-col h-full">
            <ParallaxCard3D productType="perfume" className="flex-1 min-h-[450px]">
              <div className="h-full flex flex-col text-left justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#C29F68] tracking-widest">
                    BASE_FORMULA // 01
                  </span>
                  <h3 className="text-3xl font-light text-[#ECE8E1] mt-2">
                    {tp("perfumeTitle" as any)}
                  </h3>
                  <p className="text-xs text-[#ECE8E1]/60 leading-relaxed font-light mt-4">
                    {tp("perfumeDesc" as any)}
                  </p>
                </div>

                {/* Scent Molecular Notes */}
                <div className="border-t border-b border-white/5 py-4 my-6 text-[10px] font-mono text-[#C29F68]/80 flex flex-col gap-2">
                  <span className="text-[#ECE8E1]/40 uppercase tracking-widest text-[9px] mb-1">
                    {tp("notesTitle" as any)}
                  </span>
                  <span>{tp("notesTop" as any)}</span>
                  <span>{tp("notesHeart" as any)}</span>
                  <span>{tp("notesBase" as any)}</span>
                </div>

                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xl font-bold font-mono text-[#ECE8E1]">
                    {formatRegionalPrice(PRODUCTS.perfume.basePrice[currentRegion], currentRegion)}
                  </span>
                  <button
                    onClick={() => {
                      addToCart({
                        id: PRODUCTS.perfume.id,
                        nameKey: PRODUCTS.perfume.nameKey,
                        price: PRODUCTS.perfume.basePrice[currentRegion],
                        type: "perfume",
                      });
                      alert("NARD Spikenard Perfume added to cart!");
                    }}
                    className="px-6 py-3 bg-[#C29F68]/15 border border-[#C29F68] hover:bg-[#C29F68] hover:text-[#111111] text-[#C29F68] text-[9px] font-mono font-semibold tracking-widest transition-luxury rounded-none"
                  >
                    {tp("addToCart" as any)}
                  </button>
                </div>
              </div>
            </ParallaxCard3D>
          </div>

          {/* Right Column: Organic Polo */}
          <div className="flex flex-col h-full">
            <ParallaxCard3D productType="polo" className="flex-1 min-h-[450px]">
              <div className="h-full flex flex-col text-left justify-between">
                <div>
                  <span className="text-[9px] font-mono text-[#5E6D62] tracking-widest">
                    KNIT_STRUCTURE // 280GSM
                  </span>
                  <h3 className="text-3xl font-light text-[#ECE8E1] mt-2">
                    {tp("poloTitle" as any)}
                  </h3>
                  <p className="text-xs text-[#ECE8E1]/60 leading-relaxed font-light mt-4">
                    {tp("poloDesc" as any)}
                  </p>
                </div>

                {/* Fabric Specifications */}
                <div className="border-t border-b border-white/5 py-4 my-6 text-[10px] font-mono text-[#5E6D62] flex flex-col gap-2">
                  <span className="text-[#ECE8E1]/40 uppercase tracking-widest text-[9px] mb-1">
                    {tp("featuresTitle" as any)}
                  </span>
                  <span>{tp("featuresGsm" as any)}</span>
                  <span>{tp("featuresKnit" as any)}</span>
                  <span>{tp("featuresColor" as any)}</span>
                </div>

                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xl font-bold font-mono text-[#ECE8E1]">
                    {formatRegionalPrice(PRODUCTS.polo.basePrice[currentRegion], currentRegion)}
                  </span>
                  <button
                    onClick={() => {
                      addToCart({
                        id: PRODUCTS.polo.id,
                        nameKey: PRODUCTS.polo.nameKey,
                        price: PRODUCTS.polo.basePrice[currentRegion],
                        type: "polo",
                      });
                      alert("NARD Heavyweight Polo added to cart!");
                    }}
                    className="px-6 py-3 bg-[#5E6D62]/15 border border-[#5E6D62] hover:bg-[#5E6D62] hover:text-[#ECE8E1] text-[#5E6D62] text-[9px] font-mono font-semibold tracking-widest transition-luxury rounded-none"
                  >
                    {tp("addToCart" as any)}
                  </button>
                </div>
              </div>
            </ParallaxCard3D>
          </div>
        </div>
      </section>

      {/* Molecular Synthesizer Interactive Quiz Modal Overlay */}
      <AnimatePresence>
        {isQuizActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#111111]/90 backdrop-blur-md flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg glass-panel border border-white/10 p-8 glow-amber relative text-left"
            >
              {/* Close Button */}
              <button
                onClick={resetQuiz}
                className="absolute top-6 right-6 text-xs font-mono text-[#C29F68] hover:text-white transition-colors"
              >
                CLOSE
              </button>

              {!isQuizComplete ? (
                // Active Quiz steps
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[9px] font-mono text-[#C29F68] tracking-widest">
                      SYNTHESIZER // PHASE 0{quizStep}_OF_03
                    </span>
                    <h3 className="text-xl font-light text-[#ECE8E1] mt-2">
                      {quizStep === 1 ? tq("q1") : quizStep === 2 ? tq("q2") : tq("q3")}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {quizStep === 1 && (
                      <>
                        <button
                          onClick={() => handleQuizAnswer(1)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q1a1")}
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(2)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q1a2")}
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(3)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q1a3")}
                        </button>
                      </>
                    )}

                    {quizStep === 2 && (
                      <>
                        <button
                          onClick={() => handleQuizAnswer(1)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q2a1")}
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(2)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q2a2")}
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(3)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q2a3")}
                        </button>
                      </>
                    )}

                    {quizStep === 3 && (
                      <>
                        <button
                          onClick={() => handleQuizAnswer(1)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q3a1")}
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(2)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q3a2")}
                        </button>
                        <button
                          onClick={() => handleQuizAnswer(3)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-left tracking-wide font-light transition-luxury"
                        >
                          {tq("q3a3")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Quiz complete & display personalized synthesis result package
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[9px] font-mono text-green-400 tracking-widest animate-pulse">
                      SYNTHESIS // COMPLETED
                    </span>
                    <h3 className="text-3xl font-light text-[#ECE8E1] mt-2">
                      {tq("resultTitle")}
                    </h3>
                  </div>

                  <p className="text-xs text-[#ECE8E1]/60 leading-relaxed font-light">
                    {tq("resultDesc")}{" "}
                    <span className="text-[#C29F68] font-bold">
                      {quizAnswers[0] === 1
                        ? "Earthy Organic Suite"
                        : quizAnswers[0] === 2
                        ? "Nocturnal Sapphire Veil"
                        : "Sovereign Gold Aura"}
                    </span>
                  </p>

                  <div className="bg-white/5 p-5 border border-white/5">
                    <span className="text-[9px] font-mono text-[#C29F68] tracking-widest block mb-1">
                      {SOVEREIGN_PACK.id.toUpperCase()}
                    </span>
                    <h4 className="text-lg font-medium text-[#ECE8E1]">
                      {tq("matchPack")}
                    </h4>
                    <p className="text-[10px] text-[#ECE8E1]/40 leading-normal font-light mt-1">
                      {tq("packDesc")}
                    </p>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                      <span className="text-xl font-bold font-mono text-[#ECE8E1]">
                        {formatRegionalPrice(SOVEREIGN_PACK.basePrice[currentRegion], currentRegion)}
                      </span>
                      <button
                        onClick={handleAddPackToCart}
                        className="px-6 py-3 bg-[#C29F68] hover:bg-[#C29F68]/80 text-[#111111] text-[9px] font-mono font-semibold tracking-widest transition-luxury rounded-none"
                      >
                        {tq("addPack")}
                      </button>
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
