import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { CATEGORY_PAGE_QUERY, CATEGORY_SLUGS_QUERY } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { ChevronRight, FolderOpen } from "lucide-react";

export const revalidate = 3600;

const POSTS_PER_PAGE = 9;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: CATEGORY_SLUGS_QUERY,
    tags: ["categories"],
  });
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await sanityFetch<{ category: any }>({
    query: CATEGORY_PAGE_QUERY,
    params: { slug, start: 0, end: 1 },
    tags: [`category:${slug}`],
  });

  const cat = data?.category;
  if (!cat) {
    return { title: "Kategori Tidak Ditemukan | Pemuda ICMI Kota Bekasi" };
  }

  return {
    title: cat.seo?.metaTitle || `${cat.title} | Kategori Berita Pemuda ICMI Kota Bekasi`,
    description:
      cat.seo?.metaDescription ||
      cat.description ||
      `Kumpulan artikel, rilis berita, dan pandangan cendekia dalam kategori ${cat.title}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const data = await sanityFetch<{
    category: any;
    posts: any[];
    total: number;
  }>({
    query: CATEGORY_PAGE_QUERY,
    params: { slug, start, end },
    tags: [`category:${slug}`, "posts"],
  });

  if (!data?.category) {
    notFound();
  }

  const { category, posts = [], total = 0 } = data;
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
              {category.title}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-brand">
                Kategori Berita
              </span>
              <h1 className="font-heading font-bold text-2xl md:text-4xl text-ink">
                {category.title}
              </h1>
            </div>
          </div>
          {category.description && (
            <p className="text-ink/70 text-sm md:text-base max-w-2xl leading-relaxed mt-2">
              {category.description}
            </p>
          )}
          <div className="mt-4 text-xs text-ink/50 font-medium">
            Menampilkan {posts.length} dari total {total} artikel
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
                  category={{ title: category.title, slug: category.slug }}
                  author={post.author}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/kategori/${slug}`}
            />
          </div>
        ) : (
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-card">
            <p className="text-ink/60 text-base">
              Belum ada artikel dalam kategori <strong className="text-ink">{category.title}</strong> saat ini.
            </p>
            <Link
              href="/berita"
              className="inline-flex items-center justify-center mt-4 px-5 py-2.5 rounded-control text-sm font-semibold bg-brand text-white hover:bg-brand-strong transition-colors"
            >
              Lihat Semua Berita
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
