import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

export interface ExtractedImage {
  src: string;
  filename: string;
  alt: string;
  caption?: string;
  localPath?: string;
}

export interface CleanHtmlResult {
  cleanedHtml: string;
  images: ExtractedImage[];
  plainText: string;
}

// Index folder Album untuk pencocokan file gambar offline
const albumDir = path.resolve("./blog/Album");
let localAlbumFiles: Map<string, string> = new Map();

if (fs.existsSync(albumDir)) {
  const files = fs.readdirSync(albumDir);
  for (const f of files) {
    if (!f.endsWith(".json")) {
      localAlbumFiles.set(f.toLowerCase(), path.join(albumDir, f));
    }
  }
}

/**
 * Mencari path file lokal dari URL gambar Blogger
 */
export function findLocalImageFile(src: string): string | undefined {
  try {
    const url = new URL(src);
    const pathname = decodeURIComponent(url.pathname);
    const filename = path.basename(pathname);

    // 1. Cek kecocokan langsung
    const match = localAlbumFiles.get(filename.toLowerCase());
    if (match) return match;

    // 2. Cek jika nama file memiliki variasi ekstensi atau spasi
    const baseWithoutExt = path.parse(filename).name.toLowerCase();
    for (const [localName, localPath] of localAlbumFiles.entries()) {
      if (path.parse(localName).name === baseWithoutExt) {
        return localPath;
      }
    }
  } catch {
    // Ignore invalid url
  }
  return undefined;
}

/**
 * Membersihkan HTML Blogger kotor menjadi HTML semantik yang siap diubah ke Portable Text
 */
export function cleanBloggerHtml(rawHtml: string): CleanHtmlResult {
  if (!rawHtml || rawHtml.trim().length === 0) {
    return { cleanedHtml: "", images: [], plainText: "" };
  }

  const dom = new JSDOM(`<!DOCTYPE html><html><body>${rawHtml}</body></html>`);
  const doc = dom.window.document;
  const body = doc.body;

  const images: ExtractedImage[] = [];

  // Pola 1 & 2: Tangani tr-caption-container (Tabel pembungkus gambar & caption Blogger)
  const captionTables = body.querySelectorAll("table.tr-caption-container");
  for (const table of captionTables) {
    const img = table.querySelector("img");
    const captionEl = table.querySelector(".tr-caption");
    const captionText = captionEl ? captionEl.textContent?.trim() : undefined;

    if (img) {
      const src = img.getAttribute("src") || "";
      const alt = img.getAttribute("alt") || img.getAttribute("title") || captionText || "Dokumentasi Pemuda ICMI";
      const filename = path.basename(decodeURIComponent(src.split("?")[0]));
      const localPath = findLocalImageFile(src);

      images.push({
        src,
        filename,
        alt,
        caption: captionText,
        localPath,
      });

      // Ganti tabel dengan figure HTML bersih
      const figure = doc.createElement("figure");
      figure.innerHTML = `<img src="${src}" alt="${alt}" />${
        captionText ? `<figcaption>${captionText}</figcaption>` : ""
      }`;
      table.replaceWith(figure);
    } else {
      table.remove();
    }
  }

  // Pola 1: Tangani div.separator yang membungkus gambar
  const separators = body.querySelectorAll("div.separator");
  for (const div of separators) {
    const img = div.querySelector("img");
    if (img) {
      const src = img.getAttribute("src") || "";
      const alt = img.getAttribute("alt") || img.getAttribute("title") || "Foto Dokumentasi Pemuda ICMI";
      const filename = path.basename(decodeURIComponent(src.split("?")[0]));
      const localPath = findLocalImageFile(src);

      // Jangan duplikasi jika sudah tercatat
      if (!images.some((i) => i.src === src)) {
        images.push({
          src,
          filename,
          alt,
          localPath,
        });
      }

      const cleanImg = doc.createElement("img");
      cleanImg.setAttribute("src", src);
      cleanImg.setAttribute("alt", alt);
      div.replaceWith(cleanImg);
    } else {
      // Jika div kosong, hapus
      div.remove();
    }
  }

  // Tangani sisa gambar bare (yang belum tertangkap)
  const allImgs = body.querySelectorAll("img");
  for (const img of allImgs) {
    const src = img.getAttribute("src") || "";
    if (src && !images.some((i) => i.src === src)) {
      const alt = img.getAttribute("alt") || img.getAttribute("title") || "Foto Dokumentasi Pemuda ICMI";
      const filename = path.basename(decodeURIComponent(src.split("?")[0]));
      const localPath = findLocalImageFile(src);

      images.push({
        src,
        filename,
        alt,
        localPath,
      });
    }

    // Jika gambar dibungkus tag <a> ke image file yang sama, unwrap link-nya
    const parent = img.parentElement;
    if (parent && parent.tagName.toLowerCase() === "a") {
      const href = parent.getAttribute("href") || "";
      if (href.includes("googleusercontent.com") || href.endsWith(".jpg") || href.endsWith(".jpeg") || href.endsWith(".png")) {
        parent.replaceWith(img);
      }
    }
  }

  // Pola 3: Hapus tag Microsoft Word (<o:p>, dsb.)
  const wordTags = body.querySelectorAll("o\\:p, w\\:worddocument");
  for (const wt of wordTags) {
    wt.remove();
  }

  // Pola 4: Bersihkan class .MsoNormal dan inline styles
  const allElements = body.querySelectorAll("*");
  for (const el of allElements) {
    el.removeAttribute("class");
    el.removeAttribute("style");
    el.removeAttribute("lang");
    el.removeAttribute("face");
    el.removeAttribute("size");
    el.removeAttribute("color");
    el.removeAttribute("border");
    el.removeAttribute("cellpadding");
    el.removeAttribute("cellspacing");

    // Pola 6: Konversi font tag ke text node
    if (el.tagName.toLowerCase() === "font") {
      const textNode = doc.createTextNode(el.textContent || "");
      el.replaceWith(textNode);
    }
  }

  // Pola 7: Iframe (YouTube / Video)
  const iframes = body.querySelectorAll("iframe");
  for (const iframe of iframes) {
    const src = iframe.getAttribute("src") || "";
    if (src.includes("youtube.com") || src.includes("youtu.be")) {
      // Pertahankan iframe bersih
      iframe.removeAttribute("width");
      iframe.removeAttribute("height");
      iframe.removeAttribute("frameborder");
    } else {
      iframe.remove();
    }
  }

  // Pola 10: Tautan eksternal (buka di tab baru dengan aman)
  const links = body.querySelectorAll("a");
  for (const a of links) {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("http://") || href.startsWith("https://")) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  }

  // Pola 5: Bersihkan paragraf kosong berulang
  const paragraphs = body.querySelectorAll("p");
  for (const p of paragraphs) {
    const text = p.textContent?.trim() || "";
    const hasChildImg = p.querySelector("img, figure, iframe");
    if (!text && !hasChildImg) {
      p.remove();
    }
  }

  let cleanedHtml = body.innerHTML.trim();

  // Hapus br beruntun dan spasi tak terlihat
  cleanedHtml = cleanedHtml.replace(/(<br\s*\/?>\s*){2,}/gi, "<br />");
  cleanedHtml = cleanedHtml.replace(/&nbsp;/gi, " ");

  const plainText = body.textContent?.replace(/\s+/g, " ").trim() || "";

  return {
    cleanedHtml,
    images,
    plainText,
  };
}
