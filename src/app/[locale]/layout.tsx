import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Fira_Code } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import "@/styles/globals.css";

// Optimize Google Fonts at build time to prevent CLS
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const fira = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-fira",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "NARD — The Noble Scent & Silhouette",
  description: "Pure organic luxury inspired by the Himalayan peaks. Harmonizing custom spikenard scents with heavyweight organic linen-cotton polo t-shirts.",
  icons: {
    icon: "/favicon.ico",
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  const locales = ["tr", "en", "de", "fr"];
  if (!locales.includes(locale)) notFound();

  // Load static translations
  const messages = await getMessages();

  // Dynamic Google JSON-LD Product & Brand Schema (SEO Power)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "NARD Sovereign Pack",
    "image": "https://nardparfum.com/nard-sovereign-pack.jpg",
    "description": "Exquisite bespoke Spikenard Perfume paired with heavyweight organic knit polo t-shirt.",
    "brand": {
      "@type": "Brand",
      "name": "NARD"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": locale === "tr" ? "TRY" : locale === "en" ? "USD" : "EUR",
      "lowPrice": locale === "tr" ? "2700" : locale === "en" ? "180" : "168",
      "highPrice": locale === "tr" ? "2700" : locale === "en" ? "180" : "168",
      "offerCount": "1",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <html lang={locale} className={`${cormorant.variable} ${fira.variable}`}>
      <head>
        {/* Inject Google SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#111111] text-[#ECE8E1] antialiased selection:bg-[#C29F68] selection:text-[#111111]">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
