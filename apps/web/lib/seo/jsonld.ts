export interface JsonLdOrganization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  address?: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
}

export interface JsonLdWebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface JsonLdArticle {
  "@context": "https://schema.org";
  "@type": "NewsArticle";
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  headline: string;
  description: string;
  image?: string[];
  datePublished: string;
  dateModified: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
  articleSection?: string;
  keywords?: string[];
}

export interface JsonLdBreadcrumb {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export function buildOrganizationJsonLd(siteUrl: string): JsonLdOrganization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pemuda ICMI Kota Bekasi",
    url: siteUrl,
    logo: `${siteUrl}/api/og?title=Pemuda+ICMI+Kota+Bekasi`,
    description:
      "Majelis Pengurus Daerah Pemuda Ikatan Cendekiawan Muslim se-Indonesia (Pemuda ICMI) Kota Bekasi.",
    sameAs: [
      "https://instagram.com/pemudaicmi_kotabekasi",
      "https://twitter.com/pemudaicmibks",
      "https://youtube.com/@pemudaicmikotabekasi",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kota Bekasi",
      addressRegion: "Jawa Barat",
      addressCountry: "ID",
    },
  };
}

export function buildWebSiteJsonLd(siteUrl: string): JsonLdWebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pemuda ICMI Kota Bekasi",
    url: siteUrl,
    description:
      "Portal resmi Majelis Pengurus Daerah Pemuda Ikatan Cendekiawan Muslim se-Indonesia Kota Bekasi.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/cari?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildArticleJsonLd(params: {
  siteUrl: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  authorSlug?: string;
  categoryTitle?: string;
  tags?: string[];
}): JsonLdArticle {
  const {
    siteUrl,
    title,
    slug,
    excerpt,
    coverImageUrl,
    publishedAt,
    updatedAt,
    authorName,
    authorSlug,
    categoryTitle,
    tags,
  } = params;

  const postUrl = `${siteUrl}/berita/${slug}`;
  const images: string[] = [];
  if (coverImageUrl) {
    images.push(coverImageUrl);
  } else {
    images.push(`${siteUrl}/api/og?title=${encodeURIComponent(title)}`);
  }

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: title,
    description: excerpt || title,
    image: images,
    datePublished: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    dateModified: updatedAt
      ? new Date(updatedAt).toISOString()
      : publishedAt
      ? new Date(publishedAt).toISOString()
      : new Date().toISOString(),
    author: {
      "@type": "Person",
      name: authorName || "Redaksi Pemuda ICMI",
      url: authorSlug ? `${siteUrl}/penulis/${authorSlug}` : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "Pemuda ICMI Kota Bekasi",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/api/og?title=Pemuda+ICMI+Kota+Bekasi`,
      },
    },
    articleSection: categoryTitle,
    keywords: tags,
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): JsonLdBreadcrumb {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
