import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Kategori Berita",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nama Kategori",
      type: "string",
      validation: (Rule) => Rule.required().error("Nama kategori wajib diisi."),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug kategori wajib digenerate."),
    }),
    defineField({
      name: "description",
      title: "Deskripsi Singkat Kategori",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "seo",
      title: "Pengaturan SEO Kategori",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
