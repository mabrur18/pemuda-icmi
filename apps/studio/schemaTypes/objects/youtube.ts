import { defineField, defineType } from "sanity";

export const youtube = defineType({
  name: "youtube",
  title: "Sematan YouTube",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "URL Video YouTube",
      type: "url",
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ["http", "https"],
        }),
    }),
    defineField({
      name: "caption",
      title: "Keterangan Video (Opsional)",
      type: "string",
    }),
  ],
  preview: {
    select: {
      url: "url",
      caption: "caption",
    },
    prepare({ url, caption }) {
      return {
        title: caption || "Video YouTube",
        subtitle: url,
      };
    },
  },
});
