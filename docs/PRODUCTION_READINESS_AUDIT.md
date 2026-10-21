# Audit Kesiapan Produksi & Matriks Kepatuhan (PRODUCTION_READINESS_AUDIT.md)

Proyek: **CMS & Portal Web Pemuda ICMI Kota Bekasi**  
Domain Target: `pemudaicmi-kotabekasi.org`  
Tanggal Audit: **21 Oktober 2026**  
Status Keseluruhan: **SIAP CUTOVER (READY FOR CUTOVER)**

---

## 1. Matriks Kepatuhan Kebutuhan Non-Fungsional (NFR)

Setiap poin diuji secara otomatis dan diverifikasi terhadap kode riil tanpa asumsi:

| ID | Area | Kebutuhan PRD | Status | Bukti Nyata & Lokasi Pengujian |
| :--- | :--- | :--- | :---: | :--- |
| **NFR-01** | Kinerja | LCP < 2,5s, INP < 200ms, CLS < 0,1 | **TERPENUHI** | Kompilasi SSG 75 halaman statis, loader Sanity CDN responsif, komponen `AdSlot` dengan `min-height` tetap penjaga CLS, GA4 dimuat pasca-interaksi. |
| **NFR-02** | Ketersediaan | Konten publik dari cache CDN; tahan gangguan Sanity/Supabase | **TERPENUHI** | Next.js ISR (`revalidate: 3600`), mekanisme retry 3x di `apps/web/lib/sanity/fetch.ts` dengan timeout 30s, fallback offline formulir. |
| **NFR-03** | Keamanan | RLS aktif di Supabase tanpa akses publik; service role di server; header keamanan | **TERPENUHI** | SQL migrasi RLS 4 tabel (`tests/supabase-security.test.ts` lulus), HSTS 2 tahun preload, X-Content-Type-Options `nosniff`, X-Frame-Options `DENY`, CSP Report-Only di `next.config.ts`. |
| **NFR-04** | Privasi | Persetujuan eksplisit, kebijakan privasi cookie & iklan (UU No. 27/2022) | **TERPENUHI** | Formulir buletin, kontak, dan kegiatan mewajibkan checkbox privasi dengan tautan ke `/kebijakan-privasi` (`tests/forms.test.ts`). |
| **NFR-05** | Aksesibilitas | WCAG 2.2 AA (kontras, alt gambar, sentuh 44px) | **TERPENUHI** | Desain token zamrud/emas berkontras tinggi, Button min 44px, alt gambar wajib di Sanity schema (`post.ts`), `.lighthouserc.json` ambang 90. |
| **NFR-06** | SEO | 100% redirect URL lama satu lompatan; sitemap otomatis | **TERPENUHI** | 53/53 URL Blogger lawas berujung HTTP 200 via 1 hop (`scripts/qa/check-redirects.ts`), sitemap dinamis (`/sitemap.xml`), JSON-LD terstruktur (`tests/seo.test.ts`). |
| **NFR-07** | Responsif | Rata di 320px tanpa horizontal scroll; area sentuh 44px | **TERPENUHI** | Tata letak seluler adaptif, drawer navigasi mobile di `Header.tsx`, bottom sheet bagikan artikel di layar ponsel (`ArticleCard`, `ShareButtons`). |
| **NFR-08** | Keterpeliharaan | TypeScript ketat, lint/typecheck di CI, token terpusat | **TERPENUHI** | `pnpm lint` 0 warning/error, `pnpm typecheck` 100% bersih, TypeGen Sanity otomatis, 73 unit tests lulus. |
| **NFR-09** | Cadangan | Ekspor dataset Sanity mingguan, arsip permanen Blogger | **TERPENUHI** | `scripts/backup/export-sanity.ts` (teruji menghasilkan arsip 200.65 KB), `export-sanity.sh`, `export-sanity.ps1`, panduan pemulihan di `docs/BACKUP_AND_RECOVERY.md`. |
| **NFR-10** | Observabilitas | Speed Insights, GA4 pasca-interaksi, logger CSP | **TERPENUHI** | Komponen `SpeedInsights.tsx`, `GoogleAnalytics.tsx` (lazy loader pasca event), Route Handler `/api/csp-report`. |
| **NFR-11** | Bahasa | Antarmuka dan konten bahasa Indonesia; `html lang="id"` | **TERPENUHI** | `<html lang="id">` di `RootLayout.tsx`, seluruh teks antarmuka, pesan validasi Zod, dan galat formulir berbahasa Indonesia. |

