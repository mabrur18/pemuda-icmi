import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNewsletterConfirmationEmail } from "@/lib/email";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Pembatasan Laju (Rate Limiting: maks 5 permintaan per menit per IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`newsletter:${clientIp}`, { limit: 5, windowMs: 60 * 1000 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak permintaan pendaftaran. Silakan tunggu 1 menit sebelum mencoba lagi.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 2. Parse & Validasi Skema Zod
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Format payload JSON tidak valid" },
        { status: 400 }
      );
    }

    const validation = newsletterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pendaftaran buletin tidak valid",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, name, source } = validation.data;
    const confirmToken = crypto.randomUUID();

    // 3. Simpan / Perbarui ke Supabase (FR-601: status awal 'pending')
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();

        // Cari apakah email sudah ada di database
        const { data: existing, error: selectError } = await supabase
          .from("subscribers")
          .select("id, status, confirm_token")
          .eq("email", email)
          .maybeSingle();

        if (selectError) {
          console.error("[SUPABASE NEWSLETTER SELECT ERROR]:", selectError);
        }

        if (existing) {
          // Anti-enumeration: Jika sudah confirmed, tetap kembalikan pesan sukses tanpa membocorkan status
          if (existing.status === "confirmed") {
            return NextResponse.json({
              success: true,
              message: "Silakan periksa kotak masuk email Anda untuk petunjuk berlangganan buletin.",
            });
          }

          // Jika masih pending atau unsubscribed, perbarui token dan kirim ulang konfirmasi
          await supabase
            .from("subscribers")
            .update({
              name: name || undefined,
              status: "pending",
              confirm_token: confirmToken,
              source: source || "web_portal",
            })
            .eq("id", existing.id);
        } else {
          // Rekor baru
          await supabase.from("subscribers").insert({
            email,
            name: name || null,
            status: "pending",
            confirm_token: confirmToken,
            source: source || "web_portal",
          });
        }
      } catch (dbErr: any) {
        console.error("[SUPABASE NEWSLETTER MUTATION ERROR]:", dbErr?.message);
        // Tetap lanjutkan pengiriman email jika database gagal agar flow tidak crash secara destruktif
      }
    } else {
      console.log(
        `[DEV NOTICE] Supabase belum aktif. Mendaftarkan pelanggan (pending): ${email} dengan token: ${confirmToken}`
      );
    }

    // 4. Kirim Email Konfirmasi Double Opt-In
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendNewsletterConfirmationEmail({
      email,
      name,
      confirmToken,
      siteUrl,
    });

    // 5. Respons Sukses Anti-Enumerasi (FR-601 Poin 5)
    return NextResponse.json({
      success: true,
      message: "Terima kasih! Silakan periksa kotak masuk email Anda untuk mengonfirmasi pendaftaran buletin.",
    });
  } catch (err: any) {
    console.error("[API NEWSLETTER ERROR]:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
