import { client, token } from "./client";
import type { QueryParams } from "@sanity/client";
import { draftMode } from "next/headers";

/**
 * Type-safe Sanity fetch with Next.js ISR, tag-based on-demand revalidation,
 * and live draft preview (Draft Mode) for published & unpublished content.
 * Dilengkapi mekanisme retry otomatis untuk mengatasi latensi jaringan (NFR-02).
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 60,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  let isDraft = false;
  try {
    const draft = await draftMode();
    isDraft = draft.isEnabled;
  } catch {
    // draftMode() may throw during static build generation; fallback to published mode
    isDraft = false;
  }

  // When Draft Mode is active, fetch draft perspectives without cache using read token
  const fetchClient = isDraft
    ? client.withConfig({
        perspective: "previewDrafts",
        useCdn: false,
        token: token,
      })
    : client;

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchClient.fetch<T>(query, params, {
        next: {
          // If in draft mode: revalidate 0 (no cache, live reflection).
          // If in published mode: revalidate every 60s as safety fallback even with tags.
          revalidate: isDraft ? 0 : (tags.length > 0 ? (revalidate || 60) : revalidate),
          tags: isDraft ? [] : tags,
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
