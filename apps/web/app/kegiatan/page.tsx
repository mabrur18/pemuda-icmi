import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { sanityFetch } from "@/lib/sanity/fetch";
import { EVENTS_INDEX_QUERY } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { EventCard } from "@/components/cards/EventCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Agenda & Kegiatan",
  description:
    "Agenda dan kegiatan Pemuda ICMI Kota Bekasi: kaderisasi, kajian, pelatihan, dan kolaborasi kepemudaan.",
  alternates: { canonical: "/kegiatan" },
};

interface EventItem {
  _id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate?: string;
  location: string;
  registrationOpen?: boolean;
}

export default async function KegiatanPage() {
  const events = (await sanityFetch<EventItem[]>({
    query: EVENTS_INDEX_QUERY,
    tags: ["events"],
  }).catch(() => [])) || [];

  const now = Date.now();
  const isPast = (e: EventItem) => new Date(e.endDate || e.startDate).getTime() < now;
  const upcoming = events.filter((e) => !isPast(e)).reverse();
  const past = events.filter(isPast);

  const renderList = (items: EventItem[], completed: boolean) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map((e) => (
        <EventCard
          key={e._id}
          title={e.title}
          slug={e.slug}
          startDate={e.startDate}
          endDate={e.endDate}
          location={e.location}
          registrationOpen={e.registrationOpen}
          isCompleted={completed}
        />
      ))}
    </div>
  );

  return (
    <div className="py-10 sm:py-14 bg-bg min-h-screen">
      <Container>
        <div className="max-w-3xl mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-wider mb-3">
            <CalendarDays className="w-3.5 h-3.5" />
            Agenda Organisasi
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
            Agenda &amp; Kegiatan
          </h1>
          <p className="text-muted text-base sm:text-lg">
            Partisipasi dan kegiatan kepemudaan Pemuda ICMI Kota Bekasi.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-card">
            <p className="text-muted">Belum ada agenda kegiatan yang dipublikasikan.</p>
            <Link href="/berita" className="inline-block mt-4 text-brand font-semibold hover:underline">
              Lihat Berita
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {upcoming.length > 0 && (
              <section aria-labelledby="agenda-mendatang">
                <h2 id="agenda-mendatang" className="text-xl font-bold text-ink mb-5">
                  Agenda Mendatang
                </h2>
                {renderList(upcoming, false)}
              </section>
            )}
            {past.length > 0 && (
              <section aria-labelledby="agenda-selesai">
                <h2 id="agenda-selesai" className="text-xl font-bold text-ink mb-5">
                  Kegiatan Terlaksana
                </h2>
                {renderList(past, true)}
              </section>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
