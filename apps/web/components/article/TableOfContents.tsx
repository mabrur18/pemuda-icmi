"use client";

import React, { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { slugifyText } from "../sanity/PortableTextRenderer";
import { clsx } from "clsx";

export interface HeadingItem {
  id: string;
  text: string;
}

export function extractHeadings(body: any[]): HeadingItem[] {
  if (!Array.isArray(body)) return [];

  return body
    .filter((block) => block._type === "block" && block.style === "h2")
    .map((block) => {
      const text = block.children?.map((c: any) => c.text).join("") || "";
      return {
        id: slugifyText(text),
        text,
      };
    })
    .filter((item) => item.text.length > 0);
}

export function TableOfContents({ body }: { body: any[] }) {
  const headings = extractHeadings(body);
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-card p-4 sm:p-5 shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-bold text-sm text-ink group focus-visible:outline-none"
      >
        <span className="flex items-center gap-2">
          <List className="w-4 h-4 text-brand" />
          <span>Daftar Isi Artikel</span>
        </span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-muted transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      <nav
        className={clsx(
          "mt-3 pt-3 border-t border-border flex flex-col gap-2",
          isOpen ? "block" : "hidden sm:block"
        )}
      >
        {headings.map((heading, index) => (
          <a
            key={heading.id + index}
            href={`#${heading.id}`}
            className="text-xs sm:text-sm text-muted hover:text-brand transition-colors line-clamp-1 py-1 pl-2 border-l-2 border-transparent hover:border-brand"
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
