import { defineArrayMember, defineType } from "sanity";

export const blockContent = defineType({
  title: "Isi Konten (Portable Text)",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      title: "Blok Teks",
      type: "block",
      styles: [
        { title: "Normal (Paragraf)", value: "normal" },
        { title: "Judul Bagian (H2)", value: "h2" },
        { title: "Sub-bagian (H3)", value: "h3" },
        { title: "Sub-bagian Kecil (H4)", value: "h4" },
        { title: "Kutipan (Quote)", value: "blockquote" },
      ],
      lists: [
        { title: "Daftar Titik (Bullet)", value: "bullet" },
        { title: "Daftar Nomor (Numbered)", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Tebal (Strong)", value: "strong" },
          { title: "Miring (Emphasis)", value: "em" },
          { title: "Kode (Code)", value: "code" },
          { title: "Garis Bawah", value: "underline" },
          { title: "Coret", value: "strike-through" },
        ],
        annotations: [
          {
            title: "Tautan Eksternal",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ["http", "https", "mailto", "tel"],
                  }).required(),
              },
              {
                title: "Buka di tab baru",
                name: "blank",
                type: "boolean",
                initialValue: true,
              },
            ],
          },
          {
            title: "Tautan Internal",
            name: "internalLink",
            type: "object",
            fields: [
              {
                title: "Dokumen Rujukan",
                name: "reference",
                type: "reference",
                to: [{ type: "post" }, { type: "page" }, { type: "event" }],
                validation: (Rule) => Rule.required(),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      name: "image",
      title: "Gambar",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Teks Alternatif (Alt Text) — WAJIB untuk Aksesibilitas & SEO",
          description: "Jelaskan gambar ini untuk tunanetra dan mesin pencari.",
          validation: (Rule) => Rule.required().error("Alt text gambar wajib diisi demi aksesibilitas dan SEO."),
        },
        {
          name: "caption",
          type: "string",
          title: "Keterangan Gambar (Caption)",
        },
        {
          name: "credit",
          type: "string",
          title: "Sumber / Kredit Foto",
          description: "Contoh: Dokumentasi Humas Pemuda ICMI Bekasi",
        },
      ],
    }),
    defineArrayMember({
      type: "youtube",
    }),
    defineArrayMember({
      type: "callout",
    }),
    defineArrayMember({
      type: "adSlot",
    }),
  ],
});
