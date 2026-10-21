import fs from "fs";
import path from "path";

interface RedirectCheckResult {
  url: string;
  expectedDestination?: string;
  actualStatus: number;
  location?: string;
  finalStatus?: number;
  finalUrl?: string;
  hops: number;
  passed: boolean;
  error?: string;
}

export async function checkRedirects(options: {
  baseUrl?: string;
  urlsFilePath?: string;
  sampleWithQueryParams?: boolean;
}): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: RedirectCheckResult[];
}> {
  const baseUrl = (options.baseUrl || process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const filePath = options.urlsFilePath || path.resolve("./scripts/qa/blogger-urls.txt");

  if (!fs.existsSync(filePath)) {
    throw new Error(`Berkas URL tidak ditemukan di: ${filePath}`);
  }

  const rawLines = fs.readFileSync(filePath, "utf-8").split("\n");
  const rawUrls = rawLines.map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));

  // Tambahkan variasi parameter query ?m=1 dan ?m=0 untuk menguji NFR single hop
  const urlsToTest: string[] = [];
  for (const u of rawUrls) {
    urlsToTest.push(u);
    if (options.sampleWithQueryParams) {
      urlsToTest.push(`${u}?m=1`);
      urlsToTest.push(`${u}?m=0`);
    }
  }

  console.log(`\n============================================================`);
  console.log(`🔍 QA PEMERIKSAAN REDIRECT OTOMATIS (PRD FR-302)`);
  console.log(`Target Base URL : ${baseUrl}`);
  console.log(`Total URL Diuji : ${urlsToTest.length}`);
  console.log(`Syarat Kelulusan: Status 200 dalam SATU lompatan (single hop)`);
  console.log(`============================================================\n`);

  const results: RedirectCheckResult[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < urlsToTest.length; i++) {
    const rawPath = urlsToTest[i];
    const initialUrl = `${baseUrl}${rawPath.startsWith("/") ? "" : "/"}${rawPath}`;

    let hops = 0;
    let currentUrl = initialUrl;
    let finalStatus = 0;
    let initialStatus = 0;
    let firstLocation: string | undefined = undefined;

    try {
      // Step 1: Hop pertama dengan redirect manual
      const resp1 = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
      });

      initialStatus = resp1.status;

      if ([301, 302, 307, 308].includes(initialStatus)) {
        hops = 1;
        firstLocation = resp1.headers.get("location") || "";
        currentUrl = new URL(firstLocation, baseUrl).toString();

        // Step 2: Cek apakah halaman tujuan langsung menghasilkan 200
        const resp2 = await fetch(currentUrl, {
          method: "GET",
          redirect: "manual",
        });

        finalStatus = resp2.status;

        // Jika halaman tujuan masih mengalihkan lagi (hops > 1), tandai sebagai kegagalan
        if ([301, 302, 307, 308].includes(finalStatus)) {
          hops = 2; // Lebih dari 1 hop
        }
      } else if (initialStatus === 200) {
        // Halaman langsung 200 (tanpa redirect)
        hops = 0;
        finalStatus = 200;
      } else {
        finalStatus = initialStatus;
      }

      // Kelulusan PRD FR-302:
      // URL lawas Blogger wajib menghasilkan redirect dalam tepat 1 hop dan berujung status 200
      const isPassed = hops === 1 && finalStatus === 200;

      if (isPassed) {
        passedCount++;
        results.push({
          url: rawPath,
          actualStatus: initialStatus,
          location: firstLocation,
          finalStatus,
          finalUrl: currentUrl,
          hops,
          passed: true,
        });
        console.log(`✓ [200 OK via 1 HOP] ${rawPath} -> ${firstLocation}`);
      } else {
        failedCount++;
        const reason =
          hops > 1
            ? `GAGAL: Membutuhkan ${hops} lompatan (lebih dari 1 hop)`
            : finalStatus !== 200
            ? `GAGAL: Halaman tujuan menghasilkan status ${finalStatus} (bukan 200)`
            : `GAGAL: Tidak dialihkan (status ${initialStatus})`;

        results.push({
          url: rawPath,
          actualStatus: initialStatus,
          location: firstLocation,
          finalStatus,
          finalUrl: currentUrl,
          hops,
          passed: false,
          error: reason,
        });
        console.error(`✗ [${reason}] ${rawPath} -> ${firstLocation || "-"}`);
      }
    } catch (err: any) {
      failedCount++;
      results.push({
        url: rawPath,
        actualStatus: 0,
        hops: 0,
        passed: false,
        error: `Network/Fetch Error: ${err.message}`,
      });
      console.error(`✗ [ERROR] ${rawPath}: ${err.message}`);
    }
  }

  console.log(`\n============================================================`);
  console.log(`📊 LAPORAN AKHIR PEMERIKSAAN REDIRECT`);
  console.log(`Total Diuji : ${urlsToTest.length}`);
  console.log(`Lulus       : ${passedCount}`);
  console.log(`Gagal       : ${failedCount}`);
  console.log(`Tingkat Mutu: ${((passedCount / urlsToTest.length) * 100).toFixed(1)}%`);
  console.log(`============================================================\n`);

  return {
    total: urlsToTest.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrlArg = args.find((a) => a.startsWith("--base-url="))?.split("=")[1];
  const withQueryArg = args.includes("--with-queries");

  const res = await checkRedirects({
    baseUrl: baseUrlArg,
    sampleWithQueryParams: withQueryArg,
  });

  if (res.failed > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes("check-redirects.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
