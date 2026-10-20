import { createClient } from "next-sanity";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "glupcaxn";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "staging";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Ensure fresh content or handle via Next.js ISR fetch caching
});
