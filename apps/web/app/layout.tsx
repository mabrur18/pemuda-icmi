import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pemudaicmi-kotabekasi.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pemuda ICMI Kota Bekasi - Portal Cendekia Muda & Pembangunan Umat",
    template: "%s | Pemuda ICMI Kota Bekasi",
  },
  description:
    "Portal resmi Majelis Pengurus Daerah Pemuda Ikatan Cendekiawan Muslim se-Indonesia (Pemuda ICMI) Kota Bekasi. Wadah kepemimpinan intelektual muda, transformasi sains, teknologi, dan keislaman.",
  keywords: [
    "Pemuda ICMI",
    "Kota Bekasi",
    "Cendekiawan Muslim",
    "Kaderisasi",
    "Ekonomi Syariah",
    "Literasi Digital",
    "Kebijakan Publik",
  ],
  authors: [{ name: "Redaksi Pemuda ICMI Kota Bekasi" }],
  creator: "Pemuda ICMI Kota Bekasi",
  publisher: "Pemuda ICMI Kota Bekasi",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Pemuda ICMI Kota Bekasi",
    title: "Pemuda ICMI Kota Bekasi - Portal Cendekia Muda",
    description:
      "Portal resmi Majelis Pengurus Daerah Pemuda ICMI Kota Bekasi menyajikan berita kegiatan, gagasan kebangsaan, dan literasi cendekia.",
    images: [
      {
        url: "/api/og?title=Pemuda+ICMI+Kota+Bekasi",
        width: 1200,
        height: 630,
        alt: "Pemuda ICMI Kota Bekasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pemuda ICMI Kota Bekasi",
    description: "Portal resmi Majelis Pengurus Daerah Pemuda ICMI Kota Bekasi.",
    images: ["/api/og?title=Pemuda+ICMI+Kota+Bekasi"],
  },
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

import { themePreRenderScript } from "@/components/ui/ThemeToggle";
import { AdsenseScript } from "@/components/ads/AdsenseScript";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SpeedInsights } from "@/components/analytics/SpeedInsights";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import "@/lib/env";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteSettings: any = null;
  try {
    siteSettings = await sanityFetch({
      query: SITE_SETTINGS_QUERY,
      tags: ["siteSettings"],
    });
  } catch (err) {
    console.error("Failed to fetch site settings in RootLayout:", err);
  }

  const adsense = siteSettings?.adsense;
  const gaId = siteSettings?.analytics?.gaMeasurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${sourceSerif4.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themePreRenderScript,
          }}
        />
        <AdsenseScript
          publisherId={adsense?.publisherId || "pub-XXXXXXXXXXXXXXXX"}
          enabled={adsense?.enabled ?? false}
        />
      </head>
      <body className="font-sans antialiased bg-bg text-ink">
        {children}
        <GoogleAnalytics measurementId={gaId} />
        <SpeedInsights />
      </body>
    </html>
  );
}

