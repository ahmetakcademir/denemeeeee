"use client";

import { type Region } from "@/store/useStore";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NebulaRegionDrawer({ isOpen, onClose }: DrawerProps) {
  const t = useTranslations("NebulaRegion");
  const currentRegion = useLocale() as Region;

  const router = useRouter();
  const pathname = usePathname();

  const handleRegionChange = (region: Region) => {
    // Keep the URL as the single source of truth for the visible language.
    const segments = pathname.split("/");
    // First segment is empty, second is locale (e.g. "", "tr", "collection")
    if (segments[1] && ["tr", "en", "de", "fr"].includes(segments[1])) {
      segments[1] = region;
    } else {
      // In case there is no locale in url path, prefix it
      segments.unshift("", region);
    }
    
    const newPath = segments.join("/") || `/${region}`;
    
    // Smooth redirect
    router.push(newPath);
    onClose();
  };

  const regions: { id: Region; flag: string; labelKey: string }[] = [
    { id: "tr", flag: "🇹🇷", labelKey: "trRegion" },
    { id: "en", flag: "🌐", labelKey: "enRegion" },
    { id: "de", flag: "🇩🇪", labelKey: "deRegion" },
    { id: "fr", flag: "🇫🇷", labelKey: "frRegion" },
  ];

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

          {/* Drawer container panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 210 }}
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-[420px] glass-panel border-l border-white/10 glow-amber flex flex-col p-8 select-none text-left"
          >
            {/* Header section */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <h2 className="text-2xl font-semibold tracking-wider text-[#ECE8E1]">
                {t("title")}
              </h2>
              <button
                onClick={onClose}
                className="text-xs tracking-widest text-[#C29F68] hover:text-white transition-colors duration-300"
              >
                {t("close")}
              </button>
            </div>

            {/* Selection description */}
            <p className="text-xs text-[#ECE8E1]/60 leading-relaxed font-light mb-8">
              {t("selectDesc")}
            </p>

            {/* Region options grid */}
            <div className="flex-1 flex flex-col gap-4">
              {regions.map((region) => {
                const isActive = currentRegion === region.id;
                return (
                  <button
                    key={region.id}
                    onClick={() => handleRegionChange(region.id)}
                    className={`w-full p-4 flex items-center justify-between rounded-none text-left transition-luxury ${
                      isActive
                        ? "bg-[#C29F68]/10 border border-[#C29F68]/60 glow-amber"
                        : "bg-white/5 border border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{region.flag}</span>
                      <span className="text-sm tracking-wide font-light text-[#ECE8E1]">
                        {t(region.labelKey)}
                      </span>
                    </div>
                    <span className={`text-xs font-mono ${isActive ? "text-[#C29F68]" : "text-[#ECE8E1]/50"}`}>
                      {region.id.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
