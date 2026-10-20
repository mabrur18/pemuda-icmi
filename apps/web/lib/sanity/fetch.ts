import { client } from "./client";
import type { QueryParams } from "@sanity/client";

/**
 * Type-safe Sanity fetch with Next.js ISR and tag-based on-demand revalidation.
 * Dilengkapi mekanisme retry otomatis untuk mengatasi latensi jaringan/connect timeout (NFR-02).
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 3600,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.fetch<T>(query, params, {
        next: {
          revalidate: tags.length > 0 ? undefined : revalidate,
          tags,
        },
      });
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }

      console.warn(
        `[SANITY FETCH RETRY ${attempt}/${maxRetries}]: ${error?.message || error}. Mencoba kembali...`
      );
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  throw new Error("Sanity fetch failed after maximum retries");
}
