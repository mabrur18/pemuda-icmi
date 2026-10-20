import { defineField, defineType } from "sanity";

export const tag = defineType({
  name: "tag",
  title: "Tag / Topik",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nama Tag",
      type: "string",
      validation: (Rule) => Rule.required().error("Nama tag wajib diisi."),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug tag wajib digenerate."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
