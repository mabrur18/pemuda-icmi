import { describe, it, expect, beforeEach } from "vitest";
import {
  newsletterSchema,
  contactMessageSchema,
  eventRegistrationSchema,
} from "../apps/web/lib/validation";
import {
  checkRateLimit,
  _resetRateLimitMap,
  getClientIp,
} from "../apps/web/lib/rate-limit";
import {
  buildNewsletterUrls,
  generateNewsletterEmailHtml,
  sendNewsletterConfirmationEmail,
} from "../apps/web/lib/email";

describe("Tahap 7: Formulir & Data Pengunjung Tests (FR-601 s/d FR-603)", () => {
  beforeEach(() => {
    _resetRateLimitMap();
  });

  describe("1. Newsletter Validation & Anti-Enumeration (FR-601 & FR-603)", () => {
    it("should accept valid newsletter input with privacy consent", () => {
      const valid = {
        email: "ikhwan.cendekia@pemudaicmi.org",
        name: "Ikhwan Cendekia",
        source: "homepage_banner",
        privacyConsent: true,
      };

      const result = newsletterSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("ikhwan.cendekia@pemudaicmi.org");
      }
    });

    it("should reject invalid email format", () => {
      const invalid = {
        email: "bukan-alamat-email",
        privacyConsent: true,
      };

      const result = newsletterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
        expect(result.error.flatten().fieldErrors.email?.[0]).toContain(
          "Format alamat email tidak valid"
        );
      }
    });

    it("should reject when privacyConsent is false or missing (FR-603)", () => {
      const missingConsent = {
        email: "test@pemudaicmi.org",
        privacyConsent: false,
      };

      const result = newsletterSchema.safeParse(missingConsent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.privacyConsent).toBeDefined();
        expect(result.error.flatten().fieldErrors.privacyConsent?.[0]).toContain(
          "Kebijakan Privasi"
        );
      }
    });

    it("should trim and normalize email to lowercase", () => {
      const input = {
        email: "  PEMUDA.BEKASI@Domain.Com  ",
        privacyConsent: true,
      };

      const result = newsletterSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("pemuda.bekasi@domain.com");
      }
    });
  });

  describe("2. Contact Message Validation & Honeypot Spam Protection (FR-602 & FR-603)", () => {
    it("should accept valid contact form message", () => {
      const valid = {
        name: "Ahmad Fauzi",
        email: "ahmad.fauzi@example.org",
        subject: "Kerjasama Diskusi Cendekia",
        message: "Kami ingin mengundang Pemuda ICMI Kota Bekasi dalam seminar kepemudaan.",
        website_hp: "",
        privacyConsent: true,
      };

      const result = contactMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject if message is too short (< 10 chars)", () => {
      const short = {
        name: "Ahmad Fauzi",
        email: "ahmad.fauzi@example.org",
        message: "Pendek",
        privacyConsent: true,
      };

      const result = contactMessageSchema.safeParse(short);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.message?.[0]).toContain(
          "Pesan minimal 10 karakter"
        );
      }
    });

    it("should detect and reject spam when honeypot website_hp is filled", () => {
      const spambotPayload = {
        name: "Bot Spam",
        email: "spambot@promosi-kasino.com",
        message: "Klik tautan ini untuk mendapatkan uang instan sekarang juga!",
        website_hp: "https://spambot-link.com", // Jebakan honeypot
        privacyConsent: true,
      };

      const result = contactMessageSchema.safeParse(spambotPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.website_hp?.[0]).toContain(
          "Aktivitas spam terdeteksi"
        );
      }
    });

    it("should reject contact message without privacy consent", () => {
      const noConsent = {
        name: "Ahmad",
        email: "ahmad@example.org",
        message: "Pesan yang cukup panjang untuk memenuhi batas minimal karakter.",
        privacyConsent: false,
      };

      const result = contactMessageSchema.safeParse(noConsent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.privacyConsent).toBeDefined();
      }
    });
  });

  describe("3. Rate Limiter Invariant Tests (FR-602, NFR-03)", () => {
    it("should allow requests up to the configured limit", () => {
      const ip = "192.168.1.100";
      const limit = 5;

      for (let i = 1; i <= limit; i++) {
        const res = checkRateLimit(ip, { limit, windowMs: 60000 });
        expect(res.success).toBe(true);
        expect(res.remaining).toBe(limit - i);
      }
    });

    it("should block the 6th request when limit is 5", () => {
      const ip = "192.168.1.101";
      const limit = 5;

      for (let i = 0; i < limit; i++) {
        checkRateLimit(ip, { limit, windowMs: 60000 });
      }

      // Request ke-6 harus ditolak
      const blockedRes = checkRateLimit(ip, { limit, windowMs: 60000 });
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.remaining).toBe(0);
      expect(blockedRes.resetAt).toBeGreaterThan(Date.now());
    });

    it("should isolate limits between different IP addresses", () => {
      const ipA = "10.0.0.1";
      const ipB = "10.0.0.2";

      // Habiskan kuota IP A
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ipA, { limit: 5 });
      }
      expect(checkRateLimit(ipA, { limit: 5 }).success).toBe(false);

      // IP B masih memiliki kuota penuh
      const resB = checkRateLimit(ipB, { limit: 5 });
      expect(resB.success).toBe(true);
      expect(resB.remaining).toBe(4);
    });

    it("should extract client IP from x-forwarded-for header", () => {
      const req = new Request("http://localhost:3000/api/contact", {
        headers: {
          "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
        },
      });

      const ip = getClientIp(req);
      expect(ip).toBe("203.0.113.195");
    });
  });

  describe("4. Email Service & Double Opt-in URL Generation (FR-601)", () => {
    it("should construct valid confirmation and unsubscribe URLs", () => {
      const siteUrl = "https://pemudaicmi-kotabekasi.org";
      const token = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

      const urls = buildNewsletterUrls(siteUrl, token);
      expect(urls.confirmationUrl).toBe(
        "https://pemudaicmi-kotabekasi.org/api/newsletter/confirm?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      );
      expect(urls.unsubscribeUrl).toBe(
        "https://pemudaicmi-kotabekasi.org/api/newsletter/unsubscribe?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      );
    });

    it("should render branded HTML email containing greeting, URLs, and legal footer", () => {
      const html = generateNewsletterEmailHtml({
        email: "anggota@pemudaicmi.org",
        name: "Ahmad",
        confirmationUrl: "http://localhost:3000/api/newsletter/confirm?token=xyz",
        unsubscribeUrl: "http://localhost:3000/api/newsletter/unsubscribe?token=xyz",
      });

      expect(html).toContain("Pemuda ICMI Kota Bekasi");
      expect(html).toContain("Ahmad");
      expect(html).toContain("anggota@pemudaicmi.org");
      expect(html).toContain("http://localhost:3000/api/newsletter/confirm?token=xyz");
      expect(html).toContain("http://localhost:3000/api/newsletter/unsubscribe?token=xyz");
    });

    it("should execute mock email provider without error and return success", async () => {
      const result = await sendNewsletterConfirmationEmail({
        email: "test.subscriber@example.org",
        name: "Test Subscriber",
        confirmToken: "mock-token-uuid-12345",
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe("mock");
      expect(result.confirmationUrl).toContain("mock-token-uuid-12345");
    });
  });

  describe("5. Event Registration Validation (FR-701 & FR-603)", () => {
    it("should accept valid event registration with Indonesian phone number", () => {
      const valid = {
        eventSanityId: "event-silaturahmi-akbar-2026",
        fullName: "Budi Santoso",
        email: "budi.santoso@example.com",
        phone: "+6281234567890",
        organization: "Universitas Islam 45 Bekasi",
        privacyConsent: true,
      };

      const result = eventRegistrationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should accept 08-prefix phone number", () => {
      const valid = {
        eventSanityId: "event-silaturahmi-akbar-2026",
        fullName: "Budi Santoso",
        email: "budi.santoso@example.com",
        phone: "081234567890",
        privacyConsent: true,
      };

      const result = eventRegistrationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid phone number format", () => {
      const invalid = {
        eventSanityId: "event-silaturahmi-akbar-2026",
        fullName: "Budi Santoso",
        email: "budi.santoso@example.com",
        phone: "telepon-bukan-nomor",
        privacyConsent: true,
      };

      const result = eventRegistrationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.phone?.[0]).toContain(
          "Format nomor telepon tidak valid"
        );
      }
    });
  });
});
