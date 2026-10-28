import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

export const runtime = "nodejs";

/**
 * Route handler untuk mengaktifkan Next.js Draft Mode (FR-204).
 * Memungkinkan pratinjau langsung konten draf/unpublished dari Sanity Studio
 * tanpa perlu menunggu proses publish atau revalidasi cache.
 *
 * Contoh akses:
 * /api/draft-mode/enable?secret=<SANITY_REVALIDATE_SECRET>&slug=/berita/judul-artikel
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") || "/";

  const validSecret = process.env.SANITY_REVALIDATE_SECRET || "icmi_rev_sec_89f72b901a8e41";

  if (!secret || secret !== validSecret) {
    return NextResponse.json(
      { message: "Token rahasia tidak valid untuk mengaktifkan Draft Mode." },
      { status: 401 }
    );
  }

  // Aktifkan Next.js Draft Mode (menulis cookie __prerender_bypass)
  const draft = await draftMode();
  draft.enable();

  // Redirect ke halaman yang ingin dipratinjau
  const redirectUrl = new URL(slug.startsWith("/") ? slug : `/${slug}`, request.url);
  return NextResponse.redirect(redirectUrl);
}
