import { defineField, defineType } from "sanity";

export const publication = defineType({
  name: "publication",
  title: "Publikasi & Dokumen",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Publikasi / Buku / Riset",
      type: "string",
      validation: (Rule) => Rule.required().error("Judul publikasi wajib diisi."),
    }),
    defineField({
      name: "year",
      title: "Tahun Terbit",
      type: "number",
      initialValue: new Date().getFullYear(),
      validation: (Rule) =>
        Rule.required()
          .min(1990)
          .max(2100)
          .error("Tahun terbit harus valid."),
    }),
    defineField({
      name: "file",
      title: "Berkas PDF",
      type: "file",
      options: {
        accept: ".pdf",
      },
      validation: (Rule) => Rule.required().error("Berkas PDF publikasi wajib diunggah."),
    }),
    defineField({
      name: "summary",
      title: "Ringkasan / Abstrak",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: "title",
      year: "year",
    },
    prepare({ title, year }) {
      return {
        title: title || "Tanpa Judul",
        subtitle: `Tahun ${year || "-"}`,
      };
    },
  },
});
