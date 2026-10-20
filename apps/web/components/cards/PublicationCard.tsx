import React from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { clsx } from "clsx";

export interface PublicationCardProps {
  title: string;
  year: number;
  summary?: string;
  fileUrl: string;
  fileSize?: string;
  className?: string;
}

export function PublicationCard({
  title,
  year,
  summary,
  fileUrl,
  fileSize = "PDF",
  className,
}: PublicationCardProps) {
  return (
    <div
      className={clsx(
        "group flex flex-col justify-between p-6 bg-surface border border-border rounded-card",
        "shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 motion-reduce:transform-none",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-12 h-12 rounded-control bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <Chip variant="default" size="sm">
            Tahun {year}
          </Chip>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-ink leading-snug line-clamp-2 mb-2 group-hover:text-brand transition-colors">
          {title}
        </h3>

        {summary && (
          <p className="text-xs sm:text-sm text-muted line-clamp-3 leading-relaxed mb-6 font-serif">
            {summary}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">
          {fileSize}
        </span>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-visible:outline-none"
        >
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </Button>
        </a>
      </div>
    </div>
  );
}
