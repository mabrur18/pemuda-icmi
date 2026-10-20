import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SEARCH_POSTS_QUERY } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Search, ChevronRight, AlertCircle, Sparkles } from "lucide-react";

// FR-401 & A8: noindex untuk halaman pencarian
export const metadata: Metadata = {
  title: "Pencarian Artikel | Pemuda ICMI Kota Bekasi",
  description: "Cari artikel, berita, dan rilis resmi Pemuda ICMI Kota Bekasi.",
  robots: {
    index: false,
    follow: false,
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const searchTerm = (q || "").trim();

  let posts: any[] = [];
  if (searchTerm.length >= 2) {
    posts =
      (await sanityFetch<any[]>({
        query: SEARCH_POSTS_QUERY,
        params: { term: `*${searchTerm}*` },
      })) || [];
  }

  return (
    <div className="py-8 md:py-14 bg-background min-h-screen">
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
              Pencarian
            </li>
          </ol>
        </nav>

        {/* Search Header & Input Form */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-soft text-brand mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pencarian Cendekia</span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-ink mb-6">
            Cari Berita & Gagasan
          </h1>

          <form action="/cari" method="GET" className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-ink/40 pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={searchTerm}
                placeholder="Ketik kata kunci (misal: pelantikan, pendidikan, ekonomi syariah)..."
                required
                minLength={2}
                className="w-full h-13 pl-12 pr-28 rounded-control border border-border bg-surface text-ink text-sm md:text-base placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 rounded-control bg-brand text-white text-sm font-semibold hover:bg-brand-strong transition-colors min-h-[40px]"
              >
                Cari
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="max-w-4xl mx-auto">
          {searchTerm ? (
            <div>
              <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                <p className="text-sm md:text-base text-ink/70">
                  Hasil pencarian untuk: <strong className="text-ink">&ldquo;{searchTerm}&rdquo;</strong>
                </p>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-soft text-brand">
                  {posts.length} ditemukan
                </span>
              </div>

              {posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post: any) => (
                    <ArticleCard
                      key={post._id}
                      variant="horizontal"
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
              ) : (
                <div className="text-center py-16 bg-surface border border-dashed border-border rounded-card p-8">
                  <AlertCircle className="w-10 h-10 text-ink/30 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-lg text-ink mb-1">
                    Tidak ada hasil yang cocok
                  </h3>
                  <p className="text-sm text-ink/60 max-w-md mx-auto mb-6">
                    Maaf, kami tidak menemukan artikel yang mengandung kata kunci &ldquo;{searchTerm}&rdquo;. Coba gunakan istilah lain atau kata kunci yang lebih umum.
                  </p>
                  <Link
                    href="/berita"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-control text-sm font-semibold bg-brand text-white hover:bg-brand-strong transition-colors"
                  >
                    Buka Arsip Semua Berita
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface/50 border border-border/60 rounded-card p-8">
              <p className="text-ink/60 text-sm md:text-base">
                Masukkan kata kunci pencarian di atas untuk menemukan artikel yang Anda butuhkan.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
