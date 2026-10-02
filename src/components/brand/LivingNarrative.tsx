"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { mountEditorialMotion } from "@/lib/editorial-motion";

function ProductPhotograph({name,alt,className,priority=false}:{name:string;alt:string;className?:string;priority?:boolean}) {
 return <picture className={className}><source srcSet={`/${name}-480.webp 480w, /${name}-768.webp 768w, /${name}.webp 1024w`} sizes={priority?"(max-width:760px) 100vw, 70vw":"(max-width:760px) 65vw, 30vw"}/><img src={`/${name}.webp`} width="1024" height="1024" alt={alt} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"}/></picture>;
}
export default function LivingNarrative(){
 const ref=useRef<HTMLElement>(null);const t=useTranslations("Studio"),n=useTranslations("Narrative"),p=useTranslations("Products");
 useEffect(()=>ref.current?mountEditorialMotion(ref.current):undefined,[]);
 return <section className="scent-cinema" ref={ref} aria-labelledby="hero-title">
  <div className="scent-frame"><div className="scent-word" aria-hidden="true">NARD</div><ProductPhotograph name="perfume" alt={p("perfumeTitle")} className="scent-photograph" priority/><div className="scent-light" aria-hidden="true"/>
   <div className="scent-title"><span>SPIKENARD / NARD</span><h1 id="hero-title">{t("headlineOne")}<br/><em>{t("headlineTwo")}</em></h1></div>
   <div className="scent-action"><p>{t("heroDescription")}</p><a className="material-button" href="#collection">{t("explore")} <span aria-hidden="true">↗</span></a></div><a className="scent-caption" href="#scent-story">{n("scroll")} <span aria-hidden="true">↓</span></a>
  </div>
  <div className="scent-material" id="scent-story"><div><span>{t("scentTexture")}</span><h2>{n("chapter3a")}<br/><em>{n("chapter3b")}</em></h2><p>{n("body3")}</p><a className="text-link" href="#guide">{t("findSignature")} <span aria-hidden="true">↗</span></a></div><figure><ProductPhotograph name="polo" alt={p("poloTitle")}/><figcaption>Heavyweight Polo / NARD</figcaption></figure><p className="scent-side-note">{n("body2")}</p></div>
 </section>;
}
