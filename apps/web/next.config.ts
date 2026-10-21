import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // 1. Halaman Statis Lawas (PRD A7)
      {
        source: "/p/about-us.html",
        destination: "/tentang-kami",
        permanent: true,
      },
      {
        source: "/p/pengurus.html",
        destination: "/susunan-pengurus",
        permanent: true,
      },
      {
        source: "/p/daftar-isi.html",
        destination: "/berita",
        permanent: true,
      },

      // 2. Feed & Pencarian (PRD A7)
      {
        source: "/feeds/posts/default",
        destination: "/rss.xml",
        permanent: true,
      },
      {
        source: "/search",
        destination: "/cari",
        permanent: true,
      },

      // 3. Label ke Kategori / Tag (Berdasarkan label-map.json)
      {
        source: "/search/label/Aktivitas",
        destination: "/kategori/kegiatan",
        permanent: true,
      },
      {
        source: "/search/label/Kegiatan",
        destination: "/kategori/kegiatan",
        permanent: true,
      },
      {
        source: "/search/label/Artikel",
        destination: "/kategori/berita-utama",
        permanent: true,
      },
      {
        source: "/search/label/Opini",
        destination: "/kategori/opini-cendekia",
        permanent: true,
      },
      {
        source: "/search/label/Essay",
        destination: "/kategori/opini-cendekia",
        permanent: true,
      },
      {
        source: "/search/label/Pendidikan",
        destination: "/kategori/kaderisasi",
        permanent: true,
      },
      {
        source: "/search/label/Neurosains",
        destination: "/tag/cendekia-muda",
        permanent: true,
      },
      {
        source: "/search/label/Epistemologi",
        destination: "/tag/cendekia-muda",
        permanent: true,
      },
      {
        source: "/search/label/Literasi",
        destination: "/tag/literasi-digital",
        permanent: true,
      },
      {
        source: "/search/label/:label*",
        destination: "/berita",
        permanent: true,
      },

      // 4. Pengecualian Khusus Slug (Spasi & Huruf Kapital)
      {
        source: "/2026/08/Workshop%20Penulisan%20Karya%20Tulis%20ilmiah.html",
        destination: "/berita/workshop-penulisan-karya-tulis-ilmiah",
        permanent: true,
      },

      // 5. Pola Regex Umum Artikel: /YYYY/MM/slug.html -> /berita/slug (PRD A7)
      {
        source: "/:year(\\d{4})/:month(\\d{2})/:slug.html",
        destination: "/berita/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
