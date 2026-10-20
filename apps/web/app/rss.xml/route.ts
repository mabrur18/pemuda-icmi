import { sanityFetch } from "@/lib/sanity/fetch";
import { RSS_POSTS_QUERY } from "@/lib/sanity/queries";

export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pemudaicmi-kotabekasi.org";

  const posts =
    (await sanityFetch<any[]>({
      query: RSS_POSTS_QUERY,
      tags: ["posts"],
    })) || [];

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${siteUrl}/berita/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();
      const title = escapeXml(post.title || "Tanpa Judul");
      const description = escapeXml(post.excerpt || "");
      const author = escapeXml(post.author?.name || "Redaksi Pemuda ICMI");
      const category = post.category?.title ? `<category>${escapeXml(post.category.title)}</category>` : "";

      return `    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>${author}</author>
      ${category}
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pemuda ICMI Kota Bekasi - Berita &amp; Gagasan Cendekia</title>
    <link>${siteUrl}</link>
    <description>Portal resmi Majelis Pengurus Daerah Pemuda ICMI Kota Bekasi menyajikan berita kegiatan, gagasan kebangsaan, dan literasi cendekia.</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
