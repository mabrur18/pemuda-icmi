import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Chip } from "@/components/ui/Chip";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { AuthorCard } from "@/components/cards/AuthorCard";
import { PortableTextRenderer } from "@/components/sanity/PortableTextRenderer";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ShareButtons } from "@/components/article/ShareButtons";
import { sanityFetch } from "@/lib/sanity/fetch";
import { POST_PAGE_QUERY, POST_SLUGS_QUERY } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";
import { ChevronRight, Clock, Calendar, Sparkles } from "lucide-react";

export const revalidate = 3600; // ISR 1 hour

// 1. generateStaticParams - PRD B5
export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[]>({
      query: POST_SLUGS_QUERY,
      tags: ["posts"],
    });

    return (slugs || []).map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error("Failed to fetch post slugs for static params:", error);
    return [];
  }
}

// 2. generateMetadata - PRD A8 & FR-401
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch<any>({
    query: POST_PAGE_QUERY,
    params: { slug },
    tags: [`post:${slug}`],
  });

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan",
    };
  }

  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pemudaicmi-kotabekasi.org";
  const canonicalUrl = post.seo?.canonicalUrl || `${siteUrl}/berita/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags?.map((t: any) => t.title),
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// 3. Page Component - PRD FR-102 & A10
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await sanityFetch<any>({
    query: POST_PAGE_QUERY,
    params: { slug },
    tags: [`post:${slug}`],
  });

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const currentUrl = `${siteUrl}/berita/${slug}`;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const coverImageUrl = post.coverImage?.asset?._ref
    ? urlForImage(post.coverImage).width(1200).url()
    : "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80";

  const primaryCategory = post.categories?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Navigation (FR-102 & A8) */}
        <div className="border-b border-border/60 bg-surface/50 py-3">
          <Container>
            <nav className="flex items-center gap-1.5 text-xs text-muted">
              <Link href="/" className="hover:text-brand transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/berita" className="hover:text-brand transition-colors">
                Berita
              </Link>
              {primaryCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <Link
                    href={`/kategori/${primaryCategory.slug}`}
                    className="hover:text-brand transition-colors"
                  >
                    {primaryCategory.title}
                  </Link>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px] text-ink font-medium">
                {post.title}
              </span>
            </nav>
          </Container>
        </div>

        {/* Article Header & Meta */}
        <Container className="pt-8 sm:pt-10">
          <div className="max-w-3xl mx-auto">
            {primaryCategory && (
              <div className="mb-3">
                <Link href={`/kategori/${primaryCategory.slug}`}>
                  <Chip variant="accent" size="md">
                    {primaryCategory.title}
                  </Chip>
                </Link>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-ink leading-tight sm:leading-[1.2] mb-5">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-base sm:text-lg text-muted leading-relaxed mb-6 font-serif">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border text-xs sm:text-sm text-muted">
              <div className="flex items-center gap-3">
                {post.author && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-xs">
                      {post.author.name[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-ink block">{post.author.name}</span>
                      {post.author.role && (
                        <span className="text-[11px] text-muted block">{post.author.role}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs">
                {formattedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                    {formattedDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand" />
                  3 mnt baca
                </span>
              </div>
            </div>
          </div>
        </Container>

        {/* Cover Image */}
        <Container className="pt-6 pb-10">
          <div className="max-w-4xl mx-auto rounded-card overflow-hidden bg-muted/10 border border-border shadow-card">
            <div className="relative aspect-video sm:aspect-[21/10] w-full">
              <Image
                src={coverImageUrl}
                alt={post.coverImage?.alt || post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1000px"
                className="object-cover"
              />
            </div>
            {post.coverImage?.caption && (
              <div className="p-3 text-xs text-muted bg-surface/80 border-t border-border flex items-center justify-between">
                <span>{post.coverImage.caption}</span>
                {post.coverImage.credit && (
                  <span className="font-medium ml-auto">Kredit: {post.coverImage.credit}</span>
                )}
              </div>
            )}
          </div>
        </Container>

        {/* 3-Column Content Layout (A10) */}
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Sticky Left Sidebar: Table of Contents & Share Buttons (Desktop 3 Kolom) */}
            <aside className="lg:col-span-3 sticky top-24 hidden lg:flex flex-col gap-6">
              <TableOfContents body={post.body} />

              <div className="p-4 bg-surface border border-border rounded-card">
                <ShareButtons title={post.title} url={currentUrl} />
              </div>
            </aside>

            {/* Center: Reading Column 720 px (Desktop 6 Kolom) */}
            <article className="lg:col-span-6 max-w-[720px] mx-auto w-full">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-6">
                <TableOfContents body={post.body} />
              </div>

              {/* Portable Text Content */}
              <div className="article-body font-serif text-ink">
                <PortableTextRenderer value={post.body} />
              </div>

              {/* Tags Section */}
              {post.tags && post.tags.length > 0 && (
                <div className="pt-6 mt-8 border-t border-border flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-1">
                    Topik:
                  </span>
                  {post.tags.map((tag: any) => (
                    <Link key={tag._id} href={`/tag/${tag.slug}`}>
                      <Chip variant="default" size="sm" className="hover:bg-brand-soft hover:text-brand">
                        #{tag.title}
                      </Chip>
                    </Link>
                  ))}
                </div>
              )}

              {/* Share Bar di Bawah Artikel */}
              <div className="my-8 p-4 bg-surface border border-border rounded-card">
                <ShareButtons title={post.title} url={currentUrl} />
              </div>

              {/* Author Bio Card */}
              {post.author && (
                <div className="my-10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
                    Tentang Penulis
                  </h3>
                  <AuthorCard
                    name={post.author.name}
                    slug={post.author.slug}
                    role={post.author.role}
                    bio={post.author.bio}
                    social={post.author.social}
                  />
                </div>
              )}
            </article>

            {/* Right Sidebar: Populer & Buletin (Desktop 3 Kolom) */}
            <aside className="lg:col-span-3 sticky top-24 hidden lg:flex flex-col gap-6">
              {/* AdSlot Placeholder */}
              <div className="p-4 rounded-card border-2 border-dashed border-border bg-muted/10 h-[250px] flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase font-bold text-muted">
                  Iklan Bilah Samping (300x250)
                </span>
                <span className="text-[11px] text-muted mt-1">
                  AdSense Sidebar Unit
                </span>
              </div>

              {/* Buletin Mini */}
              <div className="p-5 bg-brand-soft border border-brand/20 rounded-card">
                <div className="flex items-center gap-2 text-brand font-bold text-sm mb-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Buletin Mingguan</span>
                </div>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  Dapatkan warta terbaru dan opini cendekia langsung ke email Anda.
                </p>
                <Link href="/#buletin">
                  <button className="w-full h-9 rounded-control bg-brand text-white text-xs font-semibold hover:bg-brand-strong transition-colors">
                    Daftar Buletin
                  </button>
                </Link>
              </div>
            </aside>
          </div>
        </Container>

        {/* Baca Juga / Related Articles (FR-102) */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <section className="pt-16 border-t border-border mt-16 bg-surface/40">
            <Container>
              <div className="max-w-6xl mx-auto">
                <div className="mb-6 pb-2 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-ink">
                    Baca Artikel Terkait
                  </h2>
                  <Link
                    href="/berita"
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Semua Berita →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {post.relatedPosts.map((related: any) => (
                    <ArticleCard
                      key={related._id}
                      variant="standard"
                      title={related.title}
                      slug={related.slug}
                      excerpt={related.excerpt}
                      coverImage={related.coverImage}
                      category={related.category}
                      author={related.author}
                      publishedAt={related.publishedAt}
                    />
                  ))}
                </div>
              </div>
            </Container>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
