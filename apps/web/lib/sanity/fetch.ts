import { client } from "./client";
import type { QueryParams } from "@sanity/client";

/**
 * Type-safe Sanity fetch with Next.js ISR and tag-based on-demand revalidation.
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
  return client.fetch<T>(query, params, {
    next: {
      revalidate: tags.length > 0 ? undefined : revalidate,
      tags,
    },
  });
}
