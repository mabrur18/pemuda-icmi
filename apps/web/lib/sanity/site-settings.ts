import { sanityFetch } from "./fetch";
import { SITE_SETTINGS_QUERY } from "./queries";

export interface SiteContact {
  address: string;
  email: string;
  phone: string;
  /** Nomor telepon dalam format digit saja (62...) untuk tautan WhatsApp/tel. */
  phoneDigits: string;
  social: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
  };
}

/** Nilai cadangan bila field di Studio belum diisi atau Sanity tidak dapat dijangkau. */
const FALLBACK: SiteContact = {
  address: "Kota Bekasi, Jawa Barat, Indonesia",
  email: "kontak@pemudaicmi-kotabekasi.org",
  phone: "+62 812-3456-7890",
  phoneDigits: "6281234567890",
  social: {},
};

function toPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

/**
 * Membaca profil & kontak organisasi dari siteSettings (tag "siteSettings",
 * sehingga webhook Sanity menyegarkannya setelah publish).
 */
export async function getSiteContact(): Promise<SiteContact> {
  try {
    const settings = await sanityFetch<{
      organization?: {
        address?: string;
        email?: string;
        phone?: string;
        socialLinks?: SiteContact["social"];
      } | null;
    } | null>({
      query: SITE_SETTINGS_QUERY,
      tags: ["siteSettings"],
    });

    const org = settings?.organization;
    const phone = org?.phone?.trim() || FALLBACK.phone;

    return {
      address: org?.address?.trim() || FALLBACK.address,
      email: org?.email?.trim() || FALLBACK.email,
      phone,
      phoneDigits: toPhoneDigits(phone) || FALLBACK.phoneDigits,
      social: {
        instagram: org?.socialLinks?.instagram || undefined,
        youtube: org?.socialLinks?.youtube || undefined,
        facebook: org?.socialLinks?.facebook || undefined,
        twitter: org?.socialLinks?.twitter || undefined,
      },
    };
  } catch {
    return FALLBACK;
  }
}
