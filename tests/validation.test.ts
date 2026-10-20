import { describe, it, expect } from "vitest";
import {
  newsletterSchema,
  contactMessageSchema,
  eventRegistrationSchema,
} from "../apps/web/lib/validation";

describe("Form Validation Schemas (Zod)", () => {
  describe("Newsletter Schema (FR-601, FR-603)", () => {
    it("should accept valid subscriber input", () => {
      const result = newsletterSchema.safeParse({
        email: "Kader.Muda@example.com",
        name: "Ahmad Fauzi",
        privacyConsent: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("kader.muda@example.com"); // toLowerCase check
      }
    });

    it("should reject invalid email format", () => {
      const result = newsletterSchema.safeParse({
        email: "bukan-email-valid",
        privacyConsent: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Format alamat email tidak valid");
      }
    });

    it("should reject when privacyConsent is false or missing (FR-603)", () => {
      const result = newsletterSchema.safeParse({
        email: "kader@example.com",
        privacyConsent: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Kebijakan Privasi");
      }
    });
  });

  describe("Contact Message Schema (FR-602, FR-603)", () => {
    it("should accept valid contact submission", () => {
      const result = contactMessageSchema.safeParse({
        name: "Muhammad Ali",
        email: "ali@example.com",
        subject: "Undangan Kolaborasi Kajian",
        message: "Assalamu'alaikum, kami ingin mengundang Pemuda ICMI untuk mengisi seminar.",
        website_hp: "", // Honeypot empty
        privacyConsent: true,
      });

      expect(result.success).toBe(true);
    });

    it("should reject message shorter than 10 characters", () => {
      const result = contactMessageSchema.safeParse({
        name: "Muhammad Ali",
        email: "ali@example.com",
        message: "Halo",
        privacyConsent: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimal 10 karakter");
      }
    });

    it("should trigger spam rejection when honeypot is populated", () => {
      const result = contactMessageSchema.safeParse({
        name: "Spam Bot",
        email: "bot@spammer.com",
        message: "Jual obat herbal berkualitas hubungi kami segera.",
        website_hp: "https://spam-link.ru", // Bot filled honeypot
        privacyConsent: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("spam");
      }
    });
  });

  describe("Event Registration Schema (FR-701, FR-603)", () => {
    it("should accept valid event registration", () => {
      const result = eventRegistrationSchema.safeParse({
        eventSanityId: "event-123",
        fullName: "Fatimah Azzahra",
        email: "fatimah@example.com",
        phone: "081234567890",
        organization: "Universitas Islam 45 Bekasi",
        privacyConsent: true,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid Indonesian phone number", () => {
      const result = eventRegistrationSchema.safeParse({
        eventSanityId: "event-123",
        fullName: "Fatimah Azzahra",
        email: "fatimah@example.com",
        phone: "12345", // invalid phone
        privacyConsent: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("nomor telepon tidak valid");
      }
    });

    it("should reject missing eventSanityId", () => {
      const result = eventRegistrationSchema.safeParse({
        eventSanityId: "",
        fullName: "Fatimah Azzahra",
        email: "fatimah@example.com",
        phone: "+6281234567890",
        privacyConsent: true,
      });

      expect(result.success).toBe(false);
    });
  });
});
