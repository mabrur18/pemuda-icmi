import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Halaman Statis",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Halaman",
      type: "string",
      validation: (Rule) => Rule.required().error("Judul halaman statis wajib diisi."),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug halaman wajib digenerate."),
    }),
    defineField({
      name: "showInNav",
      title: "Tampilkan di Menu Navigasi Utama Header",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "body",
      title: "Isi Halaman",
      type: "blockContent",
      validation: (Rule) => Rule.required().error("Isi konten halaman tidak boleh kosong."),
    }),
    defineField({
      name: "seo",
      title: "Pengaturan SEO Halaman",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      showInNav: "showInNav",
    },
    prepare({ title, slug, showInNav }) {
      return {
        title: title || "Tanpa Judul",
        subtitle: `/${slug || ""} ${showInNav ? "· [Di Menu Navigasi]" : ""}`,
      };
    },
  },
});
