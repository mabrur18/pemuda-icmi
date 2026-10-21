import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pemetaan Halaman Statis Lawas Blogger (PRD A7 & FR-302)
const STATIC_MAP: Record<string, string> = {
  "/p/about-us.html": "/tentang-kami",
  "/p/pengurus.html": "/susunan-pengurus",
  "/p/daftar-isi.html": "/berita",
  "/feeds/posts/default": "/rss.xml",
  "/search": "/cari",
};

// Pemetaan Label ke Kategori & Tag (Berdasarkan label-map.json)
const LABEL_MAP: Record<string, string> = {
  Aktivitas: "/kategori/kegiatan",
  Kegiatan: "/kategori/kegiatan",
  Artikel: "/kategori/berita-utama",
  Opini: "/kategori/opini-cendekia",
  Essay: "/kategori/opini-cendekia",
  Pendidikan: "/kategori/kaderisasi",
  Neurosains: "/tag/cendekia-muda",
  Epistemologi: "/tag/cendekia-muda",
  Literasi: "/tag/literasi-digital",
};

/**
 * Menghitung rute target canonical dari jalur Blogger lawas.
 */
function resolveRedirectPath(pathname: string): string | null {
  let decoded = pathname;
  try {
    decoded = decodeURI(pathname);
  } catch {
    decoded = pathname;
  }

  // 1. Cek tabel statis
  if (STATIC_MAP[decoded]) return STATIC_MAP[decoded];
  if (STATIC_MAP[pathname]) return STATIC_MAP[pathname];

  // 2. Cek rute pencarian label
  if (pathname.startsWith("/search/label/")) {
    const rawLabel = pathname.replace("/search/label/", "");
    let decodedLabel = rawLabel;
    try {
      decodedLabel = decodeURIComponent(rawLabel);
    } catch {
      decodedLabel = rawLabel;
    }
    return LABEL_MAP[decodedLabel] || LABEL_MAP[rawLabel] || "/berita";
  }

  // 3. Cek pola artikel /YYYY/MM/slug.html
  const articleMatch = decoded.match(/^\/(\d{4})\/(\d{2})\/(.+)\.html$/);
  if (articleMatch) {
    const rawSlug = articleMatch[3];
    // Normalisasi slug (termasuk penanganan spasi & kapitalisasi seperti Workshop Penulisan)
    const cleanSlug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `/berita/${cleanSlug}`;
  }

  return null;
}

/**
 * Middleware Next.js untuk menjamin redirect permanen 308 dalam SATU LOMPATAN (FR-302)
 * dan menghapus parameter query ?m=1 dan ?m=0 bawaan Blogger seluler.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const originalPath = url.pathname;
  const hasMParam = url.searchParams.has("m");

  const targetPath = resolveRedirectPath(originalPath);

  // Jika URL memiliki parameter ?m=1 / ?m=0 ATAU merupakan jalur Blogger lawas
  if (hasMParam || targetPath) {
    if (hasMParam) {
      url.searchParams.delete("m");
    }

    if (targetPath) {
      url.pathname = targetPath;
    }

    // Hanya redirect jika ada perubahan path atau parameter m dihapus
    if (url.pathname !== originalPath || hasMParam) {
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware pada seluruh rute kecuali:
     * - api routes
     * - static files (_next/static, _next/image, favicon.ico, ads.txt, robots.txt, sitemap.xml)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|ads.txt|robots.txt|sitemap.xml).*)",
  ],
};
