import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { SITEMAP_DATA_QUERY } from "@/lib/sanity/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pemudaicmi-kotabekasi.org";

  const data = await sanityFetch<{
    posts: Array<{ slug: string; _updatedAt?: string; publishedAt?: string }>;
    pages: Array<{ slug: string; _updatedAt?: string }>;
    categories: Array<{ slug: string; _updatedAt?: string }>;
    tags: Array<{ slug: string; _updatedAt?: string; postCount: number }>;
    authors: Array<{ slug: string; _updatedAt?: string }>;
  }>({
    query: SITEMAP_DATA_QUERY,
    tags: ["posts", "pages", "categories", "tags", "authors"],
  });

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/berita`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/kegiatan`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/publikasi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Articles
  if (data?.posts) {
    for (const post of data.posts) {
      routes.push({
        url: `${siteUrl}/berita/${post.slug}`,
        lastModified: post._updatedAt ? new Date(post._updatedAt) : new Date(post.publishedAt || Date.now()),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  // Static Pages (Tentang, Susunan Pengurus, Kebijakan Privasi)
  if (data?.pages) {
    for (const page of data.pages) {
      routes.push({
        url: `${siteUrl}/${page.slug}`,
        lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Categories
  if (data?.categories) {
    for (const cat of data.categories) {
      routes.push({
        url: `${siteUrl}/kategori/${cat.slug}`,
        lastModified: cat._updatedAt ? new Date(cat._updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Tags (Only tags with >= 3 articles per FR-401 rules)
  if (data?.tags) {
    for (const tag of data.tags) {
      if (tag.postCount >= 3) {
        routes.push({
          url: `${siteUrl}/tag/${tag.slug}`,
          lastModified: tag._updatedAt ? new Date(tag._updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  }

  // Authors
  if (data?.authors) {
    for (const author of data.authors) {
      routes.push({
        url: `${siteUrl}/penulis/${author.slug}`,
        lastModified: author._updatedAt ? new Date(author._updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return routes;
}
