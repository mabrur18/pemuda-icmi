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
        .select("id, status")
        .eq("confirm_token", token.trim())
        .maybeSingle();

      if (selectError || !subscriber) {
        return NextResponse.redirect(new URL("/buletin/konfirmasi?status=invalid", siteUrl));
      }

      // Update status menjadi 'unsubscribed'
      const { error: updateError } = await supabase
        .from("subscribers")
        .update({
          status: "unsubscribed",
        })
        .eq("id", subscriber.id);

      if (updateError) {
        console.error("[SUPABASE UNSUBSCRIBE UPDATE ERROR]:", updateError);
        return NextResponse.redirect(new URL("/buletin/konfirmasi?status=error", siteUrl));
      }
    } else {
      console.log(`[DEV NOTICE] Pembatalan langganan buletin disimulasikan untuk token: ${token}`);
    }

    return NextResponse.redirect(new URL("/buletin/konfirmasi?status=unsubscribed", siteUrl));
  } catch (err: any) {
    console.error("[API NEWSLETTER UNSUBSCRIBE ERROR]:", err);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    return NextResponse.redirect(new URL("/buletin/konfirmasi?status=error", siteUrl));
  }
}
