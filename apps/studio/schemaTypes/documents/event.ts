import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Agenda & Kegiatan",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nama Kegiatan",
      type: "string",
      validation: (Rule) => Rule.required().error("Nama agenda kegiatan wajib diisi."),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug kegiatan wajib digenerate."),
    }),
    defineField({
      name: "coverImage",
      title: "Poster / Foto Kegiatan",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Teks Alternatif (Alt)",
          validation: (Rule) => Rule.required().error("Alt text poster kegiatan wajib diisi."),
        },
      ],
    }),
    defineField({
      name: "startDate",
      title: "Waktu Mulai",
      type: "datetime",
      validation: (Rule) => Rule.required().error("Waktu mulai kegiatan wajib diisi."),
    }),
    defineField({
      name: "endDate",
      title: "Waktu Selesai (Opsional)",
      type: "datetime",
    }),
    defineField({
      name: "location",
      title: "Lokasi / Tempat",
      type: "string",
      description: "Contoh: Gedung Balai Patriot Kota Bekasi atau Daring via Zoom",
      validation: (Rule) => Rule.required().error("Lokasi kegiatan wajib diisi."),
    }),
    defineField({
      name: "registrationOpen",
      title: "Pendaftaran Dibuka",
      type: "boolean",
      description: "Centang jika form registrasi peserta aktif.",
      initialValue: true,
    }),
    defineField({
      name: "body",
      title: "Deskripsi & Rincian Kegiatan",
      type: "blockContent",
    }),
    defineField({
      name: "seo",
      title: "Pengaturan SEO Kegiatan",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      startDate: "startDate",
      location: "location",
      media: "coverImage",
    },
    prepare({ title, startDate, location, media }) {
      const dateStr = startDate
        ? new Date(startDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Tanggal belum diatur";
      return {
        title: title || "Tanpa Judul",
        subtitle: `${dateStr} · ${location || ""}`,
        media,
      };
    },
  },
});
