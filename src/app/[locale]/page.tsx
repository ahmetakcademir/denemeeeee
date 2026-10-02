"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import InteractiveHeader from "@/components/layout/InteractiveHeader";
import ScentGuide from "@/components/brand/ScentGuide";
import LivingNarrative from "@/components/brand/LivingNarrative";
import catalog from "@/data/products.json";
import type { DBProductDataset, Region } from "@/store/useStore";

const products = catalog as DBProductDataset;
const enquiry = (product: string) => `mailto:hello@akcastudio.com?subject=${encodeURIComponent(`NARD | ${product}`)}`;

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Specifications({ entries, label }: { entries: string[]; label: string }) {
  return <div className="specifications"><p className="eyebrow">{label}</p><dl>{entries.map((entry, index) => {
    const separator = entry.indexOf(":");
    return <div key={entry}><dt><span aria-hidden="true">0{index + 1}</span>{separator < 0 ? "—" : entry.slice(0, separator)}</dt><dd>{separator < 0 ? entry : entry.slice(separator + 1).trim()}</dd></div>;
  })}</dl></div>;
}

export default function Home() {
  const locale = useLocale() as Region;
  const p = useTranslations("Products");
  const s = useTranslations("Studio");
  const q = useTranslations("Quiz");

  return <>
    <a href="#main" className="skip-link">{s("skip")}</a>
    <InteractiveHeader />
    <main id="main">
      <LivingNarrative />

      <nav className="collection-index section-shell" aria-label={s("collectionNavigation")}>
        <a href="#spikenard"><span>01</span>{s("fragrance")}<Arrow diagonal /></a>
        <a href="#polo"><span>02</span>{s("texture")}<Arrow diagonal /></a>
        <a href="#sovereign"><span>03</span>Sovereign<Arrow diagonal /></a>
      </nav>

      <section id="collection" className="collection section-shell" aria-labelledby="collection-title">
        <header className="section-heading"><div><p className="eyebrow">{s("collectionEyebrow")}</p><h2 id="collection-title">{s("collectionTitle")}</h2></div><p>{s("collectionDescription")}</p></header>

        <article id="spikenard" className="product-feature" aria-labelledby="perfume-title">
          <figure className="product-media brass-media"><Image src="/perfume.webp" alt={p("perfumeTitle")} width={1024} height={1024} sizes="(max-width: 760px) 100vw, 50vw" loading="lazy" /><figcaption><span>01 — SPIKENARD</span><span>{s("fragrance")}</span></figcaption></figure>
          <div className="product-copy"><p className="eyebrow"><span className="accent-line" />{s("fragrance")}</p><h3 id="perfume-title">Spikenard.</h3><p className="product-intro">{p("perfumeDesc")}</p><Specifications entries={products.perfume.specs?.[locale] || []} label={s("notes")} /><a className="material-button" href={enquiry(p("perfumeTitle"))}>{s("enquire")}<Arrow diagonal /></a></div>
        </article>

        <article id="polo" className="product-feature product-feature-reverse" aria-labelledby="polo-title">
          <figure className="product-media sage-media"><Image src="/polo.webp" alt={p("poloTitle")} width={1024} height={1024} sizes="(max-width: 760px) 100vw, 50vw" loading="lazy" /><figcaption><span>02 — HEAVYWEIGHT</span><span>{s("texture")}</span></figcaption></figure>
          <div className="product-copy"><p className="eyebrow"><span className="accent-line" />{s("texture")}</p><h3 id="polo-title">Heavyweight<br />Polo.</h3><p className="product-intro">{p("poloDesc")}</p><Specifications entries={products.polo.specs?.[locale] || []} label={p("featuresTitle")} /><a className="material-button material-button-sage" href={enquiry(p("poloTitle"))}>{s("enquire")}<Arrow diagonal /></a></div>
        </article>

        <article id="sovereign" className="sovereign-feature" aria-labelledby="sovereign-title">
          <div className="sovereign-copy"><p className="eyebrow">03 — {s("together")}</p><h3 id="sovereign-title">The Sovereign<br />Collection.</h3><p>{q("packDesc")}</p><a className="material-button" href={enquiry(q("matchPack"))}>{s("enquireSet")}<Arrow diagonal /></a></div>
          <figure className="sovereign-media"><Image src="/sovereign-pack.webp" alt={q("matchPack")} width={1024} height={1024} sizes="(max-width: 760px) 100vw, 55vw" loading="lazy" /></figure>
        </article>

        {!!products.customProducts?.length && <section className="custom-collection" aria-labelledby="custom-title"><h3 id="custom-title">{s("moreCollection")}</h3><div className="custom-grid">{products.customProducts.map(product => {
          const name = typeof product.name === "string" ? product.name : product.name[locale] || product.name.tr;
          const description = typeof product.description === "string" ? product.description : product.description[locale] || product.description.tr;
          return <article key={product.id}><Image src={product.image} alt={name} width={1024} height={1024} loading="lazy" /><h4>{name}</h4><p>{description}</p><Specifications entries={product.specs} label={s("details")} /><a className="text-link" href={enquiry(name)}>{s("enquire")}<Arrow diagonal /></a></article>;
        })}</div></section>}
      </section>

      <section id="guide" className="guide-section section-shell" aria-labelledby="guide-title"><div className="guide-intro"><p className="eyebrow">{s("guideEyebrow")}</p><h2 id="guide-title">{s("guideTitle")}</h2><p>{s("guideDescription")}</p><span className="guide-note">{s("guideNote")}</span></div><ScentGuide /></section>

      <section id="contact" className="contact-section section-shell" aria-labelledby="contact-title"><p className="eyebrow">NARD</p><div><h2 id="contact-title">{s("contactTitle")}</h2><a className="material-button" href={enquiry("Koleksiyon / Collection")}>{s("contactAction")}<Arrow diagonal /></a></div><p>{s("contactDescription")}</p></section>
    </main>
    <footer className="site-footer section-shell"><a href={`/${locale}/`} className="footer-wordmark" aria-label="NARD">NARD</a><div><span>© {new Date().getFullYear()} NARD</span><a href="https://akcastudio.com/" target="_blank" rel="noopener noreferrer">AKCA Studio<Arrow diagonal /></a><a href="#main">{s("backTop")} ↑</a></div></footer>
  </>;
}
