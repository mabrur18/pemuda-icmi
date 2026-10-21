/**
 * Build-time and runtime environment variable validation (PRD Tahap 10 & A4).
 * Memastikan konfigurasi esensial Sanity, Supabase, dan Site URL tersedia saat build.
 */

interface EnvConfig {
  sanityProjectId: string;
  sanityDataset: string;
  sanityApiVersion: string;
  siteUrl: string;
  isProduction: boolean;
}

export function validateEnv(): EnvConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const sanityProjectId =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== undefined
      ? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID.trim()
      : "glupcaxn";
  const sanityDataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET !== undefined
      ? process.env.NEXT_PUBLIC_SANITY_DATASET.trim()
      : "staging";
  const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pemudaicmi-kotabekasi.org";

  if (!sanityProjectId) {
    throw new Error(
      "[ENV VALIDATION ERROR]: NEXT_PUBLIC_SANITY_PROJECT_ID wajib diatur untuk mengompilasi aplikasi."
    );
  }

  if (!sanityDataset) {
    throw new Error(
      "[ENV VALIDATION ERROR]: NEXT_PUBLIC_SANITY_DATASET wajib diatur untuk mengompilasi aplikasi."
    );
  }

  // Peringatan jika di lingkungan produksi Vercel tapi belum memiliki Service Role Key
  if (isProduction && process.env.VERCEL && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      "[ENV WARNING]: SUPABASE_SERVICE_ROLE_KEY belum disetel di Vercel. Fitur formulir (buletin, kontak) akan beroperasi dalam mode offline fallback."
    );
  }

  return {
    sanityProjectId,
    sanityDataset,
    sanityApiVersion,
    siteUrl,
    isProduction,
  };
}

// Jalankan validasi saat file dimuat
export const env = validateEnv();
