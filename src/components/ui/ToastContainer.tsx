"use client";

import { useStore } from "@/store/useStore";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  const getAccentColor = (type?: string) => {
    switch (type) {
      case "success":
        return {
          border: "border-[#C29F68]/30",
          text: "text-[#C29F68]",
          bg: "bg-[#C29F68]/5",
          icon: (
            <svg className="w-4 h-4 text-[#C29F68]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case "error":
        return {
          border: "border-red-500/30",
          text: "text-red-400",
          bg: "bg-red-950/20",
          icon: (
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case "info":
      default:
        return {
          border: "border-blue-500/30",
          text: "text-blue-400",
          bg: "bg-blue-950/20",
          icon: (
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  return (
    <div className="fixed top-24 right-4 md:right-8 z-50 flex flex-col gap-3 w-full max-w-[320px] pointer-events-none select-none">
      <LayoutGroup>
        <AnimatePresence>
          {toasts.map((toast) => {
            const accent = getAccentColor(toast.type);
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`pointer-events-auto w-full glass-panel border ${accent.border} ${accent.bg} p-4 flex gap-3 items-start justify-between shadow-2xl relative overflow-hidden group`}
              >
                {/* Thin side glowing accent bar */}
                <div className={`absolute top-0 left-0 w-[3px] h-full`} style={{ background: toast.type === "success" ? "#C29F68" : toast.type === "error" ? "#ef4444" : "#3b82f6" }} />
                
                <div className="flex gap-3 items-center">
                  <div className="shrink-0">{accent.icon}</div>
                  <span className="text-[11px] font-sans font-light tracking-wide text-[#ECE8E1] leading-relaxed">
                    {toast.message}
                  </span>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-[#ECE8E1]/30 hover:text-[#ECE8E1]/80 transition-colors duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
