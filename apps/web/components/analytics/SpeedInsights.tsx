"use client";

import React from "react";
import Script from "next/script";

/**
 * Vercel Speed Insights component (PRD Tahap 10, NFR-01, NFR-10).
 * Mengukur Core Web Vitals (LCP, INP, CLS) secara langsung dari peramban pengguna.
 * Hanya aktif jika berada di platform Vercel atau lingkungan produksi.
 */
export function SpeedInsights() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction && !process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return null;
  }

  return (
    <Script
      id="vercel-speed-insights"
      strategy="afterInteractive"
      src="/_vercel/speed-insights/script.js"
    />
  );
}
