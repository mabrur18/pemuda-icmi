import { NextResponse } from "next/server";
import { contactMessageSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Pembatasan Laju (Rate Limiting: maks 5 permintaan per menit per IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`contact:${clientIp}`, { limit: 5, windowMs: 60 * 1000 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak permintaan pengiriman pesan. Silakan tunggu 1 menit sebelum mencoba lagi.",
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

    // 3. Penangkal Spam Honeypot (FR-602)
    // Field 'website_hp' disembunyikan dari manusia, bot otomatis akan mengisinya
    if (body.website_hp && body.website_hp.trim().length > 0) {
      console.warn(`[SPAM DETECTED] Honeypot terisi dari IP ${clientIp}. Menolak diam-diam.`);
      return NextResponse.json({
        success: false,
        message: "Aktivitas spam terdeteksi.",
      }, { status: 400 });
    }

    const validation = contactMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data formulir kontak tidak valid",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // 4. Simpan ke Supabase (tabel contact_messages)
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { error: insertError } = await supabase.from("contact_messages").insert({
        name,
        email,
        subject: subject || null,
        message,
        status: "new",
      });

      if (insertError) {
        console.error("[SUPABASE CONTACT INSERT ERROR]:", insertError);
        return NextResponse.json(
          {
            success: false,
            message: "Gagal menyimpan pesan Anda ke database. Silakan coba beberapa saat lagi.",
          },
          { status: 500 }
        );
      }
    } else {
      console.log(`[DEV NOTICE] Pesan kontak diterima (mock):
From   : ${name} <${email}>
Subject: ${subject || "(tanpa subjek)"}
Message: ${message}
      `);
    }

    // 5. Respons Sukses
    return NextResponse.json({
      success: true,
      message: "Pesan Anda berhasil dikirim. Terima kasih telah menghubungi Pemuda ICMI Kota Bekasi.",
    });
  } catch (err: any) {
    console.error("[API CONTACT ERROR]:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
