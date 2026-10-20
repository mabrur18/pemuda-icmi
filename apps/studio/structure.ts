import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("CMS Pemuda ICMI Kota Bekasi")
    .items([
      // 1. Singleton Site Settings
      S.listItem()
        .title("Pengaturan Situs (Utama)")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Pengaturan Situs")
        ),
      S.divider(),

      // 2. Berita & Artikel
      S.listItem()
        .title("Artikel Berita")
        .schemaType("post")
        .child(
          S.documentTypeList("post")
            .title("Daftar Artikel Berita")
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),

      // 3. Halaman Statis
      S.documentTypeListItem("page").title("Halaman Statis"),

      S.divider(),

      // 4. Taksonomi & Kepenulisan
      S.listItem()
        .title("Kategori & Topik")
        .child(
          S.list()
            .title("Kategori & Tag")
            .items([
              S.documentTypeListItem("category").title("Kategori Berita"),
              S.documentTypeListItem("tag").title("Tag / Topik"),
            ])
        ),

      S.documentTypeListItem("author").title("Penulis & Pengurus"),

      S.divider(),

      // 5. Kegiatan & Publikasi
      S.documentTypeListItem("event").title("Agenda Kegiatan"),
      S.documentTypeListItem("publication").title("Publikasi & Dokumen"),

      S.divider(),

      // 6. Pengalihan URL (Redirects)
      S.documentTypeListItem("redirect").title("Aturan Pengalihan (Redirect)"),

      // Filter out types handled explicitly
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            "siteSettings",
            "post",
            "page",
            "category",
            "tag",
            "author",
            "event",
            "publication",
            "redirect",
          ].includes(listItem.getId() || "")
      ),
    ]);
