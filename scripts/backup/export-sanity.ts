import fs from "fs";
import path from "path";
import https from "https";

// 1. Muat variabel lingkungan
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
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

export async function exportSanityDataset(options: { dataset?: string; outputDir?: string } = {}) {
  const dataset = options.dataset || process.env.NEXT_PUBLIC_SANITY_DATASET || "staging";
  const outputDir = options.outputDir || path.resolve("./backups");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `sanity-${projectId}-${dataset}-${timestamp}.tar.gz`;
  const filePath = path.join(outputDir, fileName);

  console.log(`\n============================================================`);
  console.log(`📦 EKSPOR DATASET SANITY OTOMATIS (PRD NFR-09 & Tahap 10)`);
  console.log(`Project ID : ${projectId}`);
  console.log(`Dataset    : ${dataset}`);
  console.log(`Target File: ${filePath}`);
  console.log(`============================================================\n`);

  if (!token) {
    throw new Error(
      "Gagal ekspor: Token Sanity (SANITY_API_WRITE_TOKEN atau SANITY_API_READ_TOKEN) tidak ditemukan di apps/web/.env.local!"
    );
  }

  const exportUrl = `https://${projectId}.api.sanity.io/v2024-01-01/data/export/${dataset}`;

  return new Promise<string>((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);

    const req = https.get(
      exportUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Encoding": "gzip",
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          fileStream.close();
          fs.unlinkSync(filePath);
          return reject(
            new Error(`Sanity export API gagal dengan HTTP ${res.statusCode}: ${res.statusMessage}`)
          );
        }

        let downloadedBytes = 0;
        res.on("data", (chunk) => {
          downloadedBytes += chunk.length;
        });

        res.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          console.log(`✓ Ekspor berhasil diselesaikan!`);
          console.log(`  Ukuran arsip: ${(downloadedBytes / 1024).toFixed(2)} KB`);
          console.log(`  Lokasi berkas: ${filePath}\n`);
          resolve(filePath);
        });
      }
    );

    req.on("error", (err) => {
      fileStream.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const datasetArg = args.find((a) => a.startsWith("--dataset="))?.split("=")[1];
  await exportSanityDataset({ dataset: datasetArg });
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes("export-sanity.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
