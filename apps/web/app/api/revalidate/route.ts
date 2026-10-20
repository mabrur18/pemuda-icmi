import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";

export const runtime = "nodejs";

function isValidSignature(bodyText: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  try {
    const parts = signatureHeader.split(",");
    let timestamp = "";
    let signature = "";
    for (const part of parts) {
      const [key, val] = part.trim().split("=");
      if (key === "t") timestamp = val;
      if (key === "v1") signature = val;
    }
    if (!timestamp || !signature) return false;

    const payload = `${timestamp}.${bodyText}`;
    const hmac = crypto.createHmac("sha256", secret).update(payload).digest("base64");
    return hmac === signature;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured on the server." },
      { status: 500 }
    );
  }

  // 1. Secret authentication checks
  const authHeader = request.headers.get("authorization");
  const customSecretHeader = request.headers.get("x-sanity-secret");
  const signatureHeader = request.headers.get("sanity-webhook-signature");
  const querySecret = request.nextUrl.searchParams.get("secret");

  const rawBody = await request.text();

  const isBearerValid = authHeader === `Bearer ${secret}`;
  const isHeaderValid = customSecretHeader === secret;
  const isQueryValid = querySecret === secret;
  const isHmacValid = isValidSignature(rawBody, signatureHeader, secret);

  const isAuthenticated = isBearerValid || isHeaderValid || isQueryValid || isHmacValid;

  if (!isAuthenticated) {
    return NextResponse.json({ message: "Invalid or missing secret token." }, { status: 401 });
  }

  // 2. Parse payload
  let body: any = {};
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
    }
  }

  const type = body._type || body.type;
  const rawSlug = body.slug;
  const slug = typeof rawSlug === "object" ? rawSlug?.current : rawSlug;

  const revalidatedTags: string[] = [];

  switch (type) {
    case "post":
      revalidateTag("posts");
      revalidatedTags.push("posts");
      if (slug) {
        revalidateTag(`post:${slug}`);
        revalidatedTags.push(`post:${slug}`);
      }
      break;

    case "page":
      revalidateTag("pages");
      revalidatedTags.push("pages");
      if (slug) {
        revalidateTag(`page:${slug}`);
        revalidatedTags.push(`page:${slug}`);
      }
      break;

    case "category":
      revalidateTag("categories");
      revalidateTag("posts");
      revalidatedTags.push("categories", "posts");
      if (slug) {
        revalidateTag(`category:${slug}`);
        revalidatedTags.push(`category:${slug}`);
      }
      break;

    case "tag":
      revalidateTag("tags");
      revalidateTag("posts");
      revalidatedTags.push("tags", "posts");
      if (slug) {
        revalidateTag(`tag:${slug}`);
        revalidatedTags.push(`tag:${slug}`);
      }
      break;

    case "author":
      revalidateTag("authors");
      revalidateTag("posts");
      revalidatedTags.push("authors", "posts");
      if (slug) {
        revalidateTag(`author:${slug}`);
        revalidatedTags.push(`author:${slug}`);
      }
      break;

    case "event":
      revalidateTag("events");
      revalidatedTags.push("events");
      if (slug) {
        revalidateTag(`event:${slug}`);
        revalidatedTags.push(`event:${slug}`);
      }
      break;

    case "siteSettings":
      revalidateTag("siteSettings");
      revalidatedTags.push("siteSettings");
      break;

    default:
      // If type not specified or unknown, revalidate global tags
      revalidateTag("posts");
      revalidateTag("pages");
      revalidatedTags.push("posts", "pages");
      break;
  }

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    type: type || "unknown",
    slug: slug || null,
    tags: revalidatedTags,
  });
}
