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

export const EVENT_SLUGS_QUERY = groq`
  *[_type == "event" && defined(slug.current)][].slug.current
`;
