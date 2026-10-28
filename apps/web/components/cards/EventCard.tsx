import React from "react";
import Link from "next/link";
import { Chip } from "../ui/Chip";
import { Button } from "../ui/Button";
import { MapPin, Clock } from "lucide-react";
import { clsx } from "clsx";

export interface EventCardProps {
  title: string;
  slug: string;
  startDate: string;
  endDate?: string;
  location: string;
  registrationOpen?: boolean;
  isCompleted?: boolean;
  isFull?: boolean;
  className?: string;
}

export function EventCard({
  title,
  slug,
  startDate,
  location,
  registrationOpen = true,
  isCompleted = false,
  isFull = false,
  className,
}: EventCardProps) {
  const dateObj = new Date(startDate);
  const monthStr = dateObj.toLocaleDateString("id-ID", { month: "short" });
  const dayStr = dateObj.toLocaleDateString("id-ID", { day: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Chip variant="default" size="sm">Selesai</Chip>;
    }
    if (isFull) {
      return <Chip variant="warning" size="sm">Kuota Penuh</Chip>;
    }
    if (registrationOpen) {
      return <Chip variant="success" size="sm">Pendaftaran Buka</Chip>;
    }
    return <Chip variant="danger" size="sm">Ditutup</Chip>;
  };

  return (
    <div
      className={clsx(
        "group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-5 sm:p-6 bg-surface border border-border rounded-card",
        "shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 motion-reduce:transform-none",
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
        {/* Calendar Date Block */}
        <div className="w-16 h-16 shrink-0 rounded-control bg-brand-soft border border-brand/20 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="text-xs font-bold text-brand uppercase tracking-wider">
            {monthStr}
          </span>
          <span className="text-2xl font-black text-ink leading-none mt-0.5">
            {dayStr}
          </span>
        </div>

        {/* Event Details */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {getStatusBadge()}
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeStr} WIB
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-ink leading-snug line-clamp-2 group-hover:text-brand transition-colors">
            <Link href={`/kegiatan/${slug}`} className="focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4 focus-visible:text-brand">
              {title}
            </Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
        <Link href={`/kegiatan/${slug}`} className="block w-full sm:w-auto">
          <Button
            variant={registrationOpen && !isFull && !isCompleted ? "primary" : "secondary"}
            size="md"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            {registrationOpen && !isFull && !isCompleted ? "Daftar Hadir" : "Lihat Detail"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
