"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

/**
 * GA4 Component yang dimuat secara lazily HANYA setelah interaksi pengguna pertama
 * (scroll, touch, click, pointerdown) atau setelah idle (PRD Tahap 10, NFR-01, NFR-10).
 * Menjamin 0 dampak negatif terhadap LCP dan INP Core Web Vitals.
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    // Inisialisasi dataLayer sedini mungkin agar event tidak hilang
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", measurementId, {
      send_page_view: true,
      anonymize_ip: true,
    });

    const triggerLoad = () => {
      setShouldLoad(true);
      cleanupListeners();
    };

    const listeners = ["pointerdown", "scroll", "touchstart", "keydown"];
    const cleanupListeners = () => {
      listeners.forEach((evt) => window.removeEventListener(evt, triggerLoad));
    };

    listeners.forEach((evt) =>
      window.addEventListener(evt, triggerLoad, { once: true, passive: true })
    );

    // Fallback: muat otomatis setelah 4 detik idle jika pengguna tidak berinteraksi
    const idleTimer = setTimeout(triggerLoad, 4000);

    return () => {
      clearTimeout(idleTimer);
      cleanupListeners();
    };
  }, [measurementId]);

  if (!measurementId || !shouldLoad) {
    return null;
  }

  return (
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
    />
  );
}

// Deklarasi global window type
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
