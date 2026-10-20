import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Pengaturan Situs (Utama)",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Nama Situs Web",
      type: "string",
      initialValue: "Pemuda ICMI Kota Bekasi",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteTagline",
      title: "Slogan / Tagline Organisasi",
      type: "string",
      initialValue: "Membangun Cendekia dan Kepemimpinan Pemuda",
    }),
    defineField({
      name: "logo",
      title: "Logo Organisasi",
      type: "image",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Text Logo",
          initialValue: "Logo Pemuda ICMI Kota Bekasi",
        },
      ],
    }),
    defineField({
      name: "defaultSeo",
      title: "Pengaturan SEO Bawaan (Default)",
      type: "seo",
    }),
    defineField({
      name: "organization",
      title: "Profil & Kontak Organisasi",
      type: "object",
      fields: [
        { name: "address", type: "text", title: "Alamat Kantor Sekretariat", rows: 3 },
        { name: "email", type: "string", title: "Email Resmi" },
        { name: "phone", type: "string", title: "Nomor Telepon / WhatsApp" },
        {
          name: "socialLinks",
          type: "object",
          title: "Tautan Media Sosial Resmi",
          fields: [
            { name: "instagram", type: "url", title: "Instagram" },
            { name: "youtube", type: "url", title: "YouTube" },
            { name: "facebook", type: "url", title: "Facebook" },
            { name: "twitter", type: "url", title: "X (Twitter)" },
          ],
        },
      ],
      options: {
        collapsible: true,
      },
    }),
    defineField({
      name: "adsense",
      title: "Pengaturan Iklan Google AdSense (FR-501)",
      type: "object",
      fields: [
        {
          name: "enabled",
          title: "Aktifkan Iklan AdSense",
          type: "boolean",
          description: "Sakelar utama AdSense seluruh situs. Hanya berjalan di domain produksi.",
          initialValue: false,
        },
        {
          name: "publisherId",
          title: "ID Penayang (Publisher ID)",
          type: "string",
          description: "Contoh: pub-XXXXXXXXXXXXXXXX",
        },
        {
          name: "autoAds",
          title: "Gunakan Google Auto Ads",
          type: "boolean",
          initialValue: true,
        },
        {
          name: "injectAfterParagraph",
          title: "Sisipkan Iklan Otomatis Setelah Paragraf ke-N",
          type: "number",
          description: "Bawaan PRD: setelah paragraf ke-3 (nilai: 3).",
          initialValue: 3,
        },
        {
          name: "slots",
          title: "ID Slot Unit Iklan Manual",
          type: "object",
          fields: [
            { name: "inArticle", type: "string", title: "Slot ID: Dalam Artikel" },
            { name: "belowArticle", type: "string", title: "Slot ID: Bawah Artikel" },
            { name: "sidebar", type: "string", title: "Slot ID: Bilah Samping Desktop" },
            { name: "inFeed", type: "string", title: "Slot ID: Antar Berita di Feed" },
          ],
        },
      ],
      options: {
        collapsible: true,
      },
    }),
    defineField({
      name: "analytics",
      title: "Pelacakan & Verifikasi (GA4 & Search Console)",
      type: "object",
      fields: [
        {
          name: "gaMeasurementId",
          title: "Google Analytics 4 Measurement ID",
          type: "string",
          description: "Contoh: G-XXXXXXXXXX",
        },
        {
          name: "googleVerificationToken",
          title: "Google Search Console Verification Meta Tag",
          type: "string",
          description: "Nilai atribut 'content' dari tag meta verifikasi Google.",
        },
      ],
      options: {
        collapsible: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "siteName",
      subtitle: "siteTagline",
      media: "logo",
    },
  },
});
