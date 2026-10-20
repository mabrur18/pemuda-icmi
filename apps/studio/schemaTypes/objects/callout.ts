import { defineField, defineType } from "sanity";

export const callout = defineType({
  name: "callout",
  title: "Kotak Catatan (Callout)",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      title: "Tipe Catatan",
      type: "string",
      options: {
        list: [
          { title: "Informasi (Hijau / Brand)", value: "info" },
          { title: "Penting / Aksen (Emas)", value: "warning" },
          { title: "Sukses", value: "success" },
          { title: "Peringatan / Hati-hati", value: "caution" },
        ],
        layout: "radio",
      },
      initialValue: "info",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Judul Catatan (Opsional)",
      type: "string",
    }),
    defineField({
      name: "text",
      title: "Isi Catatan",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      text: "text",
      tone: "tone",
    },
    prepare({ title, text, tone }) {
      return {
        title: title || `Catatan [${tone?.toUpperCase()}]`,
        subtitle: text,
      };
    },
  },
});
