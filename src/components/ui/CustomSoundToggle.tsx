"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useTranslations } from "next-intl";

export default function CustomSoundToggle() {
  const t = useTranslations("Hero");
  const isAudioEnabled = useStore((s) => s.isAudioEnabled);
  const toggleAudio = useStore((s) => s.toggleAudio);

  // Web Audio Context reference nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      // Clean up nodes on unmount
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const startAmbientSynthesis = () => {
    // 1. Initialize Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // 2. Create Detuned Oscillators to generate Slow Natural Chorusing
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(110, ctx.currentTime);     // Deep A2
    osc2.frequency.setValueAtTime(110.4, ctx.currentTime);   // Micro-detuned

    osc1Ref.current = osc1;
    osc2Ref.current = osc2;

    // 3. Lowpass Biquad Filter to model soft wind/atmospheric pad
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(150, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);
    filterRef.current = filter;

    // 4. Gain node for smooth fade-in / fade-out ramps (prevents clicking)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNodeRef.current = gainNode;

    // 5. Connect node graphs: Osc -> Filter -> Gain -> Destination
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 6. Play oscillators
    osc1.start();
    osc2.start();

    // Fade-in volume
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.5);
  };

  const stopAmbientSynthesis = () => {
    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;

    if (!ctx || !gainNode) return;

    // Fade-out volume then close context
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);

    setTimeout(() => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().then(() => {
          audioCtxRef.current = null;
          osc1Ref.current = null;
          osc2Ref.current = null;
          gainNodeRef.current = null;
          filterRef.current = null;
        });
      }
    }, 1100);
  };

  const handleToggle = () => {
    if (!isAudioEnabled) {
      // Turn sound ON
      if (!audioCtxRef.current) {
        startAmbientSynthesis();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
        gainNodeRef.current?.gain.linearRampToValueAtTime(0.2, audioCtxRef.current.currentTime + 1.0);
      }
    } else {
      // Turn sound OFF
      stopAmbientSynthesis();
    }
    toggleAudio();
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative px-4 py-2 border transition-luxury text-[10px] tracking-widest font-mono flex items-center gap-2 ${
        isAudioEnabled
          ? "bg-[#C29F68]/15 border-[#C29F68] text-[#C29F68]"
          : "bg-white/5 border-white/5 text-[#ECE8E1]/50 hover:bg-white/10"
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isAudioEnabled && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C29F68] opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isAudioEnabled ? "bg-[#C29F68]" : "bg-white/30"}`}></span>
      </span>
      {isAudioEnabled ? t("soundOn") : t("soundOff")}
    </button>
  );
}
