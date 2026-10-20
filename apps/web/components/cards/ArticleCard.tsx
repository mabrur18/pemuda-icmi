import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Chip } from "../ui/Chip";
import { Clock, User } from "lucide-react";
import { clsx } from "clsx";
import { urlForImage } from "@/lib/sanity/image";

export interface ArticleCardProps {
  variant?: "large" | "standard" | "horizontal" | "compact";
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  category?: {
    title: string;
    slug: string;
  };
  author?: {
    name: string;
    role?: string;
    photoUrl?: string;
    photo?: any;
  };
  publishedAt?: string;
  readingTime?: string;
  className?: string;
}

export function ArticleCard({
  variant = "standard",
  title,
  slug,
  excerpt,
  coverImage,
  category,
  author,
  publishedAt,
  readingTime = "3 mnt baca",
  className,
}: ArticleCardProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : undefined;

  const placeholderImage =
    "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80";

  let imageUrl = placeholderImage;
  if (typeof coverImage === "string") {
    imageUrl = coverImage;
  } else if (coverImage?.url) {
    imageUrl = coverImage.url;
  } else if (coverImage?.asset) {
    imageUrl = urlForImage(coverImage)?.width(800).height(500).url() || placeholderImage;
  }

  const imageAlt = coverImage?.alt || title;

  // 1. Varian Compact (Sidebar / Footer)
  if (variant === "compact") {
    return (
      <article
        className={clsx(
          "group flex items-start gap-3.5 p-2 rounded-control hover:bg-surface transition-all duration-200",
          className
        )}
      >
        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted/10">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          {category && (
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1 line-clamp-1">
              {category.title}
            </span>
          )}
          <h4 className="text-sm font-semibold text-ink leading-snug line-clamp-2 group-hover:text-brand transition-colors">
            <Link href={`/berita/${slug}`} className="focus-visible:outline-none">
              {title}
            </Link>
          </h4>
          <span className="text-[11px] text-muted mt-1.5">{formattedDate}</span>
        </div>
      </article>
    );
  }

  // 2. Varian Horizontal (List View / Tablet)
  if (variant === "horizontal") {
    return (
      <article
        className={clsx(
          "group flex flex-col sm:flex-row gap-5 p-4 sm:p-5 bg-surface border border-border rounded-card",
          "shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 motion-reduce:transform-none",
          className
        )}
      >
        <div className="relative w-full sm:w-60 md:w-72 aspect-video sm:aspect-auto sm:h-auto shrink-0 rounded-control overflow-hidden bg-muted/10">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {category && (
                <Link href={`/kategori/${category.slug}`}>
                  <Chip variant="accent" size="sm">
                    {category.title}
                  </Chip>
                </Link>
              )}
              {readingTime && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readingTime}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-ink leading-tight mb-2.5 group-hover:text-brand transition-colors">
              <Link href={`/berita/${slug}`} className="focus-visible:outline-none">
                {title}
              </Link>
            </h3>

            {excerpt && (
              <p className="text-sm text-muted line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4">
                {excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-brand" />
              <span>{author?.name || "Redaksi"}</span>
            </div>
            <span>{formattedDate}</span>
          </div>
        </div>
      </article>
    );
  }

  // 3. Varian Large (Hero / Featured)
  if (variant === "large") {
    return (
      <article
        className={clsx(
          "group relative flex flex-col bg-surface border border-border rounded-card overflow-hidden",
          "shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 motion-reduce:transform-none",
          className
        )}
      >
        <div className="relative w-full aspect-video sm:aspect-[16/9] lg:aspect-[21/10] overflow-hidden bg-muted/10">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
          {category && (
            <div className="absolute top-4 left-4 z-10">
              <Chip variant="accent" size="md">
                {category.title}
              </Chip>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
          <div>
            <div className="hidden lg:flex items-center gap-3 mb-3">
              {category && (
                <Chip variant="accent" size="sm">
                  {category.title}
                </Chip>
              )}
              {readingTime && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTime}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight mb-3.5 group-hover:text-brand transition-colors">
              <Link href={`/berita/${slug}`} className="focus-visible:outline-none">
                {title}
              </Link>
            </h2>

            {excerpt && (
              <p className="text-sm sm:text-base text-muted line-clamp-3 leading-relaxed mb-6 font-serif">
                {excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-muted pt-4 border-t border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-xs">
                {author?.name ? author.name[0] : "P"}
              </div>
              <div>
                <span className="font-medium text-ink block">{author?.name || "Redaksi Pemuda ICMI"}</span>
                {author?.role && <span className="text-[11px] text-muted">{author.role}</span>}
              </div>
            </div>
            <span>{formattedDate}</span>
          </div>
        </div>
      </article>
    );
  }

  // 4. Varian Standard (Default 3-Column Grid)
  return (
    <article
      className={clsx(
        "group flex flex-col bg-surface border border-border rounded-card overflow-hidden",
        "shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 motion-reduce:transform-none",
        className
      )}
    >
      <div className="relative w-full aspect-video overflow-hidden bg-muted/10">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {category && (
          <div className="absolute top-3 left-3 z-10">
            <Chip variant="accent" size="sm">
              {category.title}
            </Chip>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted mb-2">
            <span>{formattedDate}</span>
            {readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-ink leading-snug line-clamp-2 mb-2 group-hover:text-brand transition-colors">
            <Link href={`/berita/${slug}`} className="focus-visible:outline-none">
              {title}
            </Link>
          </h3>

          {excerpt && (
            <p className="text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed mb-4">
              {excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted pt-3 border-t border-border/70">
          <User className="w-3.5 h-3.5 text-brand" />
          <span className="truncate">{author?.name || "Redaksi"}</span>
        </div>
      </div>
    </article>
  );
}
