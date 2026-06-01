"use client";

import { useStore } from "@/store/useStore";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { formatRegionalPrice } from "@/utils/productData";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const t = useTranslations("Cart");
  const tp = useTranslations("Products");
  const tq = useTranslations("Quiz");
  const cartItems = useStore((s) => s.cartItems);
  const currentRegion = useStore((s) => s.currentRegion);
  const removeFromCart = useStore((s) => s.removeFromCart);

  // Dynamic price summation
  const totalBalance = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getTranslatedName = (nameKey: string) => {
    if (nameKey.startsWith("Products.")) {
      return tp(nameKey.replace("Products.", "") as any);
    }
    if (nameKey.startsWith("Quiz.")) {
      return tq(nameKey.replace("Quiz.", "") as any);
    }
    return nameKey;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Cart Panel Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 210 }}
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-[420px] glass-panel border-l border-white/10 glow-amber flex flex-col p-8 select-none text-left"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h2 className="text-2xl font-semibold tracking-wider text-[#ECE8E1]">
                {t("title")}
              </h2>
              <button
                onClick={onClose}
                className="text-xs tracking-widest text-[#C29F68] hover:text-white transition-colors duration-300"
              >
                X
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 scrollbar-thin">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <p className="text-xs text-[#ECE8E1]/40 leading-relaxed font-light">
                    {t("empty")}
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start border-b border-white/5 pb-4"
                  >
                    <div className="flex-1 flex flex-col pr-4">
                      <span className="text-xs tracking-wider text-[#C29F68] font-mono uppercase mb-0.5">
                        {item.type}
                      </span>
                      <span className="text-sm font-medium text-[#ECE8E1] tracking-wide">
                        {getTranslatedName(item.nameKey)}
                      </span>
                      <span className="text-xs text-[#ECE8E1]/50 font-mono mt-1">
                        {item.quantity} x {formatRegionalPrice(item.price, currentRegion)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full gap-2">
                      <span className="text-sm font-semibold font-mono text-[#ECE8E1]">
                        {formatRegionalPrice(item.price * item.quantity, currentRegion)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[9px] tracking-widest font-mono text-red-400 hover:text-red-300 transition-colors uppercase"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart checkout area */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/5 pt-6 mt-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs tracking-widest font-mono text-[#ECE8E1]/60">
                    {t("total")}
                  </span>
                  <span className="text-xl font-bold font-mono text-[#C29F68] glow-amber">
                    {formatRegionalPrice(totalBalance, currentRegion)}
                  </span>
                </div>

                <button
                  onClick={() => alert("Redirecting to secured checkout...")}
                  className="w-full py-4 bg-[#C29F68] hover:bg-[#C29F68]/80 text-[#111111] text-xs font-semibold font-mono tracking-widest rounded-none transition-luxury glow-amber"
                >
                  {t("checkout")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
