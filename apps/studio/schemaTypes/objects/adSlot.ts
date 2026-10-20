import { defineField, defineType } from "sanity";

export const adSlot = defineType({
  name: "adSlot",
  title: "Blok Iklan (AdSlot)",
  type: "object",
  fields: [
    defineField({
      name: "position",
      title: "Posisi Penempatan",
      type: "string",
      options: {
        list: [
          { title: "Dalam Artikel (In-Article)", value: "inArticle" },
          { title: "Bawah Artikel (Below Article)", value: "belowArticle" },
          { title: "Bilah Samping (Sidebar)", value: "sidebar" },
          { title: "Antar Artikel (In-Feed)", value: "inFeed" },
          { title: "Kustom", value: "custom" },
        ],
      },
      initialValue: "inArticle",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slotId",
      title: "ID Slot Kustom (Opsional)",
      type: "string",
      description: "Biarkan kosong untuk menggunakan ID slot bawaan dari Pengaturan Situs.",
    }),
  ],
  preview: {
    select: {
      position: "position",
      slotId: "slotId",
    },
    prepare({ position, slotId }) {
      return {
        title: `Iklan AdSense: ${position}`,
        subtitle: slotId ? `Slot ID: ${slotId}` : "Menggunakan Slot Pengaturan Global",
      };
    },
  },
});
