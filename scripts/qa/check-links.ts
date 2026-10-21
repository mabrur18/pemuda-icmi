import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

// Muat variabel lingkungan
const envLocalPath = path.resolve("./apps/web/.env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").trim();
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "glupcaxn";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "staging";
const readToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-03-01",
  token: readToken,
  useCdn: false,
});

interface LinkCheckItem {
  postSlug: string;
  postTitle: string;
  type: "image" | "internal_link";
  url: string;
  status: number;
  passed: boolean;
  error?: string;
}

export async function checkLinksAndImages(options: {
  baseUrl?: string;
  concurrency?: number;
}): Promise<{
  totalArticles: number;
  totalImages: number;
  passedImages: number;
  totalLinks: number;
  passedLinks: number;
  failures: LinkCheckItem[];
}> {
  const baseUrl = (options.baseUrl || process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

  console.log(`\n============================================================`);
  console.log(`🔗 QA PEMERIKSAAN TAUTAN INTERNAL & GAMBAR (PRD FR-302)`);
  console.log(`Target Base URL : ${baseUrl}`);
  console.log(`Sanity Dataset  : ${dataset} (${projectId})`);
  console.log(`============================================================\n`);

  // Query seluruh artikel beserta body dan aset gambarnya
  const query = `*[_type == "post"]{
    _id,
    title,
    "slug": slug.current,
    "coverImageUrl": coverImage.asset->url,
    body[]{
      ...,
      _type == "image" => {
        ...,
        "imageUrl": asset->url
      }
    }
  }`;

  const posts = await client.fetch<Array<{
    _id: string;
    title: string;
    slug: string;
    coverImageUrl?: string;
    body?: any[];
  }>>(query);

  console.log(`Ditemukan ${posts.length} artikel di Sanity untuk diperiksa.`);

  const imageUrlsToTest: Array<{ postSlug: string; postTitle: string; url: string }> = [];
  const internalLinksToTest: Array<{ postSlug: string; postTitle: string; url: string }> = [];

  for (const post of posts) {
    if (post.coverImageUrl) {
      imageUrlsToTest.push({
        postSlug: post.slug,
        postTitle: post.title,
        url: post.coverImageUrl,
      });
    }

    if (Array.isArray(post.body)) {
      for (const block of post.body) {
        // Gambar inline Portable Text
        if (block._type === "image" && block.imageUrl) {
          imageUrlsToTest.push({
            postSlug: post.slug,
            postTitle: post.title,
            url: block.imageUrl,
          });
        }

        // Tautan dalam blok teks
        if (block.markDefs && Array.isArray(block.markDefs)) {
          for (const mark of block.markDefs) {
            if (mark._type === "link" && mark.href) {
              const href = mark.href.trim();
              // Hanya cek internal links (relatif atau matching domain)
              if (href.startsWith("/") || href.includes("localhost") || href.includes("pemudaicmi-kotabekasi.org")) {
                let resolvedUrl = href;
                if (href.startsWith("/")) {
                  resolvedUrl = `${baseUrl}${href}`;
                }
                internalLinksToTest.push({
                  postSlug: post.slug,
                  postTitle: post.title,
                  url: resolvedUrl,
                });
              }
            }
          }
        }
      }
    }
  }

  console.log(`Memeriksa ${imageUrlsToTest.length} URL gambar...`);
  console.log(`Memeriksa ${internalLinksToTest.length} tautan internal...`);

  const failures: LinkCheckItem[] = [];
  let passedImages = 0;
  let passedLinks = 0;

  // 1. Periksa Gambar
  for (const img of imageUrlsToTest) {
    try {
      const resp = await fetch(img.url, { method: "HEAD" });
      if (resp.status >= 200 && resp.status < 400) {
        passedImages++;
      } else {
        failures.push({
          postSlug: img.postSlug,
          postTitle: img.postTitle,
          type: "image",
          url: img.url,
          status: resp.status,
          passed: false,
          error: `HTTP ${resp.status}`,
        });
        console.error(`✗ [GAMBAR GAGAL] ${img.postTitle} (${img.postSlug}): ${img.url} -> HTTP ${resp.status}`);
      }
    } catch (err: any) {
      failures.push({
        postSlug: img.postSlug,
        postTitle: img.postTitle,
        type: "image",
        url: img.url,
        status: 0,
        passed: false,
        error: err.message,
      });
      console.error(`✗ [GAMBAR ERROR] ${img.postTitle} (${img.postSlug}): ${img.url} -> ${err.message}`);
    }
  }

  // 2. Periksa Tautan Internal
  for (const link of internalLinksToTest) {
    try {
      const resp = await fetch(link.url, { method: "GET" });
      if (resp.status >= 200 && resp.status < 400) {
        passedLinks++;
      } else {
        failures.push({
          postSlug: link.postSlug,
          postTitle: link.postTitle,
          type: "internal_link",
          url: link.url,
          status: resp.status,
          passed: false,
          error: `HTTP ${resp.status}`,
        });
        console.error(`✗ [TAUTAN GAGAL] ${link.postTitle} (${link.postSlug}): ${link.url} -> HTTP ${resp.status}`);
      }
    } catch (err: any) {
      failures.push({
        postSlug: link.postSlug,
        postTitle: link.postTitle,
        type: "internal_link",
        url: link.url,
        status: 0,
        passed: false,
        error: err.message,
      });
      console.error(`✗ [TAUTAN ERROR] ${link.postTitle} (${link.postSlug}): ${link.url} -> ${err.message}`);
    }
  }

  console.log(`\n============================================================`);
  console.log(`📊 LAPORAN AKHIR INTEGRITAS TAUTAN & GAMBAR`);
  console.log(`Total Artikel Diperiksa : ${posts.length}`);
  console.log(`Gambar Valid (200 OK)   : ${passedImages} / ${imageUrlsToTest.length}`);
  console.log(`Tautan Internal Valid   : ${passedLinks} / ${internalLinksToTest.length}`);
  console.log(`Total Galat Ditemukan   : ${failures.length}`);
  console.log(`============================================================\n`);

  return {
    totalArticles: posts.length,
    totalImages: imageUrlsToTest.length,
    passedImages,
    totalLinks: internalLinksToTest.length,
    passedLinks,
    failures,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrlArg = args.find((a) => a.startsWith("--base-url="))?.split("=")[1];

  const res = await checkLinksAndImages({ baseUrl: baseUrlArg });
  if (res.failures.length > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes("check-links.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
