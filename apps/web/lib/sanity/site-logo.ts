import { sanityFetch } from "./fetch";
import { SITE_SETTINGS_QUERY } from "./queries";
import { urlForImage } from "./image";

export interface SiteLogo {
  url: string;
  alt: string;
}

/**
 * Reads the organisation logo from siteSettings (tag "siteSettings", so the
 * Sanity webhook refreshes it right after publish). Returns null when no logo
 * is set or Sanity is unreachable; callers then render the built-in fallback.
 */
export async function getSiteLogo(): Promise<SiteLogo | null> {
  try {
    const settings = await sanityFetch<{
      siteName?: string;
      logo?: { asset?: unknown; alt?: string } | null;
    } | null>({
      query: SITE_SETTINGS_QUERY,
      tags: ["siteSettings"],
    });

    if (!settings?.logo?.asset) return null;

    return {
      url: urlForImage(settings.logo as Parameters<typeof urlForImage>[0])
        .height(160)
        .url(),
      alt: settings.logo.alt || settings.siteName || "Pemuda ICMI Kota Bekasi",
    };
  } catch {
    return null;
  }
}
