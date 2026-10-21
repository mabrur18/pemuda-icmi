import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import nextConfig from "../apps/web/next.config";

describe("Tahap 9: Pemetaan Redirect & QA URL (FR-302)", () => {
  const redirectMapPath = path.resolve("./scripts/migrate/out/redirect_map.json");
  const sqlSeedPath = path.resolve("./supabase/seed_redirect_map.sql");
  const qaUrlsPath = path.resolve("./scripts/qa/blogger-urls.txt");

  describe("1. Artefak Redirect Map & SQL Seed", () => {
    it("should have generated redirect_map.json with valid structure", () => {
      expect(fs.existsSync(redirectMapPath)).toBe(true);
      const redirects = JSON.parse(fs.readFileSync(redirectMapPath, "utf-8"));
      expect(Array.isArray(redirects)).toBe(true);
      expect(redirects.length).toBeGreaterThanOrEqual(40);

      // Pastikan setiap entri memiliki blogger_path dan new_path
      for (const entry of redirects) {
        expect(entry.blogger_path).toBeDefined();
        expect(entry.blogger_path.startsWith("/")).toBe(true);
        expect(entry.new_path).toBeDefined();
        expect(entry.new_path.startsWith("/")).toBe(true);
        expect(entry.status).toBe("mapped");
      }
    });

    it("should generate seed_redirect_map.sql with idempotent upsert statements", () => {
      expect(fs.existsSync(sqlSeedPath)).toBe(true);
      const sql = fs.readFileSync(sqlSeedPath, "utf-8");
      expect(sql).toContain("INSERT INTO redirect_map");
      expect(sql).toContain("ON CONFLICT (blogger_path) DO UPDATE");
    });

    it("should have blogger-urls.txt ready for automated QA", () => {
      expect(fs.existsSync(qaUrlsPath)).toBe(true);
      const urls = fs
        .readFileSync(qaUrlsPath, "utf-8")
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
      expect(urls.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe("2. Konfigurasi Redirects di next.config.ts", () => {
    it("should declare permanent redirects in next.config.ts", async () => {
      expect(typeof nextConfig.redirects).toBe("function");
      const rules = await nextConfig.redirects!();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThanOrEqual(10);

      // Semua redirect wajib permanen (308) sesuai PRD FR-302
      for (const rule of rules) {
        expect(rule.permanent).toBe(true);
      }
    });

    it("should include regex pattern for /:year/:month/:slug.html to /berita/:slug", async () => {
      const rules = await nextConfig.redirects!();
      const articleRule = rules.find((r) =>
        r.source.includes(":year") && r.source.includes(":month") && r.source.includes(".html")
      );
      expect(articleRule).toBeDefined();
      expect(articleRule?.destination).toBe("/berita/:slug");
      expect(articleRule?.permanent).toBe(true);
    });

    it("should map static legacy pages to clean modern paths", async () => {
      const rules = await nextConfig.redirects!();
      const findRule = (src: string) => rules.find((r) => r.source === src);

      expect(findRule("/p/about-us.html")?.destination).toBe("/tentang-kami");
      expect(findRule("/p/pengurus.html")?.destination).toBe("/susunan-pengurus");
      expect(findRule("/p/daftar-isi.html")?.destination).toBe("/berita");
      expect(findRule("/feeds/posts/default")?.destination).toBe("/rss.xml");
      expect(findRule("/search")?.destination).toBe("/cari");
    });

    it("should map legacy Blogger search labels to categories and tags", async () => {
      const rules = await nextConfig.redirects!();
      const findRule = (src: string) => rules.find((r) => r.source === src);

      expect(findRule("/search/label/Aktivitas")?.destination).toBe("/kategori/kegiatan");
      expect(findRule("/search/label/Artikel")?.destination).toBe("/kategori/berita-utama");
      expect(findRule("/search/label/Opini")?.destination).toBe("/kategori/opini-cendekia");
      expect(findRule("/search/label/Pendidikan")?.destination).toBe("/kategori/kaderisasi");
      expect(findRule("/search/label/Neurosains")?.destination).toBe("/tag/cendekia-muda");
      expect(findRule("/search/label/Epistemologi")?.destination).toBe("/tag/cendekia-muda");
    });
  });

  describe("3. Middleware Logic & Query Stripping Simulation", () => {
    it("should verify middleware file exists and exports middleware & config matcher", async () => {
      const middlewarePath = path.resolve("./apps/web/middleware.ts");
      expect(fs.existsSync(middlewarePath)).toBe(true);
      const content = fs.readFileSync(middlewarePath, "utf-8");
      expect(content).toContain("export function middleware");
      expect(content).toContain("searchParams.delete");
      expect(content).toContain("308");
    });
  });
});
