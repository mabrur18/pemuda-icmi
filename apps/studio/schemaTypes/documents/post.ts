import { defineArrayMember, defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Artikel Berita",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Berita",
      type: "string",
      validation: (Rule) => Rule.required().error("Judul artikel berita wajib diisi."),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug berita wajib dibuat dan unik."),
    }),
    defineField({
      name: "excerpt",
      title: "Ringkasan / Kutipan (Excerpt)",
      type: "text",
      rows: 3,
      description: "Ringkasan pembuka artikel yang tampil pada kartu beranda dan hasil pencarian.",
      validation: (Rule) =>
        Rule.required()
          .max(300)
          .error("Ringkasan artikel wajib diisi (maks. 300 karakter)."),
    }),
    defineField({
      name: "coverImage",
      title: "Foto Utama / Sampul (Cover Image)",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Teks Alternatif (Alt Text) — WAJIB",
          description: "Deskripsi singkat foto untuk aksesibilitas tunanetra dan SEO.",
          validation: (Rule) =>
            Rule.required().error("Alt text foto sampul wajib diisi demi standar SEO & aksesibilitas."),
        },
        {
          name: "caption",
          type: "string",
          title: "Keterangan Foto (Caption)",
        },
        {
          name: "credit",
          type: "string",
          title: "Kredit / Sumber Foto",
          description: "Contoh: Dokumentasi ICMI Kota Bekasi / Foto: Humas",
        },
      ],
      validation: (Rule) => Rule.required().error("Foto sampul artikel berita wajib diunggah."),
    }),
    defineField({
      name: "author",
      title: "Penulis",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required().error("Penulis artikel berita wajib dipilih."),
    }),
    defineField({
      name: "categories",
      title: "Kategori Berita",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
      validation: (Rule) =>
        Rule.required().min(1).error("Pilih minimal satu kategori berita."),
    }),
    defineField({
      name: "tags",
      title: "Tag / Topik Terkait",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
    }),
    defineField({
      name: "publishedAt",
      title: "Tanggal & Waktu Terbit",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required().error("Tanggal penerbitan wajib diisi."),
    }),
    defineField({
      name: "updatedAt",
      title: "Tanggal Diperbarui",
      type: "datetime",
    }),
    defineField({
      name: "body",
      title: "Isi Berita",
      type: "blockContent",
      validation: (Rule) => Rule.required().error("Isi konten artikel tidak boleh kosong."),
    }),
    defineField({
      name: "adsEnabled",
      title: "Tampilkan Iklan AdSense pada Artikel Ini",
      type: "boolean",
      description: "Nonaktifkan jika artikel ini bersifat sensitif, duka cita, atau kerja sama khusus tanpa iklan.",
      initialValue: true,
    }),
    defineField({
      name: "seo",
      title: "Pengaturan SEO Khusus",
      type: "seo",
    }),
    defineField({
      name: "legacy",
      title: "Informasi Migrasi Blogger",
      type: "legacy",
    }),
  ],
  preview: {
    select: {
      title: "title",
      authorName: "author.name",
      media: "coverImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, authorName, media, publishedAt }) {
      const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Draf";
      return {
        title: title || "Tanpa Judul",
        subtitle: `${authorName ? `${authorName} · ` : ""}${formattedDate}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Tanggal Terbit Terkini",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Tanggal Terbit Terlama",
      name: "publishedAtAsc",
      by: [{ field: "publishedAt", direction: "asc" }],
    },
  ],
});
