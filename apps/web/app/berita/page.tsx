import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POSTS_INDEX_QUERY } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { ChevronRight, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Indeks Berita & Artikel | Pemuda ICMI Kota Bekasi",
  description:
    "Arsip lengkap berita terkini, gagasan cendekia, liputan kegiatan, dan rilis resmi Majelis Pengurus Daerah Pemuda ICMI Kota Bekasi.",
};

export const revalidate = 3600;

const POSTS_PER_PAGE = 9;

interface BeritaIndexPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BeritaIndexPage({ searchParams }: BeritaIndexPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const data = await sanityFetch<{
    posts: any[];
    total: number;
    categories: any[];
  }>({
    query: POSTS_INDEX_QUERY,
    params: { start, end },
    tags: ["posts"],
  });

  const posts = data?.posts || [];
  const total = data?.total || 0;
  const categories = data?.categories || [];
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="py-8 md:py-12 bg-background min-h-screen">
      <Container>
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
              Berita
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <Newspaper className="w-5 h-5" />
            </div>
            <h1 className="font-heading font-bold text-2xl md:text-4xl text-ink">
              Indeks Berita & Artikel
            </h1>
          </div>
          <p className="text-ink/70 text-sm md:text-base max-w-2xl leading-relaxed">
            Menyajikan dokumentasi kegiatan, kajian ilmiah, serta pandangan kritis cendekiawan muda
            muslim dalam mengawal pembangunan di Kota Patriot.
          </p>

          {/* Category Chips Bar */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-border/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/50 mr-2">
                Kategori:
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand text-white shadow-xs">
                Semua
              </span>
              {categories.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/kategori/${cat.slug}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-surface text-ink/80 hover:border-brand/40 hover:bg-brand-soft hover:text-brand transition-colors"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post: any) => (
                <ArticleCard
                  key={post._id}
                  variant="standard"
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  coverImage={post.coverImage}
                  publishedAt={post.publishedAt}
                  category={post.category}
                  author={post.author}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/berita"
            />
          </div>
        ) : (
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-card">
            <p className="text-ink/60 text-base">Belum ada artikel yang diterbitkan saat ini.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
