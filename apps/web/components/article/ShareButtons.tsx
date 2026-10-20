"use client";

import React, { useState } from "react";
import { Share2, Link2, Check, MessageCircle, Twitter, Facebook } from "lucide-react";
import { clsx } from "clsx";

export interface ShareButtonsProps {
  title: string;
  url: string;
  className?: string;
}

export function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className={clsx("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1 hidden sm:inline">
        Bagikan:
      </span>

      {/* WhatsApp Share Button (Prioritas Utama PRD FR-106) */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Bagikan ke WhatsApp"
        className="h-9 px-3 rounded-control bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp</span>
      </a>

      {/* X / Twitter Share */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Bagikan ke X"
        className="w-9 h-9 rounded-control bg-surface border border-border hover:bg-brand-soft hover:text-brand text-muted flex items-center justify-center transition-colors"
      >
        <Twitter className="w-4 h-4" />
      </a>

      {/* Facebook Share */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Bagikan ke Facebook"
        className="w-9 h-9 rounded-control bg-surface border border-border hover:bg-brand-soft hover:text-brand text-muted flex items-center justify-center transition-colors"
      >
        <Facebook className="w-4 h-4" />
      </a>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        title="Salin Tautan"
        className="h-9 px-3 rounded-control bg-surface border border-border hover:bg-brand-soft hover:text-brand text-muted text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-600">Tersalin!</span>
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            <span>Salin Tautan</span>
          </>
        )}
      </button>

      {/* Mobile Web Share Button */}
      <button
        type="button"
        onClick={handleWebShare}
        title="Bagikan via Aplikasi Lain"
        className="w-9 h-9 sm:hidden rounded-control bg-brand-soft text-brand flex items-center justify-center transition-colors"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}
