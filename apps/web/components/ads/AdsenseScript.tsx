"use client";

import React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

export interface ShouldRenderAdsenseParams {
  isProduction: boolean;
  enabled?: boolean;
  publisherId?: string;
  isNoIndex?: boolean;
  is404?: boolean;
  pathname?: string | null;
}

export function shouldRenderAdsense({
  isProduction,
  enabled,
  publisherId,
  isNoIndex,
  is404,
  pathname,
}: ShouldRenderAdsenseParams): boolean {
  if (!isProduction) return false;
  if (!enabled) return false;
  if (!publisherId || !publisherId.startsWith("pub-")) return false;
  if (isNoIndex) return false;
  if (is404) return false;
  if (
    pathname &&
    (pathname.startsWith("/cari") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/studio") ||
      pathname.startsWith("/draft"))
  ) {
    return false;
  }
  return true;
}

interface AdsenseScriptProps {
  publisherId?: string;
  enabled?: boolean;
}

export function AdsenseScript({ publisherId, enabled }: AdsenseScriptProps) {
  const pathname = usePathname();
  const isProduction = process.env.NODE_ENV === "production";

  const canRender = shouldRenderAdsense({
    isProduction,
    enabled,
    publisherId,
    pathname,
  });

  if (!canRender || !publisherId) {
    return null;
  }

  return (
    <>
      <meta name="google-adsense-account" content={publisherId} />
      <Script
        id="google-adsense"
        strategy="afterInteractive"
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      />
    </>
  );
}
