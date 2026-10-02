import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#080c0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nardparfum.com"),
  manifest: "/manifest.json",
  title: "NARD — Scent & Texture",
  description: "Explore NARD Spikenard fragrance, Heavyweight Polo and the Sovereign collection. Discover scent, texture and your own signature.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
    <html lang={locale} className={inter.variable}>
      <head>
        {/* Inject Google SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
