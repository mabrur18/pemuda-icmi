import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

// Read token
const envContent = fs.readFileSync(path.resolve("apps/web/.env.local"), "utf-8");
const tokenMatch = envContent.match(/SANITY_API_WRITE_TOKEN=(.*)/);
const token = tokenMatch ? tokenMatch[1].trim() : undefined;

const client = createClient({
  projectId: "glupcaxn",
  dataset: "staging",
  apiVersion: "2026-03-01",
  token,
  useCdn: false,
});

async function main() {
  console.log("=== VERIFIKASI TAHAP 8 LANGKAH C ===");
  const posts = await client.fetch('*[_type == "post" && _id match "post.blogger-*"]{_id, title, slug, body}');
  console.log(`Jumlah artikel Blogger termigrasi: ${posts.length}`);

  let legacyHostFound = 0;
  for (const post of posts) {
    const raw = JSON.stringify(post.body || []);
    if (raw.includes("googleusercontent.com") || raw.includes("bp.blogspot.com")) {
      console.warn(`[PERINGATAN] URL gambar lawas ditemukan di ${post._id} (${post.slug?.current})`);
      legacyHostFound++;
    }
  }

  console.log(`Artikel dengan URL googleusercontent.com / bp.blogspot.com di body: ${legacyHostFound}`);
  if (legacyHostFound === 0) {
    console.log("✓ BERSIH: 100% artikel tidak mengandung URL gambar Google/Blogger lawas di body!");
  }
}

main().catch(console.error);
