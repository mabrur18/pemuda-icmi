import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlForImage } from "@/lib/sanity/image";
import { AdSlot } from "@/components/ads/AdSlot";
import { Info, AlertTriangle, CheckCircle, AlertOctagon } from "lucide-react";
import { clsx } from "clsx";

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export function injectAdSlotIntoBlocks(
  blocks: any[],
  targetParagraph: number = 3,
  slotId?: string
): any[] {
  if (!Array.isArray(blocks) || targetParagraph <= 0) return blocks;

  // If manual adSlot block already exists, don't duplicate
  const hasManualAd = blocks.some((b) => b._type === "adSlot");
  if (hasManualAd) return blocks;

  const result: any[] = [];
  let paragraphCount = 0;
  let adInserted = false;

  for (const block of blocks) {
    result.push(block);

    // Count normal text paragraphs
    if (block._type === "block" && (!block.style || block.style === "normal")) {
      paragraphCount++;
      if (paragraphCount === targetParagraph && !adInserted) {
        result.push({
          _key: `auto-injected-ad-p${targetParagraph}`,
          _type: "adSlot",
          position: "inArticle",
          slotId: slotId,
        });
        adInserted = true;
      }
    }
  }

  return result;
}

export function createPortableTextComponents(options?: {
  adsEnabled?: boolean;
  publisherId?: string;
}): PortableTextComponents {
  const adsEnabled = options?.adsEnabled ?? true;
  const publisherId = options?.publisherId;

  return {
    block: {
      normal: ({ children }) => (
        <p className="text-base sm:text-lg leading-relaxed text-ink/90 mb-6 font-serif">
          {children}
        </p>
      ),
      h2: ({ children, value }) => {
        const text = value.children?.map((c) => c.text).join("") || "";
        const id = slugifyText(text);
        return (
          <h2
            id={id}
            className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-10 mb-4 pt-4 border-t border-border/50 scroll-mt-24"
          >
            {children}
          </h2>
        );
      },
      h3: ({ children, value }) => {
        const text = value.children?.map((c) => c.text).join("") || "";
        const id = slugifyText(text);
        return (
          <h3
            id={id}
            className="text-xl sm:text-2xl font-bold text-ink tracking-tight mt-8 mb-3 scroll-mt-24"
          >
            {children}
          </h3>
        );
      },
      h4: ({ children }) => (
        <h4 className="text-lg font-bold text-ink mt-6 mb-2">{children}</h4>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-8 pl-6 border-l-4 border-brand bg-brand-soft/40 py-4 pr-6 rounded-r-control italic font-serif text-lg text-ink">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="list-disc pl-6 mb-6 space-y-2 text-ink/90 font-serif text-base sm:text-lg">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal pl-6 mb-6 space-y-2 text-ink/90 font-serif text-base sm:text-lg">
          {children}
        </ol>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      code: ({ children }) => (
        <code className="px-1.5 py-0.5 rounded bg-muted/15 font-mono text-sm text-ink">
          {children}
        </code>
      ),
      link: ({ children, value }) => {
        const target = value?.blank ? "_blank" : undefined;
        const rel = target === "_blank" ? "noopener noreferrer" : undefined;
        return (
          <a
            href={value?.href}
            target={target}
            rel={rel}
            className="text-brand font-medium underline underline-offset-4 hover:text-brand-strong transition-colors"
          >
            {children}
          </a>
        );
      },
      internalLink: ({ children, value }) => {
        const docType = value?.reference?._type;
        const slug = value?.reference?.slug?.current;
        const href =
          docType === "post"
            ? `/berita/${slug}`
            : docType === "event"
            ? `/kegiatan/${slug}`
            : `/${slug}`;

        return (
          <Link
            href={href}
            className="text-brand font-medium underline underline-offset-4 hover:text-brand-strong transition-colors"
          >
            {children}
          </Link>
        );
      },
    },
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) return null;
        const imageUrl = urlForImage(value).width(1200).url();

        return (
          <figure className="my-8 rounded-card overflow-hidden bg-muted/10 border border-border">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={imageUrl}
                alt={value.alt || "Dokumentasi Foto"}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            </div>
            {(value.caption || value.credit) && (
              <figcaption className="p-3 text-xs text-muted bg-surface/70 border-t border-border flex items-center justify-between">
                {value.caption && <span>{value.caption}</span>}
                {value.credit && (
                  <span className="font-medium ml-auto">Foto: {value.credit}</span>
                )}
              </figcaption>
            )}
          </figure>
        );
      },
      youtube: ({ value }) => {
        if (!value?.url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = value.url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;

        if (!videoId) return null;

        return (
          <div className="my-8 rounded-card overflow-hidden border border-border shadow-sm">
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={value.caption || "Video YouTube"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
            {value.caption && (
              <div className="p-2.5 text-xs text-muted bg-surface text-center border-t border-border">
                {value.caption}
              </div>
            )}
          </div>
        );
      },
      callout: ({ value }) => {
        const tone = value?.tone || "info";

        const toneStyles = {
          info: "bg-brand-soft border-brand/30 text-ink",
          warning: "bg-accent/15 border-accent/40 text-ink",
          success: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-ink",
          caution: "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-ink",
        };

        const toneIcons = {
          info: <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />,
          success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          caution: <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
        };

        return (
          <div
            className={clsx(
              "my-6 p-4 sm:p-5 rounded-card border flex items-start gap-3.5 shadow-xs",
              toneStyles[tone as keyof typeof toneStyles]
            )}
          >
            {toneIcons[tone as keyof typeof toneIcons]}
            <div className="min-w-0 flex-1">
              {value.title && (
                <h4 className="font-bold text-base mb-1 text-ink">{value.title}</h4>
              )}
              <p className="text-sm leading-relaxed text-ink/80">{value.text}</p>
            </div>
          </div>
        );
      },
      adSlot: ({ value }) => (
        <AdSlot
          position={value?.position || "inArticle"}
          slotId={value?.slotId}
          publisherId={publisherId}
          adsEnabled={adsEnabled}
        />
      ),
    },
  };
}

export const portableTextComponents = createPortableTextComponents();

export interface PortableTextRendererProps {
  value: any;
  adsEnabled?: boolean;
  injectAfterParagraph?: number;
  inArticleSlotId?: string;
  publisherId?: string;
}

export function PortableTextRenderer({
  value,
  adsEnabled = true,
  injectAfterParagraph = 3,
  inArticleSlotId,
  publisherId,
}: PortableTextRendererProps) {
  if (!value) return null;

  // Automatic AdSlot injection into body blocks if ads are enabled (FR-503)
  const blocksToRender = adsEnabled
    ? injectAdSlotIntoBlocks(value, injectAfterParagraph, inArticleSlotId)
    : value;

  const components = createPortableTextComponents({ adsEnabled, publisherId });

  return <PortableText value={blocksToRender} components={components} />;
}
