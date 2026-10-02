"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function InteractiveHeader() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Studio");
  const n = useTranslations("Navbar");
  return <header className="site-header"><div className="header-inner section-shell">
    <a href={`/${locale}/`} className="brand-link" aria-label="NARD">
      <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.8" /><circle cx="50" cy="50" r="42" stroke="currentColor" strokeOpacity=".3" /><path d="M35 28V72M35 28L51 72M51 28V72M51 28H64C70 28 70 45 64 45H51M58 45 67 72" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>NARD</span>
    </a>
    <nav className="header-nav" aria-label={t("navigation")}><a href="#collection">{n("collections")}</a><a href="#guide">{t("findSignature")}</a><a href="#contact">{t("contact")}</a></nav>
    <div className="language-control"><svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" stroke="currentColor" strokeWidth="1.4" /></svg><label htmlFor="site-language">{n("region")}</label><select id="site-language" value={locale} onChange={(event) => router.push(`/${event.target.value}/${window.location.hash}`)}><option value="tr">Türkçe</option><option value="en">English</option><option value="de">Deutsch</option><option value="fr">Français</option></select></div>
  </div></header>;
}
