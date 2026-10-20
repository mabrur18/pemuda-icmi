import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { AUTHOR_PAGE_QUERY, AUTHOR_SLUGS_QUERY } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { ChevronRight, Globe, Twitter, Linkedin, Instagram, User } from "lucide-react";

export const revalidate = 3600;

const POSTS_PER_PAGE = 9;

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: AUTHOR_SLUGS_QUERY,
    tags: ["authors"],
  });
  return (slugs || []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await sanityFetch<{ author: any }>({
    query: AUTHOR_PAGE_QUERY,
    params: { slug, start: 0, end: 1 },
    tags: [`author:${slug}`],
  });

  const author = data?.author;
  if (!author) {
    return { title: "Penulis Tidak Ditemukan | Pemuda ICMI Kota Bekasi" };
  }

  return {
    title: `${author.name} | Profil Penulis Pemuda ICMI Kota Bekasi`,
    description:
      author.bio ||
      `Profil dan kumpulan tulisan artikel oleh ${author.name} di portal Pemuda ICMI Kota Bekasi.`,
  };
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const data = await sanityFetch<{
    author: any;
    posts: any[];
    total: number;
  }>({
    query: AUTHOR_PAGE_QUERY,
    params: { slug, start, end },
    tags: [`author:${slug}`, "posts"],
  });

  if (!data?.author) {
    notFound();
  }

  const { author, posts = [], total = 0 } = data;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const photoUrl = author.photo ? urlForImage(author.photo)?.width(240).height(240).url() : null;

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
              {author.name}
            </li>
          </ol>
        </nav>

        {/* Author Bio Header Card */}
        <div className="bg-surface border border-border rounded-card p-6 md:p-10 mb-12 shadow-xs">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Author Photo */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-brand-soft shrink-0 border-4 border-background shadow-sm">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Author Details */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-soft text-brand mb-2">
                {author.role || "Kontributor Cendekia"}
              </span>
              <h1 className="font-heading font-bold text-2xl md:text-3xl text-ink mb-3">
                {author.name}
              </h1>

              {author.bio && (
                <p className="text-ink/80 text-sm md:text-base leading-relaxed max-w-3xl mb-6">
                  {author.bio}
                </p>
              )}

              {/* Social Media Links */}
              {author.social && (
                <div className="flex items-center justify-center md:justify-start gap-3 text-ink/60">
                  {author.social.twitter && (
                    <a
                      href={`https://x.com/${author.social.twitter.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-brand-soft hover:text-brand transition-colors"
                      aria-label="Akun X / Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {author.social.linkedin && (
                    <a
                      href={author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-brand-soft hover:text-brand transition-colors"
                      aria-label="Profil LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {author.social.instagram && (
                    <a
                      href={`https://instagram.com/${author.social.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-brand-soft hover:text-brand transition-colors"
                      aria-label="Profil Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {author.social.website && (
                    <a
                      href={author.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-brand-soft hover:text-brand transition-colors"
                      aria-label="Situs Web Pribadi"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Author Posts Section */}
        <div className="mb-6">
          <h2 className="font-heading font-bold text-xl md:text-2xl text-ink mb-1">
            Artikel yang Ditulis
          </h2>
          <p className="text-xs md:text-sm text-ink/60">
            Total {total} publikasi tulisan
          </p>
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
                  author={{ name: author.name, photo: author.photo }}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/penulis/${slug}`}
            />
          </div>
        ) : (
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-card">
            <p className="text-ink/60 text-base">
              Penulis ini belum mempublikasikan artikel saat ini.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
