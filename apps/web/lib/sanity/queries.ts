import groq from "groq";

// 1. Site Settings Query
export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    siteName,
    siteTagline,
    logo,
    defaultSeo,
    organization,
    adsense,
    analytics
  }
`;

// 2. Beranda (Home Page) Query - FR-101
export const HOME_PAGE_QUERY = groq`
  {
    "hero": *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      author->{ name, role, photo },
      "category": categories[0]->{ title, "slug": slug.current }
    },
    "secondaryHero": *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[1..3] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      author->{ name },
      "category": categories[0]->{ title, "slug": slug.current }
    },
    "latestPosts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[4..9] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      author->{ name },
      "category": categories[0]->{ title, "slug": slug.current }
    },
    "categories": *[_type == "category"] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      description
    },
    "events": *[_type == "event"] | order(startDate asc)[0..2] {
      _id,
      title,
      "slug": slug.current,
      startDate,
      endDate,
      location,
      registrationOpen
    }
  }
`;

// 3. Detail Artikel Berita - FR-102
export const POST_PAGE_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt,
    updatedAt,
    body,
    adsEnabled,
    seo,
    author->{
      _id,
      name,
      "slug": slug.current,
      role,
      bio,
      photo,
      social
    },
    categories[]->{
      _id,
      title,
      "slug": slug.current
    },
    tags[]->{
      _id,
      title,
      "slug": slug.current
    },
    "relatedPosts": *[_type == "post" && slug.current != $slug && count(categories[@._ref in ^.^.categories[]._ref]) > 0] | order(publishedAt desc)[0..2] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      "category": categories[0]->{ title, "slug": slug.current },
      author->{ name }
    }
  }
`;

// 4. Slugs untuk generateStaticParams
export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;

export const CATEGORY_SLUGS_QUERY = groq`
  *[_type == "category" && defined(slug.current)][].slug.current
`;

export const TAG_SLUGS_QUERY = groq`
  *[_type == "tag" && defined(slug.current)][].slug.current
`;

export const AUTHOR_SLUGS_QUERY = groq`
  *[_type == "author" && defined(slug.current)][].slug.current
`;

export const PAGE_SLUGS_QUERY = groq`
  *[_type == "page" && defined(slug.current)][].slug.current
`;

export const EVENT_SLUGS_QUERY = groq`
  *[_type == "event" && defined(slug.current)][].slug.current
`;

// 5. Arsip Berita (Semua Berita dengan Paginasi) - FR-103
export const POSTS_INDEX_QUERY = groq`
  {
    "posts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[$start...$end] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      author->{ name, photo },
      "category": categories[0]->{ title, "slug": slug.current }
    },
    "total": count(*[_type == "post" && defined(slug.current)]),
    "categories": *[_type == "category"] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }
  }
`;

// 6. Arsip Kategori - FR-103
export const CATEGORY_PAGE_QUERY = groq`
  {
    "category": *[_type == "category" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      description,
      seo
    },
    "posts": *[_type == "post" && defined(slug.current) && $slug in categories[]->slug.current] | order(publishedAt desc)[$start...$end] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      author->{ name, photo },
      "category": categories[0]->{ title, "slug": slug.current }
    },
    "total": count(*[_type == "post" && defined(slug.current) && $slug in categories[]->slug.current])
  }
`;

// 7. Arsip Tag - FR-103
export const TAG_PAGE_QUERY = groq`
  {
    "tag": *[_type == "tag" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current
    },
    "posts": *[_type == "post" && defined(slug.current) && $slug in tags[]->slug.current] | order(publishedAt desc)[$start...$end] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      author->{ name, photo },
      "category": categories[0]->{ title, "slug": slug.current }
    },
    "total": count(*[_type == "post" && defined(slug.current) && $slug in tags[]->slug.current])
  }
`;

// 8. Halaman Profil Penulis - FR-103
export const AUTHOR_PAGE_QUERY = groq`
  {
    "author": *[_type == "author" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      role,
      bio,
      photo,
      social
    },
    "posts": *[_type == "post" && defined(slug.current) && author->slug.current == $slug] | order(publishedAt desc)[$start...$end] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      coverImage,
      publishedAt,
      author->{ name, photo },
      "category": categories[0]->{ title, "slug": slug.current }
    },
    "total": count(*[_type == "post" && defined(slug.current) && author->slug.current == $slug])
  }
`;

// 9. Halaman Statis - FR-104
export const STATIC_PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    showInNav,
    body,
    seo,
    _updatedAt
  }
`;

// 10. Pencarian Artikel - FR-105
export const SEARCH_POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current) && (title match $term || excerpt match $term)] | order(publishedAt desc)[0...30] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    publishedAt,
    author->{ name },
    "category": categories[0]->{ title, "slug": slug.current }
  }
`;

// 11. RSS Feed Artikel Terbaru - FR-107
export const RSS_POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...20] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    _updatedAt,
    author->{ name },
    "category": categories[0]->{ title }
  }
`;

