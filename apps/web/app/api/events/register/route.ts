import { NextResponse } from "next/server";
import { eventRegistrationSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Pembatasan Laju (Rate Limiting: maks 5 permintaan per menit per IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`event_reg:${clientIp}`, { limit: 5, windowMs: 60 * 1000 });

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

    const validation = eventRegistrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data formulir pendaftaran kegiatan tidak valid",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { eventSanityId, fullName, email, phone, organization, extra } = validation.data;

    // 3. Simpan ke Supabase (tabel event_registrations)
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { error: insertError } = await supabase.from("event_registrations").insert({
        event_sanity_id: eventSanityId,
        full_name: fullName,
        email,
        phone,
        organization: organization || null,
        extra: extra || {},
      });

      if (insertError) {
        // Cek pelanggaran Unique Constraint (event_sanity_id, email)
        if (insertError.code === "23505" || insertError.message.includes("unique")) {
          return NextResponse.json(
            {
              success: false,
              message: "Alamat email ini sudah terdaftar untuk kegiatan yang dipilih.",
            },
            { status: 409 }
          );
        }

        console.error("[SUPABASE EVENT REG INSERT ERROR]:", insertError);
        return NextResponse.json(
          {
            success: false,
            message: "Gagal menyimpan data pendaftaran. Silakan coba beberapa saat lagi.",
          },
          { status: 500 }
        );
      }
    } else {
      console.log(`[DEV NOTICE] Pendaftaran kegiatan diterima (mock):
Event ID : ${eventSanityId}
Nama     : ${fullName}
Email    : ${email}
Telepon  : ${phone}
Instansi : ${organization || "-"}
      `);
    }

    // 4. Respons Sukses
    return NextResponse.json({
      success: true,
      message: "Pendaftaran kegiatan berhasil! Tim panitia akan menghubungi Anda melalui WhatsApp/Email.",
    });
  } catch (err: any) {
    console.error("[API EVENT REGISTER ERROR]:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
