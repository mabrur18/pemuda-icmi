import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import nextConfig from "../apps/web/next.config";
import { validateEnv } from "../apps/web/lib/env";

describe("Tahap 10: Kesiapan Produksi & Cutover (A4, A11, NFR-01 s/d NFR-11)", () => {
  describe("1. Header Keamanan Ketat (NFR-03 & A4)", () => {
    it("should configure strict security headers in next.config.ts", async () => {
      expect(typeof nextConfig.headers).toBe("function");
      const headersConfig = await nextConfig.headers!();
      expect(Array.isArray(headersConfig)).toBe(true);

      const rootHeaders = headersConfig.find((h) => h.source === "/:path*");
      expect(rootHeaders).toBeDefined();

      const headerMap = new Map(rootHeaders?.headers.map((h) => [h.key, h.value]));

      // HSTS (Strict-Transport-Security)
      expect(headerMap.get("Strict-Transport-Security")).toContain("max-age=63072000");
      expect(headerMap.get("Strict-Transport-Security")).toContain("includeSubDomains");
      expect(headerMap.get("Strict-Transport-Security")).toContain("preload");

      // X-Content-Type-Options
      expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");

      // X-Frame-Options
      expect(headerMap.get("X-Frame-Options")).toBe("DENY");

      // Referrer-Policy
      expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");

      // Permissions-Policy
      expect(headerMap.get("Permissions-Policy")).toContain("camera=()");
      expect(headerMap.get("Permissions-Policy")).toContain("microphone=()");

      // Content Security Policy (Report-Only mode for AdSense & Analytics compatibility)
      const csp = headerMap.get("Content-Security-Policy-Report-Only");
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("pagead2.googlesyndication.com");
      expect(csp).toContain("report-uri /api/csp-report");
    });

    it("should have /api/csp-report route handler to capture violations", () => {
      const cspRoutePath = path.resolve("./apps/web/app/api/csp-report/route.ts");
      expect(fs.existsSync(cspRoutePath)).toBe(true);
      const content = fs.readFileSync(cspRoutePath, "utf-8");
      expect(content).toContain("export async function POST");
      expect(content).toContain("CSP REPORT-ONLY VIOLATION");
    });
  });

  describe("2. Validasi Variabel Lingkungan Build-Time", () => {
    it("should validate and return core environment configuration", () => {
      const config = validateEnv();
      expect(config.sanityProjectId).toBeDefined();
      expect(config.sanityDataset).toBeDefined();
      expect(config.siteUrl).toBeDefined();
    });

    it("should throw error if Sanity Project ID is empty", () => {
      const original = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "";
      expect(() => validateEnv()).toThrow("NEXT_PUBLIC_SANITY_PROJECT_ID");
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = original;
    });
  });

  describe("3. Konfigurasi Lighthouse CI (.lighthouserc.json)", () => {
    it("should have .lighthouserc.json with >= 90 score thresholds for SEO & Accessibility", () => {
      const lhciPath = path.resolve("./.lighthouserc.json");
      expect(fs.existsSync(lhciPath)).toBe(true);
      const lhci = JSON.parse(fs.readFileSync(lhciPath, "utf-8"));

      expect(lhci.ci?.collect?.url?.length).toBeGreaterThanOrEqual(3);
      expect(lhci.ci?.assert?.assertions["categories:accessibility"]).toEqual(["error", { minScore: 0.9 }]);
      expect(lhci.ci?.assert?.assertions["categories:seo"]).toEqual(["error", { minScore: 0.9 }]);
    });
  });

  describe("4. Komponen Observabilitas (Speed Insights & GA4)", () => {
    it("should have SpeedInsights and GoogleAnalytics components ready", () => {
      const gaPath = path.resolve("./apps/web/components/analytics/GoogleAnalytics.tsx");
      const speedInsightsPath = path.resolve("./apps/web/components/analytics/SpeedInsights.tsx");

      expect(fs.existsSync(gaPath)).toBe(true);
      expect(fs.existsSync(speedInsightsPath)).toBe(true);

      const gaContent = fs.readFileSync(gaPath, "utf-8");
      expect(gaContent).toContain("pointerdown");
      expect(gaContent).toContain("scroll");
      expect(gaContent).toContain("googletagmanager.com");
    });
  });

  describe("5. Pencadangan Dataset Sanity & Pemulihan Bencana (NFR-09)", () => {
    it("should have export-sanity scripts and disaster recovery documentation", () => {
      const scriptTs = path.resolve("./scripts/backup/export-sanity.ts");
      const scriptSh = path.resolve("./scripts/backup/export-sanity.sh");
      const docPath = path.resolve("./docs/BACKUP_AND_RECOVERY.md");

      expect(fs.existsSync(scriptTs)).toBe(true);
      expect(fs.existsSync(scriptSh)).toBe(true);
      expect(fs.existsSync(docPath)).toBe(true);

      const doc = fs.readFileSync(docPath, "utf-8");
      expect(doc).toContain("sanity dataset import");
      expect(doc).toContain("Rencana Pemulihan & Rollback DNS");
    });
  });

  describe("6. ads.txt & Status Penayang Iklan (FR-502)", () => {
    it("should serve a valid ads.txt file from public root", () => {
      const adsTxtPath = path.resolve("./apps/web/public/ads.txt");
      expect(fs.existsSync(adsTxtPath)).toBe(true);
      const content = fs.readFileSync(adsTxtPath, "utf-8");
      expect(content).toContain("google.com");
      expect(content).toContain("DIRECT");
      expect(content).toContain("f08c47fec0942fa0");
    });
  });
});
