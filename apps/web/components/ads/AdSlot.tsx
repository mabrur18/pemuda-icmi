"use client";

import React, { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Megaphone } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export type AdPosition = "inArticle" | "belowArticle" | "sidebar" | "inFeed";

export interface AdSlotProps {
  position: AdPosition;
  slotId?: string;
  publisherId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive?: boolean;
  adsEnabled?: boolean;
  className?: string;
}

const positionHeights: Record<AdPosition, string> = {
  inArticle: "min-h-[280px]",
  belowArticle: "min-h-[250px]",
  sidebar: "min-h-[600px]",
  inFeed: "min-h-[120px]",
};

const positionLabels: Record<AdPosition, string> = {
  inArticle: "Unit Iklan Dalam Artikel (In-Article)",
  belowArticle: "Unit Iklan Bawah Artikel (Below-Article)",
  sidebar: "Unit Iklan Bilah Samping (Sidebar Desktop)",
  inFeed: "Unit Iklan Feed (In-Feed)",
};

export function AdSlot({
  position,
  slotId,
  publisherId,
  format = "auto",
  fullWidthResponsive = true,
  adsEnabled = true,
  className,
}: AdSlotProps) {
  const isPushed = useRef(false);
  const isProduction = process.env.NODE_ENV === "production";
  const heightClass = positionHeights[position] || "min-h-[250px]";

  const effectivePublisherId = publisherId || "pub-XXXXXXXXXXXXXXXX";

  // Push to adsbygoogle in production
  useEffect(() => {
    if (!adsEnabled) return;
    if (!isProduction) return;
    if (!slotId || slotId === "placeholder") return;

    if (!isPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    }
  }, [adsEnabled, isProduction, slotId]);

  // If ads are disabled on this post/page (FR-504), don't render anything
  if (!adsEnabled) {
    return null;
  }

  return (
    <aside
      aria-label="Iklan"
      className={clsx(
        "w-full flex flex-col items-center justify-center my-6 overflow-hidden rounded-card transition-all",
        heightClass,
        className
      )}
    >
      {/* Label Iklan (PRD: Label 'Iklan' wajib agar transparan bagi pembaca) */}
      <span className="text-xs uppercase tracking-wider text-muted font-semibold mb-1.5 self-center">
        Iklan
      </span>

      {/* Production Live Ad vs Development/Preview Placeholder */}
      {isProduction && slotId && slotId !== "placeholder" ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={effectivePublisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
        />
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-border/80 bg-surface/60 text-center rounded-control">
          <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center mb-2">
            <Megaphone className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-ink/70">
            {positionLabels[position]}
          </span>
          <span className="text-xs text-muted mt-0.5">
            {slotId ? `Slot ID: ${slotId}` : "Penempatan Otomatis AdSense"} · {effectivePublisherId}
          </span>
          <span className="text-xs text-accent/80 font-medium mt-2 px-2 py-0.5 rounded-full bg-accent/10">
            {isProduction ? "Slot Iklan Siap Tayang" : "Preview Mode (Bebas Pergeseran Tata Letak)"}
          </span>
        </div>
      )}
    </aside>
  );
}
