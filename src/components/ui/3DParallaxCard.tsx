"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useStore } from "@/store/useStore";

interface CardProps {
  children: React.ReactNode;
  productType: "perfume" | "polo" | "custom";
  className?: string;
  glowColor?: string;
}

export default function ParallaxCard3D({ children, productType, className = "", glowColor }: CardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const setHoveredProduct = useStore((s) => s.setHoveredProduct);

  // Elastic Framer Motion spring values for professional tactile feedback
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.8 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

  // Dynamic light refraction (shimmer grad) positions
  const shimmerX = useSpring(useTransform(x, [-0.5, 0.5], ["0%", "100%"]), springConfig);
  const shimmerY = useSpring(useTransform(y, [-0.5, 0.5], ["0%", "100%"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse coordinates relative to card center [-0.5, 0.5]
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    // Reset spring to center
    x.set(0);
    y.set(0);
    setHoveredProduct(null);
  };

  const handleMouseEnter = () => {
    // Dynamically trigger the WebGL liquid background color transition
    setHoveredProduct(productType);
  };

  const accentColor = glowColor || (productType === "perfume" ? "#C29F68" : "#5E6D62");

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full cursor-pointer perspective-1000 ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: `0 10px 40px -10px ${accentColor}2c, 0 0 20px ${accentColor}15`
        }}
        whileHover={{
          scale: 1.03,
          boxShadow: `0 20px 50px -5px ${accentColor}5e, 0 0 30px ${accentColor}2c`,
          borderColor: `${accentColor}50`
        }}
        className="relative w-full h-full glass-panel border border-white/10 p-6 flex flex-col items-center justify-center overflow-hidden select-none transition-[border-color,background-color] duration-500"
      >
        {/* Dynamic Light Refraction Shimmer Overlay */}
        <motion.div
          style={{
            background: useTransform(
              [shimmerX, shimmerY],
              ([sx, sy]) =>
                `radial-gradient(circle at ${sx} ${sy}, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%)`
            ),
          }}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* 3D Depth Card Content */}
        <div style={{ transform: "translateZ(40px)" }} className="w-full h-full relative z-20 flex flex-col">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
