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
      type: "url",
      readOnly: true,
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
