import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { STATIC_PAGE_QUERY, PAGE_SLUGS_QUERY } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { PortableTextRenderer } from "@/components/sanity/PortableTextRenderer";
import { ChevronRight, Calendar, BookmarkCheck } from "lucide-react";

export const revalidate = 3600;

interface StaticPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: PAGE_SLUGS_QUERY,
    tags: ["pages"],
  });
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await sanityFetch<any>({
    query: STATIC_PAGE_QUERY,
    params: { slug },
    tags: [`page:${slug}`],
  });

  if (!page) {
    return { title: "Halaman Tidak Ditemukan | Pemuda ICMI Kota Bekasi" };
  }

  return {
    title: page.seo?.metaTitle || `${page.title} | Pemuda ICMI Kota Bekasi`,
    description:
      page.seo?.metaDescription ||
      `Halaman resmi ${page.title} Majelis Pengurus Daerah Pemuda ICMI Kota Bekasi.`,
  };
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;
  const page = await sanityFetch<any>({
    query: STATIC_PAGE_QUERY,
    params: { slug },
    tags: [`page:${slug}`],
  });

  if (!page) {
    notFound();
  }

  const updatedDate = page._updatedAt
    ? new Date(page._updatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="py-8 md:py-14 bg-background min-h-screen">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs md:text-sm text-ink/60">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-ink/30" />
              </li>
              <li className="text-ink font-medium" aria-current="page">
                {page.title}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="border-b border-border pb-8 mb-10">
            <div className="flex items-center gap-2 text-brand text-xs font-semibold uppercase tracking-wider mb-3">
              <BookmarkCheck className="w-4 h-4" />
              <span>Halaman Resmi Organisasi</span>
            </div>
            <h1 className="font-heading font-bold text-3xl md:text-5xl text-ink leading-tight mb-4">
              {page.title}
            </h1>
            {updatedDate && (
              <div className="flex items-center gap-1.5 text-xs text-ink/50">
                <Calendar className="w-3.5 h-3.5" />
                <span>Terakhir diperbarui: {updatedDate}</span>
              </div>
            )}
          </header>

          {/* Body Content */}
          <div className="bg-surface border border-border/80 rounded-card p-6 md:p-12 shadow-xs">
            {page.body ? (
              <PortableTextRenderer value={page.body} />
            ) : (
              <p className="text-ink/60 italic">Konten halaman sedang dalam penyiapan.</p>
            )}
          </div>
        </div>
      </Container>
    </article>
  );
}
