import { createClient } from "@sanity/client";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "glupcaxn";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const token = process.env.SANITY_API_READ_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  timeout: 30000,
  useCdn: false, // Ensure fresh content via Next.js ISR fetch caching
});
