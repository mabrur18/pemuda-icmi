import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { createClient } from "@supabase/supabase-js";

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

const labelMapPath = path.resolve("./scripts/migrate/label-map.json");
const labelMap: {
  categories?: Record<string, string>;
  tags?: Record<string, string>;
} = fs.existsSync(labelMapPath)
  ? JSON.parse(fs.readFileSync(labelMapPath, "utf-8"))
  : {};

export interface RedirectEntry {
  blogger_path: string;
  sanity_id: string | null;
  new_path: string;
  status: "mapped";
  source_type: "post" | "page" | "label" | "feed" | "search";
}

export function generateRedirectMap(): {
  redirects: RedirectEntry[];
  qaUrls: string[];
} {
  const feedPath = path.resolve("./scripts/migrate/input/feed.atom");
  if (!fs.existsSync(feedPath)) {
    throw new Error(`Berkas feed.atom tidak ditemukan di ${feedPath}`);
  }

  const xmlData = fs.readFileSync(feedPath, "utf-8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => ["entry", "category", "link"].includes(name),
  });

  const parsed = parser.parse(xmlData);
  const entries = parsed.feed?.entry || [];

  const redirects: RedirectEntry[] = [];
  const qaUrls: string[] = [];

  // 1. Artikel Post
  for (let idx = 0; idx < entries.length; idx++) {
    const entry = entries[idx];
    const type = entry["blogger:type"] || "POST";

    const rawId = entry.id || "";
    const postIdMatch = rawId.match(/post-(\d+)/);
    const postId = postIdMatch ? postIdMatch[1] : `${idx + 1}`;
    const docId = `post.blogger-${postId}`;

    if (type === "POST") {
      const filename = entry["blogger:filename"] || "";
      let slug = "";
      if (filename) {
        slug = path
          .basename(filename, ".html")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      } else {
        slug = (entry.title || `artikel-${postId}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      const targetPath = `/berita/${slug}`;

      if (filename) {
        redirects.push({
          blogger_path: filename,
          sanity_id: docId,
          new_path: targetPath,
          status: "mapped",
          source_type: "post",
        });
        qaUrls.push(filename);

        // Tambahkan encoded variant jika ada spasi
        if (filename.includes(" ")) {
          const encoded = encodeURI(filename);
          redirects.push({
            blogger_path: encoded,
            sanity_id: docId,
            new_path: targetPath,
            status: "mapped",
            source_type: "post",
          });
          qaUrls.push(encoded);
        }
      }
    } else if (type === "PAGE") {
      // 2. Halaman Statis
      const filename = entry["blogger:filename"] || "";
      let targetPath = "/berita";
      if (filename.includes("about-us")) {
        targetPath = "/tentang-kami";
      } else if (filename.includes("pengurus")) {
        targetPath = "/susunan-pengurus";
      } else if (filename.includes("daftar-isi")) {
        targetPath = "/berita";
      }

      if (filename) {
        redirects.push({
          blogger_path: filename,
          sanity_id: `page.blogger-${postId}`,
          new_path: targetPath,
          status: "mapped",
          source_type: "page",
        });
        qaUrls.push(filename);
      }
    }
  }

  // 3. Feed & Search
  redirects.push({
    blogger_path: "/feeds/posts/default",
    sanity_id: null,
    new_path: "/rss.xml",
    status: "mapped",
    source_type: "feed",
  });
  qaUrls.push("/feeds/posts/default");

  redirects.push({
    blogger_path: "/search",
    sanity_id: null,
    new_path: "/cari",
    status: "mapped",
    source_type: "search",
  });
  qaUrls.push("/search");

  // 4. Label / Kategori & Tag
  const seenLabels = new Set<string>();

  // Kategori
  for (const [label, catRef] of Object.entries(labelMap.categories || {})) {
    if (label === "default" || seenLabels.has(label)) continue;
    seenLabels.add(label);
    const catSlug = catRef.replace(/^category-/, "");
    const targetUrl = `/kategori/${catSlug}`;

    const labelPath = `/search/label/${label}`;
    redirects.push({
      blogger_path: labelPath,
      sanity_id: null,
      new_path: targetUrl,
      status: "mapped",
      source_type: "label",
    });
    qaUrls.push(labelPath);

    if (label.includes(" ")) {
      const encodedLabelPath = `/search/label/${encodeURIComponent(label)}`;
      redirects.push({
        blogger_path: encodedLabelPath,
        sanity_id: null,
        new_path: targetUrl,
        status: "mapped",
        source_type: "label",
      });
      qaUrls.push(encodedLabelPath);
    }
  }

  // Tags (untuk label khusus seperti Neurosains, Epistemologi, Literasi)
  for (const [label, tagRef] of Object.entries(labelMap.tags || {})) {
    if (label === "default" || seenLabels.has(label)) continue;
    seenLabels.add(label);
    const tagSlug = tagRef.replace(/^tag-/, "");
    const targetUrl = `/tag/${tagSlug}`;

    const labelPath = `/search/label/${label}`;
    redirects.push({
      blogger_path: labelPath,
      sanity_id: null,
      new_path: targetUrl,
      status: "mapped",
      source_type: "label",
    });
    qaUrls.push(labelPath);

    if (label.includes(" ")) {
      const encodedLabelPath = `/search/label/${encodeURIComponent(label)}`;
      redirects.push({
        blogger_path: encodedLabelPath,
        sanity_id: null,
        new_path: targetUrl,
        status: "mapped",
        source_type: "label",
      });
      qaUrls.push(encodedLabelPath);
    }
  }

  return { redirects, qaUrls };
}

async function main() {
  console.log("=== PEMBUATAN PETA REDIRECT BLOGGER KE NEXT.JS / SUPABASE ===");

  const { redirects, qaUrls } = generateRedirectMap();
  console.log(`Total aturan pemetaan dihasilkan: ${redirects.length}`);

  // Simpan JSON
  const outDir = path.resolve("./scripts/migrate/out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const jsonPath = path.join(outDir, "redirect_map.json");
  fs.writeFileSync(jsonPath, JSON.stringify(redirects, null, 2), "utf-8");
  console.log(`✓ File JSON disimpan di: ${jsonPath}`);

  // Simpan QA URLs
  const qaDir = path.resolve("./scripts/qa");
  if (!fs.existsSync(qaDir)) {
    fs.mkdirSync(qaDir, { recursive: true });
  }
  const qaFilePath = path.join(qaDir, "blogger-urls.txt");
  fs.writeFileSync(qaFilePath, qaUrls.join("\n"), "utf-8");
  console.log(`✓ Daftar URL untuk QA disimpan di: ${qaFilePath} (${qaUrls.length} baris)`);

  // Hasilkan SQL seed
  const sqlStatements = [
    "-- SQL Seed Tabel redirect_map Supabase (PRD FR-302)",
    "-- Menampung seluruh pemetaan URL lama Blogger ke rute Next.js",
  ];
  for (const r of redirects) {
    const sanityIdVal = r.sanity_id ? `'${r.sanity_id}'` : "NULL";
    sqlStatements.push(
      `INSERT INTO redirect_map (blogger_path, sanity_id, new_path, status, checked_at) VALUES ('${r.blogger_path}', ${sanityIdVal}, '${r.new_path}', 'mapped', NOW()) ON CONFLICT (blogger_path) DO UPDATE SET new_path = EXCLUDED.new_path, status = 'mapped', checked_at = NOW();`
    );
  }

  const sqlPath = path.resolve("./supabase/seed_redirect_map.sql");
  fs.writeFileSync(sqlPath, sqlStatements.join("\n"), "utf-8");
  console.log(`✓ Berkas SQL seed disimpan di: ${sqlPath}`);

  // Jika Supabase environment variables tersedia, masukkan ke database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    console.log(`\nMenghubungkan ke Supabase di ${supabaseUrl}...`);
    try {
      const supabase = createClient(supabaseUrl, serviceKey);
      const rows = redirects.map((r) => ({
        blogger_path: r.blogger_path,
        sanity_id: r.sanity_id,
        new_path: r.new_path,
        status: "mapped",
        checked_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("redirect_map")
        .upsert(rows, { onConflict: "blogger_path" });

      if (error) {
        console.warn(`[PERINGATAN SUPABASE]: ${error.message}`);
      } else {
        console.log(`✓ Berhasil memasukkan ${rows.length} baris ke tabel redirect_map di Supabase!`);
      }
    } catch (err: any) {
      console.warn(`[PERINGATAN SUPABASE]: Gagal menghubungkan ke Supabase: ${err.message}`);
    }
  } else {
    console.log(
      `\nℹ Supabase live keys belum diset di .env.local; data pemetaan siap diinjeksikan lewat supabase/seed_redirect_map.sql dan scripts/migrate/out/redirect_map.json.`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes("export-redirects.ts")) {
  main().catch(console.error);
}
