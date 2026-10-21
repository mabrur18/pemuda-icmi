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

  // 6. Header Keamanan Ketat (PRD A4 & NFR-03)
  async headers() {
    // Content Security Policy dalam mode report-only
    // AdSense & analytics memuat banyak domain; pelanggaran dicatat ke /api/csp-report tanpa memblokir lelang iklan
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://adservice.google.com https://tpc.googlesyndication.com https://cdn.sanity.io https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com https://pagead2.googlesyndication.com https://www.google-analytics.com https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src 'self' https://www.youtube.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
      "connect-src 'self' https://glupcaxn.api.sanity.io https://glupcaxn.apicdn.sanity.io https://*.supabase.co https://www.google-analytics.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://*.googlesyndication.com https://va.vercel-scripts.com",
      "report-uri /api/csp-report",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspReportOnly,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
