import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Fira_Code, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
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

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nardparfum.com"),
  manifest: "/manifest.json",
  title: "NARD — The Noble Scent & Silhouette",
  description: "Pure organic luxury inspired by the Himalayan peaks. Harmonizing custom spikenard scents with heavyweight organic linen-cotton polo t-shirts.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

const locales = ["tr", "en", "de", "fr"] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) notFound();
  setRequestLocale(locale);

  // Load static translations
  const messages = await getMessages();

  // Brand information can be published without asserting unverified stock or prices.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "NARD",
    "url": "https://nardparfum.com",
    "logo": "https://nardparfum.com/favicon.svg"
  };

  return (
    <html lang={locale} className={`${cormorant.variable} ${fira.variable} ${inter.variable}`}>
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
