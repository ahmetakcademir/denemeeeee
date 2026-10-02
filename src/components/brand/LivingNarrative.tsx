"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { mountLivingSculpture } from "@/lib/living-sculpture";

export default function LivingNarrative() {
  const ref=useRef<HTMLElement>(null);
  const t=useTranslations("Studio"), n=useTranslations("Narrative");
  useEffect(()=>ref.current?mountLivingSculpture(ref.current,"nard"):undefined,[]);
  return <section className="living-scene" ref={ref} aria-labelledby="hero-title">
    <div className="living-stage" aria-hidden="true"><div className="living-fallback"><svg viewBox="0 0 400 400" fill="none"><path d="M220 44c-220 79 200 136-24 195S277 333 173 365M237 51c-190 66 171 129-28 192S264 324 190 357M200 55c-199 77 186 134-18 181S255 336 153 358" stroke="#d6bd8b" strokeWidth="1.4"/></svg></div><canvas /><div className="living-index"><span>{n("stage1")}</span><i/><span>{n("stage2")}</span><i/><span>{n("stage3")}</span></div></div>
    <div className="living-chapter" data-living-chapter><div className="living-copy"><p className="eyebrow">NARD · {t("scentTexture")}</p><h1 id="hero-title">{t("headlineOne")}<br/><em>{t("headlineTwo")}</em></h1><p>{t("heroDescription")}</p><a className="material-button" href="#collection">{t("explore")} <span aria-hidden="true">↗</span></a><a className="living-scroll" href="#scent-story">{n("scroll")} <span aria-hidden="true">↓</span></a></div></div>
    <div id="scent-story" className="living-chapter living-right" data-living-chapter><div className="living-copy"><p className="eyebrow">01 / SPIKENARD</p><h2>{n("chapter2a")}<br/><em>{n("chapter2b")}</em></h2><p>{n("body2")}</p><a className="text-link" href="#spikenard">{n("link2")} <span aria-hidden="true">↗</span></a></div></div>
    <div className="living-chapter" data-living-chapter><div className="living-copy"><p className="eyebrow">02 / NARD</p><h2>{n("chapter3a")}<br/><em>{n("chapter3b")}</em></h2><p>{n("body3")}</p><a className="material-button" href="#guide">{t("findSignature")} <span aria-hidden="true">↗</span></a></div></div>
  </section>;
}