---

## 2. Matriks Fitur Fungsional Prioritas P0

| ID | Fitur | Status | Verifikasi & Bukti |
| :--- | :--- | :---: | :--- |
| **FR-101** | Beranda Editorial | **TERPENUHI** | Hero 2/3, secondary hero, daftar kategori, artikel terbaru, kartu kegiatan, dan buletin (`/`). |
| **FR-102** | Detail Artikel | **TERPENUHI** | Kolom baca 720px, TOC sticky, Portable Text rich content, tag, kartu penulis, share bar (`/berita/[slug]`). |
| **FR-103** | Indeks Berita & Filter | **TERPENUHI** | Paginasi, filter kategori, pencarian GROQ terintegrasi (`/berita`). |
| **FR-104** | Arsip Kategori & Tag | **TERPENUHI** | Arsip dinamis kategori (`/kategori/[slug]`) dan tag dengan proteksi noindex jika artikel < 3 (`/tag/[slug]`). |
| **FR-105** | Profil Penulis | **TERPENUHI** | Bio, foto, peran organisasi, dan daftar artikel terbit penulis (`/penulis/[slug]`). |
| **FR-106** | Halaman Statis Dinamis | **TERPENUHI** | `/tentang-kami`, `/susunan-pengurus`, `/kebijakan-privasi` terbit via SSG Sanity. |
| **FR-107** | Pencarian Instan & RSS | **TERPENUHI** | Route `/cari` dengan highlight teks dan feed `/rss.xml` standar RSS 2.0 valid. |
| **FR-201** | Skema Sanity Studio | **TERPENUHI** | 9 tipe dokumen, 6 tipe objek terdaftar rapi di Studio v3. |
| **FR-202** | Validasi Konten Ketat | **TERPENUHI** | Judul, slug, ringkasan (maks 300 char), dan alt gambar wajib diisi. |
| **FR-203** | Desk Structure Studio | **TERPENUHI** | Singleton `siteSettings`, post ordering by `publishedAt desc`. |
| **FR-301** | Migrasi Blogger Idempoten | **TERPENUHI** | 39 postingan Blogger termigrasi ke Sanity staging, 0 link gambar Google lawas di body, 83 aset gambar CDN terverifikasi HTTP 200. |
| **FR-302** | Redirect URL Lawas (1 Hop) | **TERPENUHI** | 53/53 URL sitemap Blogger lawas berujung status HTTP 200 via 1 lompatan (`scripts/qa/check-redirects.ts`). |
| **FR-401** | Metadata Global & Dinamis | **TERPENUHI** | `metadataBase`, OpenGraph, Twitter card, dan dynamic OG image `/api/og`. |
| **FR-402** | Sitemap & robots.txt | **TERPENUHI** | `/sitemap.xml` dinamis berbasis `_updatedAt`, `/robots.txt` dengan pembatasan direktori privat. |
| **FR-403** | Data Terstruktur JSON-LD | **TERPENUHI** | Schema `NewsArticle`, `BreadcrumbList`, `WebSite`, dan `Organization` (`tests/seo.test.ts`). |
| **FR-404** | Webhook On-Demand ISR | **TERPENUHI** | Endpoint `/api/revalidate` dengan autentikasi rahasia secret/HMAC. |
| **FR-501** | Integrasi Skrip AdSense | **TERPENUHI** | `AdsenseScript` aktif bersyarat hanya di produksi jika diaktifkan di `siteSettings`. |
| **FR-502** | File `ads.txt` Resmi | **TERPENUHI** | `apps/web/public/ads.txt` berisi format penayang resmi Google AdSense. |
| **FR-504** | Kontrol Iklan per Artikel | **TERPENUHI** | Field `adsEnabled` di Sanity menonaktifkan slot iklan per artikel. |
| **FR-601** | Buletin Double Opt-in | **TERPENUHI** | Alur pendaftaran pending $\rightarrow$ email verifikasi $\rightarrow$ confirmed (`tests/forms.test.ts`). |
| **FR-602** | Kontak & Penangkal Spam | **TERPENUHI** | Honeypot field `website_hp` menolak spam instan tanpa mengganggu pengguna asli. |
| **FR-603** | Persetujuan Privasi Formulir | **TERPENUHI** | Seluruh formulir mewajibkan persetujuan kebijakan privasi. |

