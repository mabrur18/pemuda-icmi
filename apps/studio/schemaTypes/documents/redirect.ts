import { defineField, defineType } from "sanity";

export const redirect = defineType({
  name: "redirect",
  title: "Aturan Pengalihan (Redirect)",
  type: "document",
  fields: [
    defineField({
      name: "source",
      title: "Jalur Asal (Source Path)",
      type: "string",
      description: "Contoh: /2023/05/kegiatan-pelantikan.html",
      validation: (Rule) =>
        Rule.required()
          .regex(/^\//, { name: "slash", invert: false })
          .error("Jalur asal harus diawali tanda garis miring (/)."),
    }),
    defineField({
      name: "destination",
      title: "Jalur Tujuan (Destination Path)",
      type: "string",
      description: "Contoh: /berita/kegiatan-pelantikan",
      validation: (Rule) =>
        Rule.required()
          .regex(/^(\/|https?:\/\/)/, { name: "path or url", invert: false })
          .error("Tujuan harus diawali tanda garis miring (/) atau URL lengkap https://"),
    }),
    defineField({
      name: "permanent",
      title: "Pengalihan Permanen (Status 308 / 301)",
      type: "boolean",
      description: "Aktifkan untuk memberitahu mesin pencari bahwa URL telah berpindah permanen.",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      source: "source",
      destination: "destination",
      permanent: "permanent",
    },
    prepare({ source, destination, permanent }) {
      return {
        title: `${source} → ${destination}`,
        subtitle: permanent ? "308 Permanen" : "307 Sementara",
      };
    },
  },
});
