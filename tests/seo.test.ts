import { describe, it, expect } from "vitest";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "../apps/web/lib/seo/jsonld";

describe("Tahap 5: SEO & Structured Data (JSON-LD) Tests", () => {
  const siteUrl = "https://pemudaicmi-kotabekasi.org";

  describe("Organization JSON-LD", () => {
    it("should build valid Organization schema for Pemuda ICMI Kota Bekasi", () => {
      const org = buildOrganizationJsonLd(siteUrl);

      expect(org["@context"]).toBe("https://schema.org");
      expect(org["@type"]).toBe("Organization");
      expect(org.name).toBe("Pemuda ICMI Kota Bekasi");
      expect(org.url).toBe(siteUrl);
      expect(org.logo).toContain("/api/og");
      expect(org.address?.addressLocality).toBe("Kota Bekasi");
      expect(org.address?.addressCountry).toBe("ID");
      expect(org.sameAs).toBeInstanceOf(Array);
      expect(org.sameAs?.length).toBeGreaterThan(0);
    });
  });

  describe("WebSite JSON-LD", () => {
    it("should build valid WebSite schema with internal SearchAction", () => {
      const webSite = buildWebSiteJsonLd(siteUrl);

      expect(webSite["@context"]).toBe("https://schema.org");
      expect(webSite["@type"]).toBe("WebSite");
      expect(webSite.name).toBe("Pemuda ICMI Kota Bekasi");
      expect(webSite.url).toBe(siteUrl);
      expect(webSite.potentialAction["@type"]).toBe("SearchAction");
      expect(webSite.potentialAction.target.urlTemplate).toBe(`${siteUrl}/cari?q={search_term_string}`);
    });
  });

  describe("NewsArticle JSON-LD", () => {
    it("should build valid NewsArticle schema with full details", () => {
      const article = buildArticleJsonLd({
        siteUrl,
        title: "Pelantikan Pengurus Daerah Pemuda ICMI Bekasi",
        slug: "pelantikan-pengurus-daerah",
        excerpt: "Pelantikan pengurus berjalan lancar dan khidmat.",
        coverImageUrl: "https://cdn.sanity.io/images/demo.jpg",
        publishedAt: "2026-10-20T10:00:00Z",
        updatedAt: "2026-10-20T12:00:00Z",
        authorName: "Dr. Ahmad Fauzi",
        authorSlug: "ahmad-fauzi",
        categoryTitle: "Berita Utama",
        tags: ["Pelantikan", "Kota Bekasi"],
      });

      expect(article["@context"]).toBe("https://schema.org");
      expect(article["@type"]).toBe("NewsArticle");
      expect(article.headline).toBe("Pelantikan Pengurus Daerah Pemuda ICMI Bekasi");
      expect(article.mainEntityOfPage["@id"]).toBe(`${siteUrl}/berita/pelantikan-pengurus-daerah`);
      expect(article.image).toEqual(["https://cdn.sanity.io/images/demo.jpg"]);
      expect(article.datePublished).toBe("2026-10-20T10:00:00.000Z");
      expect(article.dateModified).toBe("2026-10-20T12:00:00.000Z");
      expect(article.author["@type"]).toBe("Person");
      expect(article.author.name).toBe("Dr. Ahmad Fauzi");
      expect(article.author.url).toBe(`${siteUrl}/penulis/ahmad-fauzi`);
      expect(article.publisher.name).toBe("Pemuda ICMI Kota Bekasi");
      expect(article.articleSection).toBe("Berita Utama");
      expect(article.keywords).toEqual(["Pelantikan", "Kota Bekasi"]);
    });

    it("should fallback to dynamic OG image when coverImageUrl is not provided", () => {
      const article = buildArticleJsonLd({
        siteUrl,
        title: "Gagasan Intelektual Madani",
        slug: "gagasan-intelektual",
      });

      expect(article.image?.[0]).toContain("/api/og?title=");
      expect(article.author.name).toBe("Redaksi Pemuda ICMI");
    });
  });

  describe("BreadcrumbList JSON-LD", () => {
    it("should build valid BreadcrumbList schema with sequential positions", () => {
      const items = [
        { name: "Beranda", url: `${siteUrl}/` },
        { name: "Berita", url: `${siteUrl}/berita` },
        { name: "Kategori Utama", url: `${siteUrl}/kategori/berita-utama` },
      ];

      const breadcrumbs = buildBreadcrumbJsonLd(items);

      expect(breadcrumbs["@context"]).toBe("https://schema.org");
      expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
      expect(breadcrumbs.itemListElement).toHaveLength(3);

      expect(breadcrumbs.itemListElement[0]).toEqual({
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: `${siteUrl}/`,
      });

      expect(breadcrumbs.itemListElement[1]).toEqual({
        "@type": "ListItem",
        position: 2,
        name: "Berita",
        item: `${siteUrl}/berita`,
      });

      expect(breadcrumbs.itemListElement[2]).toEqual({
        "@type": "ListItem",
        position: 3,
        name: "Kategori Utama",
        item: `${siteUrl}/kategori/berita-utama`,
      });
    });
  });
});
