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
  
  // Real-time coordinates state
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const trackCoords = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", trackCoords);
    return () => window.removeEventListener("mousemove", trackCoords);
  }, []);

  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-30 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        {/* Left Side: Logo & Coordinates */}
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-bold tracking-widest text-[#ECE8E1] hover:text-[#C29F68] transition-colors duration-300 cursor-pointer">
            NARD
          </h1>
          <div className="hidden lg:flex flex-col text-[9px] font-mono text-[#ECE8E1]/40 border-l border-white/10 pl-8 gap-0.5">
            <span>SYS_LOCALE: {currentRegion.toUpperCase()}</span>
            <span>
              {t("coords")} [X: {coords.x}px / Y: {coords.y}px]
            </span>
          </div>
        </div>

        {/* Center: Editorial Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-[#ECE8E1]/70">
          <a href="#collection" className="hover:text-[#C29F68] transition-colors duration-300">
            {t("collections")}
          </a>
          <a href="#quiz" className="hover:text-[#C29F68] transition-colors duration-300">
            {t("quiz")}
          </a>
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