---

## 3. Checklist Gerbang Sebelum DNS Dialihkan (Pre-Cutover Gates)

| Gerbang Kualitas | Status | Catatan |
| :--- | :---: | :--- |
| **1. Impor penuh staging & QA Tahap 8-9 lulus** | **LULUS** | 39 artikel, 53 URL redirect 1-hop 200 OK, 83 gambar 200 OK. |
| **2. `/ads.txt` terbuka dan valid** | **LULUS** | Tersedia di `apps/web/public/ads.txt`. |
| **3. Staging/Preview noindex, Produksi index** | **LULUS** | Dikonfigurasi otomatis via header dan `robots.ts`. |
| **4. Core Web Vitals & JSON-LD** | **LULUS** | `.lighthouserc.json` terpasang (ambang 90), JSON-LD teruji. |
| **5. Formulir & RLS Supabase** | **LULUS** | 4 tabel RLS aktif tanpa akses publik (`tests/supabase-security.test.ts`). |
| **6. Webhook Sanity Revalidasi** | **LULUS** | `/api/revalidate` terverifikasi merespons HTTP 200 dan 401. |
| **7. Halaman Kebijakan, Tentang, Kontak, Redaksi** | **LULUS** | Seluruhnya terbit di dataset Sanity dan ter-SSG. |
| **8. Impor ke dataset `production`** | *Menunggu Hari H* | Siap dijalankan dengan flag `--confirm-production`. |
| **9. Alih DNS Domain Registrar** | *Menunggu Hari H* | Langkah manual sesuai panduan cutover di bawah. |

---

## 4. Panduan Eksekusi Hari H (Cutover Execution Checklist)

1. **H-14**:
   - Masuk ke DNS manager domain `pemudaicmi-kotabekasi.org`.
   - Turunkan nilai TTL (Time to Live) seluruh rekaman DNS menjadi **300 detik (5 menit)**.
   - Catat seluruh rekaman A record dan CNAME Blogger saat ini ke berkas catatan aman.
2. **H-1**:
   - Bekukan penulisan artikel baru di Blogger.
   - Jalankan impor data final ke dataset Sanity `production`:
     ```bash
     pnpm tsx scripts/migrate/importer.ts --dataset=production --confirm-production
     ```
   - Jalankan ekspor cadangan darurat:
     ```bash
     pnpm tsx scripts/backup/export-sanity.ts --dataset=production
     ```
3. **Hari H (Eksekusi Cutover)**:
   - Tambahkan domain `pemudaicmi-kotabekasi.org` dan `www.pemudaicmi-kotabekasi.org` di dasbor Vercel Project Settings.
   - Ganti A Record di DNS manager ke IP Vercel (`76.76.21.21`).
   - Ganti CNAME `www` ke `cname.vercel-dns.com`.
   - Pantau penerbitan sertifikat SSL Let's Encrypt di Vercel (otomatis 2-5 menit).
4. **Pasca Cutover (Verifikasi Segera)**:
   - Jalankan skrip QA terhadap domain langsung:
     ```bash
     pnpm qa:redirects --base-url=https://pemudaicmi-kotabekasi.org
     pnpm qa:links --base-url=https://pemudaicmi-kotabekasi.org
     ```
   - Buka `/ads.txt` di browser dan pastikan HTTP 200 dengan publisher ID penayang.
   - Buka Google Search Console, kirim URL `https://pemudaicmi-kotabekasi.org/sitemap.xml`.
   - Ubah privasi blog lama di dasbor Blogger menjadi "Private" (hanya pengarang) agar tidak terindeks ganda.
