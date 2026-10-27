import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Twitter, Globe } from "lucide-react";
import { clsx } from "clsx";

export interface AuthorCardProps {
  name: string;
  slug: string;
  role?: string;
  bio?: string;
  photoUrl?: string;
  social?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  className?: string;
}

export function AuthorCard({
  name,
  slug,
  role,
  bio,
  photoUrl,
  social,
  className,
}: AuthorCardProps) {
  const defaultPhoto =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  return (
    <div
      className={clsx(
        "group flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 bg-surface border border-border rounded-card",
        "shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 motion-reduce:transform-none text-center sm:text-left",
        className
      )}
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full overflow-hidden border-2 border-brand/20 shadow-sm">
        <Image
          src={photoUrl || defaultPhoto}
          alt={name}
          fill
          sizes="96px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <h3 className="text-lg font-bold text-ink leading-tight group-hover:text-brand transition-colors">
          <Link href={`/penulis/${slug}`} className="focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4 focus-visible:text-brand">
            {name}
          </Link>
        </h3>

        {role && (
          <span className="text-xs font-semibold text-brand tracking-wide uppercase mt-1 mb-2.5">
            {role}
          </span>
        )}

        {bio && (
          <p className="text-xs sm:text-sm text-muted line-clamp-3 leading-relaxed mb-4">
            {bio}
          </p>
        )}

        {social && (
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 border-t border-border/70">
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-control hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-control hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-control hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {social.website && (
              <a
                href={social.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-control hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="Website"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
