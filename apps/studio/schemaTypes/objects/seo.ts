import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO & Media Sosial",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Judul Khusus SEO",
      type: "string",
      description: "Jika dikosongkan, akan menggunakan judul artikel/halaman (maks. 60 karakter)",
      validation: (Rule) =>
        Rule.max(60).warning("Judul SEO dianjurkan tidak melebihi 60 karakter agar tidak terpotong di Google."),
    }),
    defineField({
      name: "description",
      title: "Deskripsi Meta",
      type: "text",
      rows: 3,
      description: "Ringkasan konten untuk mesin pencari (ideal 120-160 karakter)",
      validation: (Rule) =>
        Rule.max(160).warning("Deskripsi meta dianjurkan maksimal 160 karakter."),
    }),
    defineField({
      name: "ogImage",
      title: "Gambar Open Graph (Media Sosial)",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Gambar rasio 1200x630 untuk pratinjau saat dibagikan ke WhatsApp, X, Facebook.",
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL Kustom",
      type: "url",
      description: "Biarkan kosong kecuali artikel ini diterbitkan ulang dari sumber asli lain.",
    }),
    defineField({
      name: "noIndex",
      title: "No-Index (Sembunyikan dari Google)",
      type: "boolean",
      description: "Jika diaktifkan, halaman ini tidak akan diindeks oleh mesin pencari.",
      initialValue: false,
    }),
  ],
});
