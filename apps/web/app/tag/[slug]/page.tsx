import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { TAG_PAGE_QUERY, TAG_SLUGS_QUERY } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { ChevronRight, Hash } from "lucide-react";

export const revalidate = 3600;

const POSTS_PER_PAGE = 9;

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: TAG_SLUGS_QUERY,
    tags: ["tags"],
  });
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await sanityFetch<{ tag: any; total: number }>({
    query: TAG_PAGE_QUERY,
    params: { slug, start: 0, end: 1 },
    tags: [`tag:${slug}`],
  });

  const tag = data?.tag;
  if (!tag) {
    return { title: "Tag Tidak Ditemukan | Pemuda ICMI Kota Bekasi" };
  }

  const total = data.total || 0;
  // FR-103 & FR-401: noindex untuk tag dengan kurang dari 3 artikel untuk mencegah thin content
  const robots = total < 3 ? { index: false, follow: true } : { index: true, follow: true };

  return {
    title: `#${tag.title} | Topik Berita Pemuda ICMI Kota Bekasi`,
    description: `Kumpulan artikel dan berita terkait topik #${tag.title} di portal resmi Pemuda ICMI Kota Bekasi.`,
    robots,
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const data = await sanityFetch<{
    tag: any;
    posts: any[];
    total: number;
  }>({
    query: TAG_PAGE_QUERY,
    params: { slug, start, end },
    tags: [`tag:${slug}`, "posts"],
  });

  if (!data?.tag) {
    notFound();
  }

  const { tag, posts = [], total = 0 } = data;
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
            <li>
              <Link href="/berita" className="hover:text-brand transition-colors">
                Berita
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-ink/30" />
            </li>
            <li className="text-ink font-medium" aria-current="page">
              #{tag.title}
            </li>
          </ol>
        </nav>

        {/* Tag Header */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-[#14201B] flex items-center justify-center font-bold">
              <Hash className="w-5 h-5 text-brand" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-brand">
                Topik / Tag
              </span>
              <h1 className="font-heading font-bold text-2xl md:text-4xl text-ink">
                #{tag.title}
              </h1>
            </div>
          </div>
          <div className="mt-4 text-xs text-ink/50 font-medium">
            Ditemukan {total} artikel dengan tagar ini
          </div>
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
              basePath={`/tag/${slug}`}
            />
          </div>
        ) : (
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-card">
            <p className="text-ink/60 text-base">
              Belum ada artikel yang ditandai dengan topik <strong className="text-ink">#{tag.title}</strong>.
            </p>
            <Link
              href="/berita"
              className="inline-flex items-center justify-center mt-4 px-5 py-2.5 rounded-control text-sm font-semibold bg-brand text-white hover:bg-brand-strong transition-colors"
            >
              Jelajahi Berita Lainnya
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
