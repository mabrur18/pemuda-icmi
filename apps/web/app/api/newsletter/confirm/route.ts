import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    if (!token || token.trim().length === 0) {
      return NextResponse.redirect(new URL("/buletin/konfirmasi?status=invalid", siteUrl));
    }

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();

      const { data: subscriber, error: selectError } = await supabase
        .from("subscribers")
        .select("id, email, status")
        .eq("confirm_token", token.trim())
        .maybeSingle();

      if (selectError || !subscriber) {
        return NextResponse.redirect(new URL("/buletin/konfirmasi?status=invalid", siteUrl));
      }

      if (subscriber.status === "confirmed") {
        return NextResponse.redirect(new URL("/buletin/konfirmasi?status=already_confirmed", siteUrl));
      }

      // Update status menjadi 'confirmed'
      const { error: updateError } = await supabase
        .from("subscribers")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", subscriber.id);

      if (updateError) {
        console.error("[SUPABASE CONFIRM UPDATE ERROR]:", updateError);
        return NextResponse.redirect(new URL("/buletin/konfirmasi?status=error", siteUrl));
      }
    } else {
      console.log(`[DEV NOTICE] Konfirmasi buletin berhasil disimulasikan untuk token: ${token}`);
    }

    return NextResponse.redirect(new URL("/buletin/konfirmasi?status=success", siteUrl));
  } catch (err: any) {
    console.error("[API NEWSLETTER CONFIRM ERROR]:", err);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    return NextResponse.redirect(new URL("/buletin/konfirmasi?status=error", siteUrl));
  }
}
