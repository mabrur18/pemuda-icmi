import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { sanityFetch } from "@/lib/sanity/fetch";
import { EVENT_PAGE_QUERY, EVENT_SLUGS_QUERY } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";
import { Container } from "@/components/ui/Container";
import { PortableTextRenderer } from "@/components/sanity/PortableTextRenderer";

export const revalidate = 60;

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: EVENT_SLUGS_QUERY,
    tags: ["events"],
  }).catch(() => []);
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await sanityFetch<any>({
    query: EVENT_PAGE_QUERY,
    params: { slug },
    tags: [`event:${slug}`],
  }).catch(() => null);

  if (!event) return { title: "Kegiatan Tidak Ditemukan | Pemuda ICMI Kota Bekasi" };

  return {
    title: event.seo?.metaTitle || `${event.title} | Pemuda ICMI Kota Bekasi`,
    description:
      event.seo?.metaDescription ||
      `${event.title} — ${event.location}. Agenda Pemuda ICMI Kota Bekasi.`,
    alternates: { canonical: `/kegiatan/${slug}` },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await sanityFetch<any>({
    query: EVENT_PAGE_QUERY,
    params: { slug },
    tags: [`event:${slug}`, "events"],
  });

  if (!event) notFound();

  const fmt = (d: string) =>
    new Date(d).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <article className="py-8 md:py-14 bg-bg min-h-screen">
      <Container>
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs md:text-sm text-ink/60">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">Beranda</Link>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-ink/30" /></li>
              <li>
                <Link href="/kegiatan" className="hover:text-brand transition-colors">Kegiatan</Link>
              </li>
              <li><ChevronRight className="w-3.5 h-3.5 text-ink/30" /></li>
              <li className="text-ink font-medium" aria-current="page">{event.title}</li>
            </ol>
          </nav>

          <h1 className="font-heading font-bold text-3xl md:text-4xl text-ink leading-tight mb-5">
            {event.title}
          </h1>

          <div className="flex flex-col gap-2 text-sm text-muted mb-8">
            <div className="flex items-start gap-2">
              <CalendarDays className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                {fmt(event.startDate)} WIB
                {event.endDate ? ` – ${fmt(event.endDate)} WIB` : ""}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>{event.location}</span>
            </div>
            <span
              className={
                event.registrationOpen
                  ? "text-brand font-semibold"
                  : "text-muted font-semibold"
              }
            >
              {event.registrationOpen ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}
            </span>
          </div>

          {event.coverImage?.asset && (
            <Image
              src={urlForImage(event.coverImage).width(1200).url()}
              alt={event.coverImage.alt || event.title}
              width={1200}
              height={675}
              unoptimized
              className="w-full h-auto rounded-card mb-8"
            />
          )}

          {event.body && (
            <div className="bg-surface border border-border/80 rounded-card p-6 md:p-10 shadow-xs">
              <PortableTextRenderer value={event.body} />
            </div>
          )}

          <div className="mt-8">
            <Link href="/kontak" className="text-brand font-semibold hover:underline">
              Tanya panitia melalui Hubungi Kami →
            </Link>
          </div>
        </div>
      </Container>
    </article>
  );
}
