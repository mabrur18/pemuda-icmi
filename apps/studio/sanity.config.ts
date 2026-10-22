import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "default",
  title: "Pemuda ICMI Kota Bekasi CMS",

  projectId:
    process.env.SANITY_STUDIO_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    "glupcaxn",
  dataset:
    process.env.SANITY_STUDIO_DATASET ||
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    "production",

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
  },

  document: {
    // 1. Pengaturan Tindakan Dokumen (Actions)
    actions: (prev, context) => {
      // Pada dokumen Singleton (siteSettings), sembunyikan delete dan duplicate
      // agar konfigurasi esensial web tidak sengaja terhapus.
      if (context.schemaType === "siteSettings") {
        return prev.filter(
          (action) => action.action !== "delete" && action.action !== "duplicate"
        );
      }
      // Untuk artikel berita, halaman, kategori, tag, dll: seluruh action (publish, unpublish, delete, duplicate) tetap aktif.
      return prev;
    },

    // 2. Pratinjau Langsung Draf (FR-204 & Live Preview)
    // Menyediakan tombol "Open preview" di Studio yang otomatis mengaktifkan Next.js Draft Mode
    // sehingga perubahan draf yang belum di-publish langsung terbaca di web.
    productionUrl: async (prev, context) => {
      const { document } = context;
      const baseUrl =
        process.env.SANITY_STUDIO_PREVIEW_URL || "https://www.pemudaicmi-kotabekasi.org";
      const secret = "icmi_rev_sec_89f72b901a8e41";

      if (document._type === "post") {
        const slug = (document.slug as any)?.current;
        if (!slug) return prev;
        return `${baseUrl}/api/draft-mode/enable?secret=${secret}&slug=/berita/${slug}`;
      }

      if (document._type === "page") {
        const slug = (document.slug as any)?.current;
        if (!slug) return prev;
        return `${baseUrl}/api/draft-mode/enable?secret=${secret}&slug=/${slug}`;
      }

      return prev;
    },
  },
});
