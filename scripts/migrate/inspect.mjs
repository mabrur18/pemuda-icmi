import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { JSDOM } from "jsdom";

const feedPath = path.resolve("./scripts/migrate/input/feed.atom");
const xmlData = fs.readFileSync(feedPath, "utf-8");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["entry", "category", "link"].includes(name),
});

const parsed = parser.parse(xmlData);
const feed = parsed.feed;
const entries = feed.entry || [];

const stats = {
  totalEntries: entries.length,
  types: {},
  statuses: {},
  authors: {},
  labels: {},
  dateRange: { oldest: null, newest: null },
  permalinks: [],
  pageFilenames: [],
  imageDomains: {},
  htmlPatterns: {
    imagesInSeparatorDiv: 0,
    imagesInAnchor: 0,
    imagesBare: 0,
    msoNormalParagraphs: 0,
    tables: 0,
    iframes: 0,
    blockquotes: 0,
    emptyParagraphs: 0,
    inlineStyleCount: 0,
    fontTags: 0,
  },
  sampleArticles: [],
};

for (const entry of entries) {
  const type = entry["blogger:type"] || "UNKNOWN";
  const status = entry["blogger:status"] || "UNKNOWN";

  stats.types[type] = (stats.types[type] || 0) + 1;
  stats.statuses[status] = (stats.statuses[status] || 0) + 1;

  // Author
  const authorName = entry.author?.name || "Unknown Author";
  stats.authors[authorName] = (stats.authors[authorName] || 0) + 1;

  // Date
  const pubDate = entry.published;
  if (pubDate) {
    if (!stats.dateRange.oldest || pubDate < stats.dateRange.oldest) {
      stats.dateRange.oldest = pubDate;
    }
    if (!stats.dateRange.newest || pubDate > stats.dateRange.newest) {
      stats.dateRange.newest = pubDate;
    }
  }

  // Permalink from blogger:filename
  const filename = entry["blogger:filename"];
  if (filename) {
    if (type === "POST") {
      stats.permalinks.push(filename);
    } else if (type === "PAGE") {
      stats.pageFilenames.push(filename);
    }
  }

  // Categories / Labels
  const categories = entry.category || [];
  for (const cat of categories) {
    const term = cat["@_term"];
    if (term) {
      stats.labels[term] = (stats.labels[term] || 0) + 1;
    }
  }

  // Content HTML Analysis
  const content = entry.content?.["#text"] || entry.content || "";
  if (typeof content === "string" && content.trim().length > 0) {
    const dom = new JSDOM(content);
    const doc = dom.window.document;

    // Images
    const imgs = doc.querySelectorAll("img");
    for (const img of imgs) {
      const src = img.getAttribute("src") || "";
      if (src) {
        try {
          const url = new URL(src);
          stats.imageDomains[url.hostname] = (stats.imageDomains[url.hostname] || 0) + 1;
        } catch {
          stats.imageDomains["relative/invalid"] = (stats.imageDomains["relative/invalid"] || 0) + 1;
        }
      }

      const parent = img.parentElement;
      if (parent?.tagName.toLowerCase() === "a") {
        stats.htmlPatterns.imagesInAnchor++;
        if (parent.parentElement?.classList.contains("separator") || parent.closest("div.separator") || parent.closest("table.tr-caption-container")) {
          stats.htmlPatterns.imagesInSeparatorDiv++;
        }
      } else {
        stats.htmlPatterns.imagesBare++;
      }
    }

    // MsoNormal
    const msoElements = doc.querySelectorAll(".MsoNormal");
    stats.htmlPatterns.msoNormalParagraphs += msoElements.length;

    // Tables
    const tables = doc.querySelectorAll("table");
    stats.htmlPatterns.tables += tables.length;

    // Iframes
    const iframes = doc.querySelectorAll("iframe");
    stats.htmlPatterns.iframes += iframes.length;

    // Blockquotes
    const blockquotes = doc.querySelectorAll("blockquote");
    stats.htmlPatterns.blockquotes += blockquotes.length;

    // Font tags
    const fonts = doc.querySelectorAll("font");
    stats.htmlPatterns.fontTags += fonts.length;

    // Inline styles
    const elementsWithStyle = doc.querySelectorAll("[style]");
    stats.htmlPatterns.inlineStyleCount += elementsWithStyle.length;

    // Sample
    if (stats.sampleArticles.length < 5 && type === "POST" && status === "LIVE") {
      stats.sampleArticles.push({
        id: entry.id,
        filename,
        title: entry.title,
        author: authorName,
        date: pubDate,
        labels: categories.map((c) => c["@_term"]),
        imgCount: imgs.length,
      });
    }
  }
}

console.log("=== LAPORAN LENGKAP STRUKTUR feed.atom ===");
console.log(JSON.stringify(stats, null, 2));
