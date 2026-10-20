import { z } from "zod";

/**
 * Validasi Formulir Buletin (Newsletter) - FR-601 & FR-603
 */
export const newsletterSchema = z.object({
  email: z
    .string({ required_error: "Alamat email wajib diisi" })
    .trim()
    .toLowerCase()
    .email("Format alamat email tidak valid"),
  name: z.string().trim().max(100, "Nama maksimal 100 karakter").optional(),
  source: z.string().trim().max(50).optional(),
  privacyConsent: z.literal(true, {
    errorMap: () => ({
      message: "Anda wajib menyetujui Kebijakan Privasi untuk berlangganan buletin.",
    }),
  }),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * Validasi Formulir Kontak - FR-602 & FR-603
 */
export const contactMessageSchema = z.object({
  name: z
    .string({ required_error: "Nama lengkap wajib diisi" })
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z
    .string({ required_error: "Alamat email wajib diisi" })
    .trim()
    .toLowerCase()
    .email("Format alamat email tidak valid"),
  subject: z.string().trim().max(150, "Subjek maksimal 150 karakter").optional(),
  message: z
    .string({ required_error: "Pesan wajib diisi" })
    .trim()
    .min(10, "Pesan minimal 10 karakter")
    .max(3000, "Pesan maksimal 3.000 karakter"),
  // Honeypot field untuk penangkal spam otomatis tanpa captcha yang mengganggu
  website_hp: z
    .string()
    .max(0, "Aktivitas spam terdeteksi")
    .optional()
    .or(z.literal("")),
  privacyConsent: z.literal(true, {
    errorMap: () => ({
      message: "Anda wajib menyetujui Kebijakan Privasi untuk mengirim pesan.",
    }),
  }),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

/**
 * Validasi Formulir Pendaftaran Kegiatan (Event Registration) - FR-701 & FR-603
 */
export const eventRegistrationSchema = z.object({
  eventSanityId: z
    .string({ required_error: "ID kegiatan wajib disertakan" })
    .trim()
    .min(1, "ID kegiatan tidak valid"),
  fullName: z
    .string({ required_error: "Nama lengkap wajib diisi" })
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(120, "Nama lengkap maksimal 120 karakter"),
  email: z
    .string({ required_error: "Alamat email wajib diisi" })
    .trim()
    .toLowerCase()
    .email("Format alamat email tidak valid"),
  phone: z
    .string({ required_error: "Nomor WhatsApp / telepon wajib diisi" })
    .trim()
    .regex(
      /^(\+62|62|0)[0-9]{8,15}$/,
      "Format nomor telepon tidak valid (contoh: 08123456789 atau +628123456789)"
    ),
  organization: z
    .string()
    .trim()
    .max(150, "Nama instansi/organisasi maksimal 150 karakter")
    .optional(),
  extra: z.record(z.unknown()).optional().default({}),
  privacyConsent: z.literal(true, {
    errorMap: () => ({
      message: "Anda wajib menyetujui Kebijakan Privasi untuk mendaftar kegiatan.",
    }),
  }),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
