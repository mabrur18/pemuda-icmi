import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { JSDOM } from "jsdom";
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { cleanBloggerHtml, ExtractedImage } from "./cleaner.ts";

const authorMap = JSON.parse(
  fs.readFileSync(path.resolve("./scripts/migrate/author-map.json"), "utf-8")
);
const labelMap = JSON.parse(
  fs.readFileSync(path.resolve("./scripts/migrate/label-map.json"), "utf-8")
);

// Skema Portable Text untuk block-tools
const blockContentSchema = {
  name: "blockContent",
  title: "Block Content",
  type: "array",
  of: [
    {
      title: "Block",
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Number", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
          { title: "Underline", value: "underline" },
          { title: "Strike", value: "strike-through" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              { name: "href", type: "url", title: "URL" },
              { name: "blank", type: "boolean", title: "Blank" },
            ],
          },
        ],
      },
    },
    {
      type: "image",
      name: "image",
      fields: [
        { name: "alt", type: "string" },
        { name: "caption", type: "string" },
      ],
    },
    {
      type: "object",
      name: "youtube",
      title: "YouTube Video",
      fields: [{ name: "url", type: "url" }],
    },
  ],
};

const compiledSchema = Schema.compile({
  name: "default",
  types: [
    {
      type: "object",
      name: "youtube",
      fields: [{ name: "url", type: "url" }],
    },
    blockContentSchema,
  ],
});
const blockContentType = compiledSchema.get("blockContent");

export interface TransformedPostDocument {
  _id: string;
  _type: "post";
  title: string;
  slug: { _type: "slug"; current: string };
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  author: { _type: "reference"; _ref: string };
  categories: Array<{ _type: "reference"; _ref: string }>;
  tags: Array<{ _type: "reference"; _ref: string }>;
  body: any[];
  legacy: {
    bloggerPostId: string;
    bloggerUrl: string;
    importedAt: string;
  };
  pendingImages: ExtractedImage[];
}

export function transformBloggerFeed(options: { limit?: number } = {}) {
  const feedPath = path.resolve("./scripts/migrate/input/feed.atom");
  if (!fs.existsSync(feedPath)) {
    throw new Error(`Berkas feed.atom tidak ditemukan di ${feedPath}`);
  }

  const outDir = path.resolve("./scripts/migrate/out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const xmlData = fs.readFileSync(feedPath, "utf-8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => ["entry", "category", "link"].includes(name),
  });

  const parsed = parser.parse(xmlData);
  const feed = parsed.feed;
  const entries = feed.entry || [];

  const postEntries = entries.filter((e: any) => e["blogger:type"] === "POST");
  const limit = options.limit ?? postEntries.length;
  const targetEntries = postEntries.slice(0, limit);

  console.log(`\n=== MEMPROSES TRANSFORMASI ${targetEntries.length} ARTIKEL BLOGGER ===`);

  const results: TransformedPostDocument[] = [];

  for (let idx = 0; idx < targetEntries.length; idx++) {
    const entry = targetEntries[idx];

    // 1. Ekstrak numeric postId
    const rawId = entry.id || "";
    const postIdMatch = rawId.match(/post-(\d+)/);
    const postId = postIdMatch ? postIdMatch[1] : `${idx + 1}`;
    const docId = `post.blogger-${postId}`;

    // 2. Ekstrak permalink dan slug
    const filename = entry["blogger:filename"] || "";
    let slugCurrent = "";
    if (filename) {
      slugCurrent = path
        .basename(filename, ".html")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    } else {
      slugCurrent = (entry.title || `artikel-${postId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // 3. Bersihkan konten HTML
    const rawContent = entry.content?.["#text"] || entry.content || "";
    const { cleanedHtml, images, plainText } = cleanBloggerHtml(rawContent);

    // 4. Ubah ke Portable Text blocks
    const bodyBlocks = htmlToBlocks(cleanedHtml, blockContentType, {
      parseHtml: (html) => new JSDOM(html).window.document,
    });

    // 5. Excerpt
    const metaDesc = entry["blogger:metaDescription"];
    const excerpt = (metaDesc || plainText.slice(0, 240)).replace(/\s+/g, " ").trim();

    // 6. Penulis
    const authorName = entry.author?.name || "default";
    const mappedAuthor = authorMap[authorName] || authorMap["default"];

    // 7. Kategori & Tag
    const categories: Array<{ _type: "reference"; _ref: string }> = [];
    const tags: Array<{ _type: "reference"; _ref: string }> = [];

    const entryCategories = entry.category || [];
    for (const cat of entryCategories) {
      const term = cat["@_term"];
      if (term) {
        if (labelMap.categories[term]) {
          const ref = labelMap.categories[term];
          if (!categories.some((c) => c._ref === ref)) {
            categories.push({ _type: "reference", _ref: ref });
          }
        }
        if (labelMap.tags[term]) {
          const ref = labelMap.tags[term];
          if (!tags.some((t) => t._ref === ref)) {
            tags.push({ _type: "reference", _ref: ref });
          }
        }
      }
    }

    // Fallback kategori & tag default jika kosong
    if (categories.length === 0) {
      categories.push({ _type: "reference", _ref: labelMap.categories.default });
    }
    if (tags.length === 0) {
      tags.push({ _type: "reference", _ref: labelMap.tags.default });
    }

    // 8. Bentuk Dokumen Sanity Transformed
    const doc: TransformedPostDocument = {
      _id: docId,
      _type: "post",
      title: (entry.title || "Tanpa Judul").trim(),
      slug: { _type: "slug", current: slugCurrent },
      excerpt: excerpt.length > 300 ? excerpt.slice(0, 297) + "..." : excerpt,
      publishedAt: entry.published || new Date().toISOString(),
      updatedAt: entry.updated,
      author: { _type: "reference", _ref: mappedAuthor._ref },
      categories,
      tags,
      body: bodyBlocks,
      legacy: {
        bloggerPostId: postId,
        bloggerUrl: filename,
        importedAt: new Date().toISOString(),
      },
      pendingImages: images,
    };

    // Simpan ke outDir
    const filePath = path.join(outDir, `post-${postId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf-8");

    results.push(doc);
    console.log(
      `[${idx + 1}/${targetEntries.length}] Sukses: ${doc._id} | Slug: /berita/${doc.slug.current} | Gambar: ${images.length} (Lokal: ${images.filter(i => i.localPath).length})`
    );
  }

  return results;
}

// Jalankan jika dipanggil langsung via CLI
if (process.argv[1]?.endsWith("transformer.ts") || process.argv[1]?.endsWith("transformer.js")) {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 10;

  const results = transformBloggerFeed({ limit });
  console.log(`\nBerhasil menghasilkan ${results.length} berkas JSON di scripts/migrate/out/\n`);
}
