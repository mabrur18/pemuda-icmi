import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { shouldRenderAdsense } from "../apps/web/components/ads/AdsenseScript";
import { injectAdSlotIntoBlocks } from "../apps/web/components/sanity/PortableTextRenderer";

describe("Tahap 6: AdSense & ads.txt Tests (FR-501 s/d FR-504)", () => {
  describe("AdsenseScript Render Conditions (FR-501)", () => {
    it("should NOT render script in development environment", () => {
      const result = shouldRenderAdsense({
        isProduction: false,
        enabled: true,
        publisherId: "pub-1234567890123456",
      });
      expect(result).toBe(false);
    });

    it("should NOT render script if adsense is disabled in siteSettings", () => {
      const result = shouldRenderAdsense({
        isProduction: true,
        enabled: false,
        publisherId: "pub-1234567890123456",
      });
      expect(result).toBe(false);
    });

    it("should NOT render script if publisherId is missing or invalid", () => {
      const resultEmpty = shouldRenderAdsense({
        isProduction: true,
        enabled: true,
        publisherId: "",
      });
      expect(resultEmpty).toBe(false);

      const resultInvalid = shouldRenderAdsense({
        isProduction: true,
        enabled: true,
        publisherId: "invalid-id",
      });
      expect(resultInvalid).toBe(false);
    });

    it("should NOT render script on noindex or 404 pages", () => {
      const resultNoIndex = shouldRenderAdsense({
        isProduction: true,
        enabled: true,
        publisherId: "pub-1234567890123456",
        isNoIndex: true,
      });
      expect(resultNoIndex).toBe(false);

      const result404 = shouldRenderAdsense({
        isProduction: true,
        enabled: true,
        publisherId: "pub-1234567890123456",
        is404: true,
      });
      expect(result404).toBe(false);
    });

    it("should NOT render script on search (/cari) or api routes", () => {
      const resultCari = shouldRenderAdsense({
        isProduction: true,
        enabled: true,
        publisherId: "pub-1234567890123456",
        pathname: "/cari?q=pemuda",
      });
      expect(resultCari).toBe(false);

      const resultApi = shouldRenderAdsense({
        isProduction: true,
        enabled: true,
        publisherId: "pub-1234567890123456",
        pathname: "/api/revalidate",
      });
      expect(resultApi).toBe(false);
    });

    it("should render script when all production conditions are met", () => {
      const result = shouldRenderAdsense({
        isProduction: true,
        enabled: true,
        publisherId: "pub-1234567890123456",
        pathname: "/berita/pelantikan-pengurus-daerah",
      });
      expect(result).toBe(true);
    });
  });

  describe("In-Article Ad Injection (FR-503)", () => {
    it("should automatically inject adSlot after paragraph N", () => {
      const blocks = [
        { _key: "b1", _type: "block", style: "normal", children: [{ text: "P1" }] },
        { _key: "b2", _type: "block", style: "normal", children: [{ text: "P2" }] },
        { _key: "b3", _type: "block", style: "normal", children: [{ text: "P3" }] },
        { _key: "b4", _type: "block", style: "normal", children: [{ text: "P4" }] },
      ];

      const injected = injectAdSlotIntoBlocks(blocks, 3, "slot-1234");
      expect(injected).toHaveLength(5);
      expect(injected[3]).toEqual({
        _key: "auto-injected-ad-p3",
        _type: "adSlot",
        position: "inArticle",
        slotId: "slot-1234",
      });
    });

    it("should NOT inject adSlot if a manual adSlot already exists", () => {
      const blocks = [
        { _key: "b1", _type: "block", style: "normal", children: [{ text: "P1" }] },
        { _key: "m1", _type: "adSlot", position: "inArticle", slotId: "custom" },
        { _key: "b2", _type: "block", style: "normal", children: [{ text: "P2" }] },
      ];

      const result = injectAdSlotIntoBlocks(blocks, 1);
      expect(result).toHaveLength(3);
    });
  });

  describe("ads.txt Verification (FR-502)", () => {
    it("should have public/ads.txt conforming to Google authorized digital sellers format", () => {
      const adsTxtPath = path.resolve(__dirname, "../apps/web/public/ads.txt");
      expect(fs.existsSync(adsTxtPath)).toBe(true);

      const content = fs.readFileSync(adsTxtPath, "utf-8");
      expect(content).toContain("google.com");
      expect(content).toContain("DIRECT");
      expect(content).toContain("f08c47fec0942fa0");
    });
  });
});
