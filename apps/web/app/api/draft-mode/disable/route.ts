import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

export const runtime = "nodejs";

/**
 * Route handler untuk menonaktifkan Next.js Draft Mode.
 * Mengembalikan tampilan ke mode publik (published).
 *
 * Contoh akses:
 * /api/draft-mode/disable?redirect=/berita/judul-artikel
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get("redirect") || "/";

  // Matikan Next.js Draft Mode (menghapus cookie __prerender_bypass)
  const draft = await draftMode();
  draft.disable();

  const redirectUrl = new URL(redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`, request.url);
  return NextResponse.redirect(redirectUrl);
}
