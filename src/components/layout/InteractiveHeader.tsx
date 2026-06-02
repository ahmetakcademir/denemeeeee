"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useStore } from "@/store/useStore";
import CustomSoundToggle from "../ui/CustomSoundToggle";
import NebulaRegionDrawer from "../brand/NebulaRegionDrawer";
import CartDrawer from "../product/CartDrawer";

export default function InteractiveHeader() {
  const t = useTranslations("Navbar");
  const currentRegion = useStore((s) => s.currentRegion);
  const cartItems = useStore((s) => s.cartItems);

  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const setIsQuizActive = useStore((s) => s.setIsQuizActive);

  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-30 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        {/* Left Side: Logo & Coordinates */}
        <div className="flex items-center gap-4">
          <div className="relative w-8 h-8 group cursor-pointer flex items-center justify-center">
            {/* World-class luxury interlocking N-R monogram with spring-based hover scaling and golden shadow glows */}
            <svg 
              className="w-7 h-7 transform transition-transform duration-500 group-hover:scale-110 filter drop-shadow-[0_0_8px_rgba(194,159,104,0.35)] group-hover:drop-shadow-[0_0_12px_rgba(194,159,104,0.7)]" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="headerLuxuryGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#F2D5A2" />
                  <stop offset="50%" stop-color="#C29F68" />
                  <stop offset="100%" stop-color="#8C6E3E" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="43" stroke="url(#headerLuxuryGold)" strokeWidth="0.8" opacity="0.3" />
              <circle cx="50" cy="50" r="46" stroke="url(#headerLuxuryGold)" strokeWidth="1.8" />
              <path d="M35 28 V72 M35 28 L51 72 M51 28 V72" stroke="url(#headerLuxuryGold)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M51 28 H64 C70 28 70 45 64 45 H51 M58 45 L67 72" stroke="url(#headerLuxuryGold)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-[#ECE8E1] hover:text-[#C29F68] transition-colors duration-300 cursor-pointer select-none">
            NARD
          </h1>
          <div className="hidden lg:flex flex-col text-[9px] font-mono text-[#ECE8E1]/30 border-l border-white/10 pl-6 gap-0.5">
            <span>SYS_LOCALE: {currentRegion.toUpperCase()}</span>
            <span>SYSTEM_ONLINE: YES</span>
          </div>
        </div>

        {/* Center: Editorial Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-[#ECE8E1]/70">
          <a href="#collection" className="hover:text-[#C29F68] transition-colors duration-300">
            {t("collections")}
          </a>
          <button 
            onClick={() => setIsQuizActive(true)}
            className="hover:text-[#C29F68] transition-colors duration-300 bg-transparent border-none p-0 cursor-pointer uppercase tracking-widest text-[11px] font-mono"
          >
            {t("quiz")}
          </button>
        </nav>

        {/* Right Side: Region, Cart & Audio toggles */}
        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <CustomSoundToggle />

          {/* Region Toggle */}
          <button
            onClick={() => setIsRegionOpen(true)}
            className="px-3 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] tracking-widest font-mono text-[#ECE8E1]/80 uppercase"
          >
            {currentRegion}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] tracking-widest font-mono text-[#ECE8E1]/80 flex items-center gap-2"
          >
            <span>{t("cart")}</span>
            <span className="text-[#C29F68] font-bold">({totalCartQuantity})</span>
          </button>
        </div>
      </header>

      {/* Slide-out Panel Drawers */}
      <NebulaRegionDrawer isOpen={isRegionOpen} onClose={() => setIsRegionOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
