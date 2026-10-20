import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";
import { transformBloggerFeed, TransformedPostDocument } from "./transformer.ts";
import { ExtractedImage } from "./cleaner.ts";

// 1. Muat variabel lingkungan dari apps/web/.env.local
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
const writeToken = process.env.SANITY_API_WRITE_TOKEN;

// 2. Berkas cache aset gambar
const cacheFilePath = path.resolve("./scripts/migrate/asset-cache.json");
let assetCache: Record<string, { _id: string; url: string }> = {};
if (fs.existsSync(cacheFilePath)) {
  try {
    assetCache = JSON.parse(fs.readFileSync(cacheFilePath, "utf-8"));
  } catch {
    assetCache = {};
  }
}

function saveAssetCache() {
  fs.writeFileSync(cacheFilePath, JSON.stringify(assetCache, null, 2), "utf-8");
}

export interface ImportOptions {
  dryRun?: boolean;
  limit?: number;
  dataset?: string;
  confirmProduction?: boolean;
}

export async function runBloggerMigration(options: ImportOptions = {}) {
  const isDryRun = options.dryRun ?? false;
  const dataset = options.dataset || process.env.NEXT_PUBLIC_SANITY_DATASET || "staging";
  const limit = options.limit;

  console.log(`\n============================================================`);
  console.log(`🚀 INISIASI MIGRASI BLOGGER KE SANITY (Tahap 8 — Langkah C)`);
  console.log(`Mode     : ${isDryRun ? "DRY-RUN (Simulasi Tanpa Menulis)" : "LIVE IMPOR"}`);
  console.log(`Dataset  : ${dataset}`);
  console.log(`Project  : ${projectId}`);
  console.log(`Limit    : ${limit ? `${limit} artikel` : "Semua artikel"}`);
  console.log(`============================================================\n`);

  // PENGAWAL KEAMANAN (PRD FR-301): Wajib konfirmasi jika dataset production
  if (dataset === "production" && !options.confirmProduction) {
    throw new Error(
      "DITOLAK: Impor ke dataset production memerlukan flag eksplisit --confirm-production demi keamanan data!"
    );
  }

  if (!writeToken && !isDryRun) {
    throw new Error(
      "Token Sanity dengan hak tulis (SANITY_API_WRITE_TOKEN) tidak ditemukan di apps/web/.env.local!"
    );
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-03-01",
    token: writeToken,
    useCdn: false,
  });

  // Ambil jumlah dokumen awal
  let initialCount = 0;
  if (!isDryRun) {
    initialCount = await client.fetch('count(*[_type == "post"])').catch(() => 0);
    console.log(`Jumlah artikel post saat ini di Sanity (${dataset}): ${initialCount}`);
  }

  // 1. Transformasi artikel dari feed.atom
  const posts = transformBloggerFeed({ limit });

  const report = {
    totalProcessed: posts.length,
    imported: 0,
    skipped: 0,
    failed: 0,
    imagesUploaded: 0,
    imagesFromCache: 0,
    imagesWithoutAlt: [] as string[],
    details: [] as Array<{ id: string; title: string; slug: string; status: string }>,
  };

  // 2. Unggah gambar & pasang cover image
  const preparedDocs: any[] = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n[${i + 1}/${posts.length}] Memproses aset & struktur: "${post.title.slice(0, 50)}..."`);

    let coverAssetRef: string | null = null;
    let coverAltText = "Foto Dokumentasi Pemuda ICMI Kota Bekasi";

    // Proses setiap pending image pada artikel
    const uploadedImagesForDoc: Array<{ assetRef: string; alt: string; caption?: string }> = [];

    for (const img of post.pendingImages) {
      if (!img.alt || img.alt.trim().length === 0 || img.alt.includes("Foto Dokumentasi")) {
        report.imagesWithoutAlt.push(`${post.slug.current} -> ${img.filename}`);
      }

      const cacheKey = img.localPath || img.src;

      if (assetCache[cacheKey]) {
        report.imagesFromCache++;
        const cached = assetCache[cacheKey];
        uploadedImagesForDoc.push({
          assetRef: cached._id,
          alt: img.alt || "Dokumentasi Pemuda ICMI",
          caption: img.caption,
        });
        if (!coverAssetRef) {
          coverAssetRef = cached._id;
          coverAltText = img.alt || coverAltText;
        }
        continue;
      }

      if (isDryRun) {
        // Simulasi dry run
        const simulatedId = `image-simulated-${img.filename.replace(/[^a-z0-9]/gi, "-")}`;
        uploadedImagesForDoc.push({
          assetRef: simulatedId,
          alt: img.alt || "Dokumentasi Pemuda ICMI",
          caption: img.caption,
        });
        if (!coverAssetRef) {
          coverAssetRef = simulatedId;
        }
        report.imagesUploaded++;
        continue;
      }

      // LIVE UPLOAD
      try {
        let assetDoc: any = null;
        if (img.localPath && fs.existsSync(img.localPath)) {
          console.log(`  ↑ Mengunggah file lokal asli: ${path.basename(img.localPath)}`);
          const stream = fs.createReadStream(img.localPath);
          assetDoc = await client.assets.upload("image", stream, {
            filename: img.filename,
          });
        } else {
          console.log(`  ↑ Mengunduh & mengunggah dari web: ${img.src.slice(0, 60)}...`);
          const response = await fetch(img.src);
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status} saat mengunduh gambar`);
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          assetDoc = await client.assets.upload("image", buffer, {
            filename: img.filename,
          });
        }

        if (assetDoc && assetDoc._id) {
          assetCache[cacheKey] = { _id: assetDoc._id, url: assetDoc.url };
          saveAssetCache();
          report.imagesUploaded++;

          uploadedImagesForDoc.push({
            assetRef: assetDoc._id,
            alt: img.alt || "Dokumentasi Pemuda ICMI",
            caption: img.caption,
          });

          if (!coverAssetRef) {
            coverAssetRef = assetDoc._id;
            coverAltText = img.alt || coverAltText;
          }
        }
      } catch (uploadErr: any) {
        console.warn(`  ⚠ Gagal mengunggah gambar ${img.filename}: ${uploadErr.message}`);
      }
    }

    // Jika artikel tidak memiliki gambar apapun, gunakan cover image yang sudah ada dari salah satu gambar cache
    if (!coverAssetRef) {
      // Ambil asset ID dari assetCache jika ada
      const firstCached = Object.values(assetCache)[0];
      if (firstCached) {
        coverAssetRef = firstCached._id;
      }
    }

    // Sisipkan blok gambar ke body jika belum ada
    const finalBody = [...post.body];
    for (const uploadedImg of uploadedImagesForDoc) {
      finalBody.push({
        _key: `migrated-img-${Math.random().toString(36).substring(2, 8)}`,
        _type: "image",
        asset: {
          _type: "reference",
          _ref: uploadedImg.assetRef,
        },
        alt: uploadedImg.alt || "Dokumentasi Pemuda ICMI",
        caption: uploadedImg.caption,
      });
    }

    const docToWrite: any = {
      _id: post._id,
      _type: "post",
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      author: post.author,
      categories: post.categories,
      tags: post.tags,
      body: finalBody,
      legacy: post.legacy,
    };

    if (coverAssetRef) {
      docToWrite.coverImage = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: coverAssetRef,
        },
        alt: coverAltText,
      };
    }

    preparedDocs.push(docToWrite);
  }

  // 3. Eksekusi batch transaksi per 50 dokumen (PRD Langkah C)
  const BATCH_SIZE = 50;

  for (let b = 0; b < preparedDocs.length; b += BATCH_SIZE) {
    const batch = preparedDocs.slice(b, b + BATCH_SIZE);
    console.log(`\n--- Menulis batch ${Math.floor(b / BATCH_SIZE) + 1} (${batch.length} dokumen) ---`);

    if (isDryRun) {
      for (const d of batch) {
        report.imported++;
        report.details.push({ id: d._id, title: d.title, slug: d.slug.current, status: "SIMULATED" });
      }
    } else {
      const transaction = client.transaction();
      for (const doc of batch) {
        transaction.createOrReplace(doc);
      }

      try {
        await transaction.commit();
        for (const d of batch) {
          report.imported++;
          report.details.push({ id: d._id, title: d.title, slug: d.slug.current, status: "IMPORTED" });
        }
        console.log(`✓ Batch ${Math.floor(b / BATCH_SIZE) + 1} berhasil disimpan dengan createOrReplace!`);
      } catch (commitErr: any) {
        console.error(`✗ Gagal menulis batch:`, commitErr.message);
        report.failed += batch.length;
      }
    }
  }

  // 4. Verifikasi jumlah akhir
  let finalCount = initialCount;
  if (!isDryRun) {
    finalCount = await client.fetch('count(*[_type == "post"])').catch(() => 0);
  }

  console.log(`\n============================================================`);
  console.log(`📊 LAPORAN HASIL MIGRASI BLOGGER KE SANITY`);
  console.log(`============================================================`);
  console.log(`Total Dokumen Diproses : ${report.totalProcessed}`);
  console.log(`Berhasil Diimpor       : ${report.imported}`);
  console.log(`Gagal                  : ${report.failed}`);
  console.log(`Aset Baru Diunggah     : ${report.imagesUploaded}`);
  console.log(`Aset Dari Cache        : ${report.imagesFromCache}`);
  console.log(`Gambar Tanpa Alt Khusus: ${report.imagesWithoutAlt.length}`);
  if (!isDryRun) {
    console.log(`Jumlah Dokumen Awal    : ${initialCount}`);
    console.log(`Jumlah Dokumen Akhir   : ${finalCount}`);
  }
  console.log(`============================================================\n`);

  return report;
}

// Eksekusi jika dipanggil via CLI
if (process.argv[1]?.endsWith("importer.ts") || process.argv[1]?.endsWith("importer.js")) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const confirmProduction = args.includes("--confirm-production");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;
  const datasetIdx = args.indexOf("--dataset");
  const dataset = datasetIdx !== -1 ? args[datasetIdx + 1] : undefined;

  runBloggerMigration({ dryRun, limit, dataset, confirmProduction }).catch((err) => {
    console.error("FATAL ERROR MIGRASI:", err.message);
    process.exit(1);
  });
}
