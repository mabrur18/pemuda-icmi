import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Penulis / Pengurus",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nama Lengkap & Gelar",
      type: "string",
      validation: (Rule) => Rule.required().error("Nama penulis wajib diisi."),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug URL wajib digenerate."),
    }),
    defineField({
      name: "role",
      title: "Jabatan / Bidang Organisasi",
      type: "string",
      description: "Contoh: Ketua Umum, Bidang Humas & Media, Penulis Kontributor",
    }),
    defineField({
      name: "photo",
      title: "Foto Profil",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Teks Alternatif (Alt)",
          description: "Nama penulis dan jabatan",
        },
      ],
    }),
    defineField({
      name: "bio",
      title: "Biografi Singkat",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "social",
      title: "Tautan Media Sosial",
      type: "object",
      fields: [
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "linkedin", type: "url", title: "LinkedIn" },
        { name: "twitter", type: "url", title: "X (Twitter)" },
        { name: "website", type: "url", title: "Situs Pribadi" },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
  },
});
