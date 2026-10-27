import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { EventCard } from "@/components/cards/EventCard";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { sanityFetch } from "@/lib/sanity/fetch";
import { HOME_PAGE_QUERY } from "@/lib/sanity/queries";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebSiteJsonLd, buildOrganizationJsonLd } from "@/lib/seo/jsonld";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ArrowRight, Sparkles, Mail, Calendar, Compass } from "lucide-react";

export const revalidate = 3600; // ISR 1 hour

export default async function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pemudaicmi-kotabekasi.org";
  let homeData: any = null;

  try {
    homeData = await sanityFetch({
      query: HOME_PAGE_QUERY,
      tags: ["posts", "categories", "events"],
    });
  } catch (error) {
    console.error("Failed to fetch Sanity home page data:", error);
  }

  const hero = homeData?.hero;
  const secondaryHero = homeData?.secondaryHero || [];
  const latestPosts = homeData?.latestPosts || [];
  const categories = homeData?.categories || [];
  const events = homeData?.events || [];

  const websiteJsonLd = buildWebSiteJsonLd(siteUrl);
  const orgJsonLd = buildOrganizationJsonLd(siteUrl);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={orgJsonLd} />
      <Header />

      <main className="flex-1 pb-16">
        {/* 1. HERO SECTION (FR-101 & A10) */}
        <section className="pt-6 sm:pt-8 pb-10">
          <Container>
            {hero ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                {/* 1 Artikel Utama: 8 Kolom Desktop (2/3 lebar) */}
                <div className="lg:col-span-8 flex flex-col">
                  <ArticleCard
                    variant="large"
                    title={hero.title}
                    slug={hero.slug}
                    excerpt={hero.excerpt}
                    coverImage={hero.coverImage}
                    category={hero.category}
                    author={hero.author}
                    publishedAt={hero.publishedAt}
                    className="h-full"
                  />
                </div>

                {/* 3 Artikel Sekunder: 4 Kolom Desktop */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      Warta Pilihan
                    </span>
                    <Link
                      href="/berita"
                      className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                    >
                      <span>Semua</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="flex flex-col gap-4 flex-1 justify-around">
                    {secondaryHero.map((post: any) => (
                      <ArticleCard
                        key={post._id}
                        variant="compact"
                        title={post.title}
                        slug={post.slug}
                        coverImage={post.coverImage}
                        category={post.category}
                        publishedAt={post.publishedAt}
                        className="bg-surface border border-border"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-surface border border-border rounded-card">
                <Compass className="w-12 h-12 text-brand mx-auto mb-3" />
                <h2 className="text-xl font-bold text-ink">Memuat Konten Berita...</h2>
                <p className="text-sm text-muted mt-1">
                  Konten editorial akan segera tampil dari dataset Sanity CMS.
                </p>
              </div>
            )}
          </Container>
        </section>

        {/* 2. CHIP KATEGORI (A10) */}
        {categories.length > 0 && (
          <section className="py-4 border-y border-border bg-surface/50">
            <Container>
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted shrink-0 mr-1">
                  Topik:
                </span>
                {categories.map((cat: any) => (
                  <Link
                    key={cat._id}
                    href={`/kategori/${cat.slug}`}
                    className="shrink-0 focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4 focus-visible:text-brand"
                  >
                    <Chip variant="default" size="md" className="hover:bg-brand-soft hover:text-brand">
                      {cat.title}
                    </Chip>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* 3. BERITA TERBARU (3 Kolom Grid - FR-101) */}
        <section className="py-12">
          <Container>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-border">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  Berita Terkini
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Kabar, opini, dan agenda cendekiawan muda Kota Bekasi.
                </p>
              </div>

              <Link href="/berita">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <span>Lihat Indeks Berita</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {latestPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestPosts.map((post: any) => (
                  <ArticleCard
                    key={post._id}
                    variant="standard"
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    coverImage={post.coverImage}
                    category={post.category}
                    author={post.author}
                    publishedAt={post.publishedAt}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted text-sm">
                Belum ada artikel berita tambahan saat ini.
              </div>
            )}
          </Container>
        </section>

        {/* 4. AGENDA KEGIATAN MENDATANG (FR-101 & FR-701) */}
        {events.length > 0 && (
          <section className="py-10 bg-surface border-y border-border">
            <Container>
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-control bg-brand-soft text-brand flex items-center justify-center shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-ink tracking-tight">
                      Agenda & Kegiatan
                    </h2>
                    <p className="text-xs sm:text-sm text-muted">
                      Partisipasi dan kegiatan kepemudaan yang akan datang di Kota Bekasi.
                    </p>
                  </div>
                </div>

                <Link href="/kegiatan">
                  <Button variant="secondary" size="sm" className="gap-1.5 hidden sm:inline-flex">
                    <span>Semua Agenda</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event: any) => (
                  <EventCard
                    key={event._id}
                    title={event.title}
                    slug={event.slug}
                    startDate={event.startDate}
                    endDate={event.endDate}
                    location={event.location}
                    registrationOpen={event.registrationOpen}
                  />
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* 5. BLOK BULETIN / NEWSLETTER (FR-101 & FR-601) */}
        <section className="pt-14 pb-8">
          <Container>
            <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-strong text-white rounded-card p-8 sm:p-12 shadow-card">
              <div className="max-w-2xl relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-accent text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-xs">
                  <Mail className="w-3.5 h-3.5" />
                  Buletin Cendekia Muda
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                  Dapatkan Pembaruan Warta & Kajian Langsung di Kotak Masuk Anda
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 font-serif">
                  Bergabunglah dengan ratusan pemuda cendekia Kota Bekasi. Dapatkan intisari kegiatan, rilis riset, dan opini terkurasi setiap pekan.
                </p>

                <NewsletterForm source="homepage_banner" variant="banner" />
              </div>

              {/* Decorative Geometric Motifs (A10) */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute right-24 top-0 -translate-y-8 w-48 h-48 rounded-full bg-accent/10 pointer-events-none" />
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
