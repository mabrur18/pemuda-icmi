import { describe, it, expect } from "vitest";
import { cleanBloggerHtml, findLocalImageFile } from "../scripts/migrate/cleaner";

describe("Tahap 8: Blogger HTML Cleaner Tests (10 Pola HTML)", () => {
  it("Pola 1: harus mengekstrak dan membersihkan gambar dari div.separator", () => {
    const raw = `
      <div class="separator" style="clear: both; text-align: center;">
        <a href="https://blogger.googleusercontent.com/.../s1600/LC%20BANDUNG.jpeg">
          <img src="https://blogger.googleusercontent.com/.../s1600/LC%20BANDUNG.jpeg" alt="Ramadhan Leadership Camp" />
        </a>
      </div>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.images).toHaveLength(1);
    expect(result.images[0].alt).toBe("Ramadhan Leadership Camp");
    expect(result.cleanedHtml).not.toContain("div class=\"separator\"");
    expect(result.cleanedHtml).toContain("<img");
  });

  it("Pola 2: harus mengekstrak keterangan caption dari table.tr-caption-container", () => {
    const raw = `
      <table class="tr-caption-container" style="margin-left: auto; margin-right: auto;">
        <tbody>
          <tr>
            <td>
              <img src="https://blogger.googleusercontent.com/.../DISKUSI%20JANUARI%202026.jpeg" />
            </td>
          </tr>
          <tr>
            <td class="tr-caption">Diskusi Pemuda ICMI Kota Bekasi Januari 2026</td>
          </tr>
        </tbody>
      </table>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.images).toHaveLength(1);
    expect(result.images[0].caption).toBe("Diskusi Pemuda ICMI Kota Bekasi Januari 2026");
    expect(result.cleanedHtml).toContain("<figcaption>Diskusi Pemuda ICMI Kota Bekasi Januari 2026</figcaption>");
    expect(result.cleanedHtml).not.toContain("tr-caption-container");
  });

  it("Pola 3: harus membuang tag Microsoft Word (<o:p>, MsoNormal)", () => {
    const raw = `
      <p class="MsoNormal" style="line-height: 150%;">
        <span lang="EN-US" style="font-family: Roboto;">Oleh: Andi Ibrahim Ali<o:p></o:p></span>
      </p>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).not.toContain("MsoNormal");
    expect(result.cleanedHtml).not.toContain("o:p");
    expect(result.cleanedHtml).not.toContain('lang="EN-US"');
    expect(result.cleanedHtml).toContain("Oleh: Andi Ibrahim Ali");
  });

  it("Pola 4: harus menghapus seluruh inline styles (font-family, line-height, colors)", () => {
    const raw = `
      <p style="font-family: Arial; font-size: 14pt; color: #333333; line-height: 200%;">
        Teks artikel warta.
      </p>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).not.toContain("style=");
    expect(result.cleanedHtml).not.toContain("font-family");
    expect(result.cleanedHtml).toContain("Teks artikel warta.");
  });

  it("Pola 5: harus menghapus paragraf kosong dan spasi tak terlihat berturut-turut", () => {
    const raw = `
      <p>Paragraf pertama.</p>
      <p>&nbsp;</p>
      <p> </p>
      <p><br /></p>
      <p>Paragraf kedua.</p>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).toContain("<p>Paragraf pertama.</p>");
    expect(result.cleanedHtml).toContain("<p>Paragraf kedua.</p>");
    expect(result.cleanedHtml).not.toContain("<p>&nbsp;</p>");
  });

  it("Pola 6: harus mengubah tag legacy <font> menjadi teks semantik", () => {
    const raw = `
      <p><font color="#ff0000" face="Comic Sans">Pernyataan penting dari narasumber.</font></p>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).not.toContain("<font");
    expect(result.cleanedHtml).toContain("Pernyataan penting dari narasumber.");
  });

  it("Pola 7: harus membersihkan dan mempertahankan iframe video YouTube", () => {
    const raw = `
      <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315" frameborder="0"></iframe>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    expect(result.cleanedHtml).not.toContain("frameborder");
  });

  it("Pola 8: harus mempertahankan kutipan <blockquote> semantik", () => {
    const raw = `
      <blockquote>
        <span style="font-family: Roboto;">Kecendekiawanan adalah sintesis antara iman, ilmu, dan amal.</span>
      </blockquote>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).toContain("<blockquote>");
    expect(result.cleanedHtml).toContain("Kecendekiawanan adalah sintesis antara iman, ilmu, dan amal.");
    expect(result.cleanedHtml).not.toContain("style=");
  });

  it("Pola 9: harus mempertahankan tabel data dengan bersih", () => {
    const raw = `
      <table border="1" style="width: 100%;">
        <thead>
          <tr><th>No</th><th>Kegiatan</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Diskusi Bulanan</td></tr>
        </tbody>
      </table>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).toContain("<table>");
    expect(result.cleanedHtml).toContain("<th>Kegiatan</th>");
    expect(result.cleanedHtml).toContain("<td>Diskusi Bulanan</td>");
    expect(result.cleanedHtml).not.toContain("style=");
  });

  it("Pola 10: harus menambahkan rel=noopener noreferrer dan target=_blank pada tautan eksternal", () => {
    const raw = `
      <p>Kunjungi <a href="https://pemudaicmi-kotabekasi.org/riset">Portal Riset</a> kami.</p>
    `;

    const result = cleanBloggerHtml(raw);
    expect(result.cleanedHtml).toContain('target="_blank"');
    expect(result.cleanedHtml).toContain('rel="noopener noreferrer"');
    expect(result.cleanedHtml).toContain('href="https://pemudaicmi-kotabekasi.org/riset"');
  });

  it("Ekstra: harus menemukan path file lokal di folder blog/Album", () => {
    const src = "https://blogger.googleusercontent.com/img/b/.../s1600/LC%20BANDUNG.jpeg";
    const local = findLocalImageFile(src);
    expect(local).toBeDefined();
    expect(local?.toLowerCase()).toContain("lc bandung.jpeg");
  });
});
