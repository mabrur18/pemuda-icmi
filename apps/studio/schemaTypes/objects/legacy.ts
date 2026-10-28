import { defineField, defineType } from "sanity";

export const legacy = defineType({
  name: "legacy",
  title: "Data Migrasi Blogger",
  type: "object",
  fields: [
    defineField({
      name: "bloggerPostId",
      title: "ID Post Blogger Asli",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "bloggerUrl",
      title: "URL Asli Blogger",
      description:
        "Opsional. Path/URL artikel di Blogger lama (untuk redirect). Boleh dikosongkan atau diubah.",
      type: "string",
      validation: (Rule) => Rule.optional(),
    }),
    defineField({
      name: "importedAt",
      title: "Waktu Impor",
      type: "datetime",
      readOnly: true,
    }),
  ],
  options: {
    collapsible: true,
    collapsed: true,
  },
});
