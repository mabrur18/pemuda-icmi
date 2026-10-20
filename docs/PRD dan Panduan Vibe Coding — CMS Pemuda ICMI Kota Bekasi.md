# PRD dan Panduan Vibe Coding — CMS Pemuda ICMI Kota Bekasi

Oct 20, 2026 · @Mabrur

## A1. Ringkasan produk, tujuan, dan persona

Dokumen ini menggabungkan rencana CMS dan rencana desain frontend menjadi satu PRD (Bagian A) dan panduan tahapan kerja untuk membangunnya dengan bantuan AI coding (Bagian B).

**Produk.** Portal web Pemuda ICMI Kota Bekasi di pemudaicmi-kotabekasi.org: situs berita, kegiatan, dan publikasi organisasi, dengan Sanity sebagai CMS, Supabase sebagai database transaksional, Next.js di Vercel sebagai frontend, serta AdSense untuk monetisasi.

**Masalah.** Blogger membatasi kustomisasi desain, kontrol SEO teknis, alur editorial berperan, dan pengelolaan data pendaftar kegiatan. Situs juga tidak memiliki fondasi untuk fitur organisasi yang berkembang.

**Tujuan**

- Pengurus menulis, meninjau, dan menerbitkan artikel dari Sanity Studio dengan alur editorial yang jelas.
- Seluruh konten Blogger berpindah tanpa kehilangan peringkat pencarian.
- Tampilan modern, cepat, dan nyaman di ponsel.
- AdSense berjalan sejak hari pertama dan dapat dikelola dari CMS.
- Data pendaftar kegiatan, buletin, dan pesan kontak tersimpan aman di Supabase.

**Persona**

| Persona | Kebutuhan utama | Perangkat dan konteks |
| --- | --- | --- |
| Pembaca umum | Menemukan dan membaca artikel cepat, membagikannya lewat WhatsApp | Ponsel, datang dari Google atau grup WhatsApp |
| Calon peserta kegiatan | Melihat agenda dan mendaftar tanpa langkah berbelit | Ponsel |
| Penulis (pengurus bidang) | Menulis draf, menambah gambar, mengisi metadata dasar | Laptop |
| Redaktur | Meninjau, menyunting SEO, menerbitkan atau menjadwalkan | Laptop |
| Administrator | Mengelola pengguna, pengaturan situs, iklan, redirect, dan data pendaftar | Laptop |

## A2. Ruang lingkup

Prioritas memakai tiga tingkat: **P0** wajib ada saat cutover, **P1** menyusul dalam 4 sampai 8 minggu setelah peluncuran, **P2** pengembangan lanjutan.

| Tingkat | Isi |
| --- | --- |
| P0 (rilis 1) | Situs publik (beranda, artikel, kategori, tag, penulis, halaman statis, pencarian dasar), Sanity Studio dengan peran, migrasi penuh konten Blogger, redirect, SEO teknis, AdSense dan `ads.txt`, formulir buletin dan kontak, RSS, sitemap, deployment Vercel |
| P1 (rilis 2) | Halaman kegiatan dengan pendaftaran online, halaman publikasi, mode gelap, unit iklan manual, pratinjau draf dengan Presentation tool, artikel terkait lanjutan, halaman admin pendaftar |
| P2 (lanjutan) | Arsip komentar lama, pencarian teks penuh, buletin otomatis, statistik baca di dasbor, multibahasa |

**Di luar ruang lingkup:** portal anggota berbayar, sistem komentar baru, aplikasi seluler, e-commerce, dan integrasi pembayaran.

## A3. Kebutuhan fungsional

Setiap kebutuhan punya ID agar bisa dirujuk dalam prompt dan pengujian.

| ID | Kebutuhan | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| FR-101 | Beranda dengan hero satu artikel utama, daftar terbaru, kegiatan mendatang, blok buletin | P0 | Data dari Sanity; tata letak sesuai wireframe desktop dan ponsel |
| FR-102 | Halaman artikel `/berita/[slug]` dengan gambar sampul, meta, daftar isi, bagikan, penulis, artikel terkait | P0 | Isi Portable Text terender penuh; JSON-LD `Article` valid |
| FR-103 | Halaman kategori, tag, dan penulis dengan paginasi | P0 | Hanya halaman dengan kurang dari 3 artikel yang `noindex` untuk tag |
| FR-104 | Halaman statis (Tentang, Redaksi, Kontak, Kebijakan Privasi) | P0 | Dikelola dari Sanity |
| FR-105 | Pencarian artikel berdasar judul dan ringkasan | P0 | Hasil muncul kurang dari 1 detik pada dataset penuh |
| FR-106 | Tombol bagikan WhatsApp, Facebook, X, salin tautan, Web Share di ponsel | P0 | Tautan berisi judul dan URL kanonik |
| FR-107 | Feed RSS `/rss.xml` berisi 20 artikel terbaru | P0 | Valid di pemeriksa RSS |
| FR-201 | Sanity Studio dengan tipe `post`, `page`, `author`, `category`, `tag`, `event`, `publication`, `siteSettings`, `redirect` | P0 | Skema sesuai A6 |
| FR-202 | Tiga peran: Administrator, Editor, Penulis | P0 | Penulis tidak dapat menerbitkan |
| FR-203 | Validasi Studio: slug unik, alt gambar wajib, batas karakter SEO | P0 | Dokumen invalid tidak dapat diterbitkan |
| FR-204 | Pratinjau draf di Presentation tool | P1 | Draf tampil `noindex` tanpa iklan |
| FR-205 | Penerbitan terjadwal | P1 | Artikel tayang pada waktu yang diatur |
| FR-301 | Skrip migrasi Blogger yang idempoten (parse, bersihkan, HTML ke Portable Text, unggah gambar, impor) | P0 | Impor ulang tidak menghasilkan duplikat |
| FR-302 | Peta redirect URL lama ke baru dan aturan redirect permanen | P0 | 100% URL sitemap lama berujung 200 dalam satu lompatan |
| FR-401 | Metadata per halaman: judul, deskripsi, canonical, Open Graph, Twitter card | P0 | Tidak ada halaman tanpa canonical |
| FR-402 | `sitemap.xml` dan `robots.txt` dinamis | P0 | `lastmod` dari `_updatedAt` |
| FR-403 | JSON-LD: `Article`, `BreadcrumbList`, `Organization`, `WebSite` | P0 | Lolos Rich Results Test |
| FR-404 | Revalidasi on-demand lewat webhook Sanity | P0 | Artikel tayang kurang dari 60 detik setelah Publish |
| FR-501 | Skrip AdSense dan meta verifikasi, dikendalikan `siteSettings.adsense.enabled` | P0 | Mati otomatis di dev, preview, dan halaman `noindex` |
| FR-502 | `public/ads.txt` dengan ID penayang | P0 | Terbuka di `/ads.txt`; status sah di dasbor AdSense |
| FR-503 | Komponen `AdSlot` dengan tinggi tetap dan penyisipan setelah paragraf ke-N | P1 | CLS tetap di bawah 0,1 |
| FR-504 | Toggle `adsEnabled` per artikel | P0 | Artikel dengan toggle mati tanpa slot |
| FR-601 | Formulir buletin dengan double opt-in | P0 | Status `pending` lalu `confirmed` |
| FR-602 | Formulir kontak ke Supabase | P0 | Tersimpan dengan penangkal spam dan pembatasan laju |
| FR-603 | Persetujuan privasi pada semua formulir | P0 | Tautan Kebijakan Privasi dan kotak centang wajib |
| FR-701 | Halaman kegiatan dan pendaftaran online | P1 | Unik per (kegiatan, email); status buka, penuh, selesai |
| FR-702 | Halaman publikasi dengan unduhan PDF | P1 | Ukuran berkas dan tahun tampil |
| FR-703 | Halaman admin pendaftar (daftar dan ekspor CSV) | P1 | Hanya Administrator |
| FR-801 | Mode gelap: terang, gelap, ikuti sistem | P1 | Tanpa kilatan warna saat dimuat |

## A4. Kebutuhan non-fungsional

| ID | Area | Kebutuhan |
| --- | --- | --- |
| NFR-01 | Kinerja | Persentil 75 seluler: LCP di bawah 2,5 detik, INP di bawah 200 md, CLS di bawah 0,1 |
| NFR-02 | Ketersediaan | Halaman publik disajikan dari cache CDN; situs tetap tayang saat Sanity atau Supabase terganggu sementara |
| NFR-03 | Keamanan | RLS aktif di semua tabel Supabase; kunci service role hanya di server; token Sanity hanya baca untuk situs; header keamanan terpasang |
| NFR-04 | Privasi | Persetujuan eksplisit di formulir, kebijakan privasi memuat cookie dan iklan, selaras UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi |
| NFR-05 | Aksesibilitas | WCAG 2.2 AA: kontras, papan ketik, landmark, alt gambar |
| NFR-06 | SEO | Tidak ada penurunan klik organik lebih dari 10% pada 8 minggu pertama |
| NFR-07 | Responsif | Tidak ada gulir horizontal pada lebar 320 px; area sentuh minimal 44 px |
| NFR-08 | Keterpeliharaan | TypeScript ketat, lint dan pemeriksaan tipe di CI, token desain terpusat, komponen terdokumentasi di Storybook |
| NFR-09 | Cadangan | Ekspor dataset Sanity mingguan, cadangan Supabase sesuai paket, arsip XML Blogger permanen |
| NFR-10 | Observabilitas | Speed Insights, log Vercel, pemeriksa uptime, notifikasi Search Console |
| NFR-11 | Bahasa | Antarmuka dan konten berbahasa Indonesia; `html lang="id"` |

## A5. Arsitektur dan stack

Next.js di Vercel menarik konten dari Sanity saat membangun halaman dan menulis data pengunjung ke Supabase lewat server.

&#91;embedded content: arsitektur sistem · 5 komponen\]

Editor menerbitkan di Studio, webhook Sanity memberi tahu Next.js, dan halaman terkait dibangun ulang tanpa deploy ulang. Formulir publik tidak menyentuh Sanity.

| Lapisan | Pilihan | Catatan |
| --- | --- | --- |
| Frontend | Next.js App Router, TypeScript, Tailwind CSS | Server Components, ISR, `generateMetadata` |
| Komponen UI | shadcn/ui (Radix), Lucide, Storybook | Disalin ke repositori dan disesuaikan |
| CMS | Sanity Studio dan `next-sanity` | GROQ, TypeGen, Presentation tool |
| Database | Supabase Postgres | RLS, `@supabase/supabase-js`, validasi Zod |
| Hosting | Vercel | Paket Hobby untuk non-komersial; situs beriklan kemungkinan perlu Pro |
| Gambar | CDN Sanity dan `next/image` | `auto=format`, lebar responsif |
| Analitik | GA4, Search Console, Speed Insights | Verifikasi domain lewat DNS |

**Keputusan arsitektur**

- Sanity adalah satu-satunya sumber kebenaran konten; artikel tidak disalin ke Supabase.
- Supabase hanya ditulis dari server (Route Handler dengan service role key), RLS aktif di semua tabel.
- Halaman artikel statis dengan ISR dan revalidasi berbasis tag dari webhook Sanity.
- Dua dataset Sanity: `production` dan `staging`; preview Vercel memakai `staging`.
- Monorepo pnpm: `apps/web` (Next.js), `apps/studio` (Sanity), `scripts/migrate` (migrasi), `packages/` bila ada kode bersama.

## A6. Model data

**Sanity (konten editorial)**

| Tipe | Field utama |
| --- | --- |
| `post` | `title`, `slug`, `excerpt`, `coverImage` (alt, keterangan, kredit), `body` (Portable Text), `publishedAt`, `updatedAt`, `author`, `categories`, `tags`, `seo`, `adsEnabled`, `legacy` |
| `page` | `title`, `slug`, `body`, `seo`, `showInNav` |
| `author` | `name`, `slug`, `photo`, `bio`, `role`, `social` |
| `category` | `title`, `slug`, `description`, `seo` |
| `tag` | `title`, `slug` |
| `event` | `title`, `slug`, `startDate`, `endDate`, `location`, `registrationOpen`, `body`, `seo` |
| `publication` | `title`, `year`, `file`, `summary` |
| `siteSettings` (singleton) | `siteName`, `defaultSeo`, `logo`, `navigation`, `footer`, `organization`, `adsense`, `analytics` |
| `redirect` | `source`, `destination`, `permanent` |

Objek bersama: `seo` (`title` maks 60, `description` 120 sampai 160, `ogImage`, `canonicalUrl`, `noIndex`) dan `legacy` (`bloggerPostId`, `bloggerUrl`, `importedAt`). Portable Text mendukung H2 sampai H4, kutipan, daftar, tautan internal (referensi) dan eksternal, gambar dengan alt wajib, sematan YouTube, kotak catatan, dan blok `adSlot`. `siteSettings.adsense` berisi `enabled`, `publisherId`, `autoAds`, ID slot per posisi, dan `injectAfterParagraph`.

**Supabase (data transaksional)**

```sql
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  confirm_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  source text,
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_sanity_id text not null,
  full_name text not null,
  email text not null,
  phone text,
  organization text,
  extra jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (event_sanity_id, email)
);

create table redirect_map (
  id uuid primary key default gen_random_uuid(),
  blogger_path text not null unique,
  sanity_id text,
  new_path text,
  status text not null default 'mapped',
  checked_at timestamptz
);

-- RLS aktif tanpa kebijakan publik: hanya service role (server) yang dapat mengakses.
alter table subscribers enable row level security;
alter table contact_messages enable row level security;
alter table event_registrations enable row level security;
alter table redirect_map enable row level security;
```

Tabel opsional `legacy_comments` ditambahkan bila komentar Blogger diarsipkan (P2).

## A7. Spesifikasi migrasi Blogger

Migrasi berupa skrip TypeScript di `scripts/migrate` yang dijalankan ke dataset `staging` dulu, lalu `production`, dan aman diulang.

**Aturan**

- Masukan: berkas XML ekspor Blogger (Cadangkan konten). Cadangan: Blogger API v3. Struktur XML aktual diperiksa sebelum parser dikunci.
- Dokumen mendapat `_id` deterministik `post.blogger-<postId>` dan ditulis dengan `createOrReplace` dalam transaksi per 50 dokumen.
- HTML diubah ke Portable Text dengan `htmlToBlocks` dari `@portabletext/block-tools` dan jsdom, dengan aturan khusus untuk pembungkus gambar Blogger, iframe YouTube, dan tabel.
- Gambar dari `googleusercontent.com` dan `bp.blogspot.com` diunduh pada ukuran asli, diunggah ke Sanity dengan `client.assets.upload`, dan dicatat di cache agar tidak diunggah dua kali. Gambar tanpa alt ditandai.
- Slug, tanggal terbit, dan tanggal perbarui asli dipertahankan. Label menjadi `tag`; `label-map.json` memetakan label ke kategori; nama penulis dipetakan ke dokumen `author`.
- Draf Blogger diimpor sebagai draf Sanity; komentar tidak diimpor pada P0.

**Redirect**

| URL lama | URL baru | Cara |
| --- | --- | --- |
| `/YYYY/MM/slug.html` | `/berita/slug` | Satu aturan pola; pengecualian dari `redirect_map` |
| `/p/halaman.html` | `/halaman` | Pemetaan per halaman |
| `/search/label/Nama` | `/kategori/nama` | Pemetaan dari `label-map.json` |
| `/feeds/posts/default` | `/rss.xml` | Redirect tunggal |
| `?m=1`, `?m=0` | URL tanpa parameter | Aturan query |

Redirect permanen di Next.js memakai 308, setara 301 bagi Google. Batas 1.024 entri `redirects` di Vercel dihindari dengan satu pola regex; pengecualian di atas batas dipindahkan ke Middleware dengan Edge Config.

**Lulus bila:** jumlah artikel terbit sama dengan ekspor, tidak ada slug ganda, tidak ada URL gambar Blogger tersisa, semua gambar dan tautan internal berstatus 200, seluruh URL di sitemap lama berujung 200 dalam satu lompatan, dan 30 artikel contoh lolos tinjauan manual.

## A8. Spesifikasi SEO

| Area | Spesifikasi |
| --- | --- |
| Metadata | `generateMetadata` di setiap rute; templat judul "%s \| Pemuda ICMI Kota Bekasi"; canonical absolut lewat `metadataBase`; Open Graph (waktu terbit, penulis, tag); Twitter `summary_large_image`; gambar OG dibuat dengan `next/og` bila `seo.ogImage` kosong |
| Sitemap | `app/sitemap.ts` dari GROQ: artikel, halaman, kategori, tag, penulis, kegiatan; `lastmod` dari `_updatedAt` |
| robots | `app/robots.ts`: izinkan semua, blokir `/api` dan jalur pratinjau, cantumkan sitemap |
| JSON-LD | `Article` atau `NewsArticle`, `BreadcrumbList`, `Organization`, `WebSite`; divalidasi dengan Rich Results Test |
| URL | `/berita/[slug]`, `/kategori/[slug]`, `/tag/[slug]`, `/penulis/[slug]`, `/kegiatan/[slug]`, `/publikasi`, halaman statis di akar |
| Canonical | Self-canonical; satu host utama dengan redirect dari host lain; `noindex` untuk pencarian dan tag dengan kurang dari 3 artikel |
| Kecepatan | ISR, `next/image` dengan loader Sanity, `next/font`, skrip pihak ketiga dimuat setelah interaksi |
| Tautan internal | "Baca juga" berdasar kategori dan tag, breadcrumb, tautan internal berupa referensi dokumen |
| Feed | `/rss.xml` 20 artikel, `link rel="alternate"` di `<head>` |
| Bahasa | `<html lang="id">`, `og:locale` `id_ID` |
| Galat | 404 bersatus 404; 410 untuk konten yang sengaja dihapus |
| Pratinjau | Draft Mode dengan `noindex` dan tanpa iklan |
| Sinyal kepercayaan | Halaman penulis, Redaksi, Tentang; tanggal terbit dan diperbarui tampil |

Di Studio, editor hanya mengisi `seo.title` dan `seo.description` bila ingin mengganti bawaan; pratinjau hasil pencarian dan penghitung karakter tersedia. Pemantauan lewat Search Console (properti domain via DNS, sitemap baru, laporan mingguan 8 minggu) dan Bing Webmaster Tools.

## A9. Spesifikasi AdSense

| Komponen | Spesifikasi |
| --- | --- |
| Status situs | Periksa Situs di dasbor AdSense sebelum cutover; bila diminta verifikasi ulang, pasang meta `google-adsense-account` lewat `metadata.other` |
| `ads.txt` | `public/ads.txt` berisi `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`; terbuka di `/ads.txt` sebelum DNS dialihkan |
| Skrip | `next/script`, `strategy="afterInteractive"`, `async`, `crossOrigin="anonymous"`; dirender hanya bila `siteSettings.adsense.enabled` benar dan lingkungan produksi |
| Penempatan | Tahap 1: Auto ads. Tahap 2 (setelah 4 minggu data): unit manual dalam artikel (setelah paragraf ke-3), bawah artikel, bilah samping desktop, antarartikel di daftar |
| Kontrol | `siteSettings.adsense` (`enabled`, `publisherId`, `autoAds`, ID slot, `injectAfterParagraph`) dan `post.adsEnabled` |
| CLS | Wadah iklan memiliki `min-height` tetap per posisi |
| Tanpa iklan | Pratinjau, dev, halaman `noindex`, 404, pencarian, halaman formulir |
| Privasi | Kebijakan Privasi memuat cookie dan iklan Google; pesan persetujuan, dan CMP tersertifikasi untuk lalu lintas EEA, Inggris, Swiss |
| Kebijakan | Konten dominan atas iklan; tidak ada ajakan mengeklik iklan |

Komponen `AdSlot` (klien) memanggil `adsbygoogle.push({})` satu kali per mount dengan penjaga `useRef`, memakai `data-ad-format="auto"` dan `data-full-width-responsive="true"`. Setelah cutover, penempatan iklan tidak diubah selama dua minggu pertama dan RPM dibandingkan dengan baseline 30 hari sebelumnya.

## A10. Spesifikasi UI/UX

Gaya **editorial modern**: terang, lapang, berfokus pada tulisan, dengan hijau zamrud sebagai warna utama dan emas hangat sebagai aksen. Seluler dulu, satu bahasa visual, tanpa dekorasi berlebih.

**Token warna** (usulan; sesuaikan dengan warna resmi logo bila berbeda)

| Token | Terang | Gelap | Pemakaian |
| --- | --- | --- | --- |
| `--brand` | `#0F6B4F` | `#3FBF93` | Tombol utama, tautan |
| `--brand-strong` | `#0B5640` | `#2FA57C` | Hover, hero |
| `--brand-soft` | `#E8F5EF` | `#12251D` | Chip, kotak catatan |
| `--accent` | `#E0A526` | `#F0B945` | Label kategori, CTA sekunder (selalu dengan teks gelap) |
| `--ink` | `#14201B` | `#E8EFEA` | Teks |
| `--muted` | `#55635C` | `#9AA9A1` | Meta |
| `--bg` / `--surface` | `#F7F8F5` / `#FFFFFF` | `#0E1512` / `#16201B` | Latar dan kartu |
| `--border` | `#E3E8E4` | `#26332C` | Garis |

**Tipografi:** Plus Jakarta Sans untuk judul dan antarmuka (H1 28/36 seluler, 40/48 desktop), Source Serif 4 untuk isi artikel (18/30 seluler, 20/34 desktop, lebar baris 65 sampai 72 karakter), dimuat lewat `next/font`. **Bentuk:** radius kartu 16 px, kontrol 12 px, chip pil; bayangan lembut hanya pada kartu yang bisa diklik; ikon Lucide garis 1,75 px; foto 16:9; motif bintang geometris berkontras 4 sampai 6 persen hanya di hero, kaki halaman, dan blok buletin.

**Grid dan breakpoint**

| Breakpoint | Lebar | Kolom | Perilaku |
| --- | --- | --- | --- |
| Ponsel | di bawah 640 px | 4 | Satu kolom, hamburger |
| Tablet | 640 sampai 1023 px | 8 | Kartu dua kolom |
| Laptop | 1024 sampai 1279 px | 12 | Bilah samping muncul, menu horizontal |
| Layar lebar | 1280 px ke atas | 12 | Wadah maksimal 1.200 px |

**Beranda.** Header menempel (72 px, mengecil jadi 56 px saat digulir): logo, menu (Beranda, Berita, Kegiatan, Publikasi, Tentang), cari, mode gelap, tombol emas "Daftar Kegiatan". Hero: satu artikel utama (dua pertiga lebar di desktop) dengan tiga artikel sekunder; di ponsel satu foto penuh lalu kartu horizontal. Lalu baris chip kategori, daftar terbaru (tiga kolom), iklan antarartikel bertinggi tetap, kartu kegiatan, blok buletin, dan kaki halaman empat kolom.

**Artikel.** Kolom baca 720 px di tengah; daftar isi dan tombol bagikan menempel di kiri; bilah samping kanan berisi iklan 300x250, artikel populer, dan buletin. Urutan: breadcrumb, label kategori, judul H1, meta, gambar sampul, isi, tag, kartu penulis, iklan bawah, baca juga. Di ponsel semuanya satu kolom, daftar isi dilipat, bagikan menjadi bilah bawah, dan bilah samping hilang. Tidak ada iklan di atas judul; iklan pertama setelah paragraf ke-3.

**Komponen inti:** kartu artikel (besar, standar, horizontal, kompak), hero, tombol (utama, sekunder, aksen, ghost; area sentuh 44 px), chip, kartu kegiatan (blok tanggal, lencana Buka, Penuh, Selesai), kartu publikasi, kartu penulis, formulir (label di atas, galat inline), isi artikel (kutipan, kotak catatan, gambar berketerangan, YouTube 16:9, tabel yang dapat digeser), daftar isi, bagikan (WhatsApp lebih dulu, Web Share di ponsel), pencarian layar penuh, slot iklan berlabel "Iklan", skeleton, toast, banner cookie.

**Gerak dan tema:** durasi 150 sampai 250 ms, `ease-out`, kartu naik 2 sampai 4 px saat hover, fade pada beranda saja, semua dimatikan lewat `prefers-reduced-motion`. Mode gelap: Terang, Gelap, Ikuti sistem, dengan skrip pra-render agar tanpa kilatan. **Aksesibilitas:** WCAG 2.2 AA, cincin fokus 2 px, tautan lewati ke isi, landmark yang benar, tata letak utuh pada pembesaran 200 persen.

## A11. Kriteria penerimaan dan metrik

| Indikator | Target | Cara ukur |
| --- | --- | --- |
| Artikel termigrasi | 100% artikel terbit | Hitung ekspor Blogger vs dataset Sanity |
| Cakupan redirect | 100% URL sitemap lama dan 200 halaman teratas | Skrip uji redirect di CI |
| Klik organik, 8 minggu | Tidak turun lebih dari 10% dari baseline | Search Console |
| Core Web Vitals (p75 seluler) | LCP < 2,5 dtk, INP < 200 md, CLS < 0,1 | PageSpeed Insights, CrUX |
| Lighthouse (preview) | Kinerja, SEO, Aksesibilitas masing-masing 90 ke atas | Lighthouse CI |
| AdSense | Situs disetujui dan `ads.txt` sah | Dasbor AdSense |
| Waktu terbit | Kurang dari 60 detik dari Publish sampai tayang | Uji webhook |
| Keamanan data | Akses anonim ke tabel Supabase ditolak | Uji otomatis RLS |
| Data terstruktur | Lolos pada 5 artikel contoh | Rich Results Test |

**Definition of done untuk setiap fitur:** kode lolos lint dan pemeriksaan tipe, ada pengujian untuk logika penting, tampilan diperiksa di lebar 360 dan 1280 px, mode terang dan gelap (bila sudah ada), tidak ada galat konsol, dan kriteria penerimaan pada A3 terpenuhi.

## A12. Asumsi, risiko, dan keputusan terbuka

**Asumsi**

- Situs Blogger memakai domain kustom dan pola URL standar Blogger; struktur ekspor XML diperiksa pada berkas nyata di Tahap 8.
- Satu pengembang paruh waktu dibantu AI; estimasi 7 minggu sampai cutover dan 8 minggu stabilisasi.
- Akun AdSense sudah ada dan situs sudah pernah disetujui.
- Ketentuan paket Vercel, Sanity, dan Supabase belum diverifikasi dan dicek di Tahap 0.

**Risiko utama**

| Risiko | Mitigasi |
| --- | --- |
| Peringkat turun setelah pindah | Slug dipertahankan, redirect satu lompatan, sitemap baru, pemantauan 8 minggu, pemulihan DNS |
| Pendapatan AdSense turun sementara | `ads.txt` aktif sebelum cutover, penempatan tidak diubah 2 minggu |
| Konversi HTML merusak format | Aturan khusus, impor ke `staging`, tinjau 30 artikel, impor idempoten |
| Gambar Blogger hilang | Semua gambar diunggah sebelum cutover; blog tidak dihapus 30 hari |
| Pola redirect salah atau melebihi batas | Satu pola regex, uji di CI, Middleware cadangan |
| Biaya layanan | Putuskan paket di Tahap 0 berdasarkan harga terkini |
| Kebocoran data pendaftar | RLS, service role di server, uji akses anonim |
| Hasil kode AI tidak konsisten | Berkas konteks, tahap kecil, pengujian, tinjauan setiap tahap (Bagian B) |

**Keputusan terbuka**

- [ ] Pola URL baru `/berita/slug` dengan redirect (rekomendasi) atau tetap `/YYYY/MM/slug.html`.
- [ ] Nasib komentar Blogger: tidak dimigrasikan (rekomendasi) atau diarsipkan.
- [ ] Warna resmi logo dan ketersediaan foto kegiatan untuk hero.
- [ ] Mode gelap ikut rilis awal atau P1.
- [ ] Tombol utama header: "Daftar Kegiatan" atau "Gabung".
- [ ] Paket layanan: Vercel, Sanity, Supabase.

## B1. Cara kerja vibe coding dan persiapan

Bagian B memecah pembangunan menjadi 12 tahap kecil (Tahap 0 sampai 11). Setiap tahap punya tujuan, prompt siap pakai, hasil yang harus ada, dan cara memverifikasi. Panduan ini tidak terikat satu alat; contohnya ditulis untuk AI coding berbasis terminal atau IDE seperti Claude Code.

**Akun dan akses yang disiapkan lebih dulu**

| Layanan | Untuk | Yang disiapkan |
| --- | --- | --- |
| GitHub | Repositori dan CI | Repositori privat di akun organisasi |
| Vercel | Hosting, preview, domain | Proyek terhubung GitHub; akses ke pengaturan domain |
| Sanity | CMS | Proyek dan dua dataset: `production`, `staging` |
| Supabase | Database | Proyek baru; simpan URL, anon key, service role key |
| Google | AdSense, GA4, Search Console | Akses admin ke ketiganya |
| Registrar atau DNS | Cutover | Akses ubah rekaman DNS dan catatan DNS saat ini |
| Berkas ekspor Blogger | Migrasi | XML cadangan konten dan daftar URL sitemap lama |

**Berkas di repositori sejak hari pertama**

- `docs/PRD.md`: salinan Bagian A dokumen ini; sumber kebenaran kebutuhan.
- `CLAUDE.md`: aturan proyek untuk AI (isi di B2).
- `docs/PROGRESS.md`: daftar tahap, status, dan catatan; diperbarui di akhir setiap tahap.
- `docs/DECISIONS.md`: keputusan penting dan alasannya, termasuk jawaban atas keputusan terbuka A12.

**Ritme kerja per tugas**

1. Minta AI membaca bagian PRD yang relevan, lalu membuat rencana langkah singkat tanpa menulis kode; setujui atau koreksi.
2. Implementasikan satu tugas kecil (satu komponen, satu halaman, satu skrip).
3. Jalankan `pnpm lint`, `pnpm typecheck`, dan pengujian; perbaiki sampai hijau.
4. Lihat hasilnya sendiri di browser pada lebar 360 dan 1280 px.
5. Tinjau diff, lalu commit dengan pesan jelas di cabang tahap (`stage/04-pages`).
6. Perbarui `docs/PROGRESS.md`; mulai sesi baru di awal tahap berikutnya agar konteks tetap bersih.

**Aturan emas**

- Satu tahap, satu tujuan. Jangan minta "bangun seluruh situs" dalam satu prompt.
- Rujuk ID kebutuhan (misalnya FR-102) agar hasil bisa diperiksa terhadap PRD.
- Jangan menempel kunci rahasia di prompt atau repositori; pakai `.env.local` dan variabel lingkungan Vercel.
- Minta AI menjalankan perintah dan melaporkan hasil nyata, bukan mengklaim berhasil.
- Bila AI menyimpang dari PRD, koreksi dengan merujuk ID, bukan menulis ulang seluruh instruksi.
- Impor data ke `production` hanya setelah `staging` lolos QA.

## B2. Berkas konteks `CLAUDE.md`

Simpan berkas ini di akar repositori. AI membacanya di awal setiap sesi, sehingga aturan proyek tidak perlu diulang di setiap prompt.

```markdown
# Proyek: Portal Pemuda ICMI Kota Bekasi

CMS situs pemudaicmi-kotabekasi.org: Next.js (App Router, TypeScript) di Vercel,
Sanity sebagai CMS, Supabase untuk data transaksional. Kebutuhan lengkap ada di
docs/PRD.md. Rujuk ID kebutuhan (FR-xxx, NFR-xx) saat bekerja.

## Struktur
- apps/web      : situs publik Next.js
- apps/studio   : Sanity Studio dan skema
- scripts/migrate : skrip migrasi Blogger (idempoten)
- docs/         : PRD.md, PROGRESS.md, DECISIONS.md

## Aturan umum
- Bahasa antarmuka dan konten: Indonesia. Kode, nama variabel, komentar: Inggris.
- TypeScript strict. Tanpa `any` kecuali dijelaskan.
- Gunakan pnpm. Jalankan `pnpm lint`, `pnpm typecheck`, `pnpm test` sebelum menyatakan selesai.
- Jangan pernah menulis kunci rahasia ke kode atau repositori. Pakai env var.
- SUPABASE_SERVICE_ROLE_KEY hanya dipakai di server (Route Handler / Server Action).
- Semua tabel Supabase memakai RLS tanpa kebijakan publik; akses lewat server.
- Konten editorial hanya di Sanity. Jangan menyalin artikel ke Supabase.
- Query Sanity memakai GROQ dengan tipe dari TypeGen; semua fetch diberi cache tag.

## Desain
- Ikuti token di apps/web/app/globals.css dan komponen di components/ui.
- Seluler dulu (360 px), lalu 1024 dan 1280 px. Tidak boleh ada gulir horizontal.
- Gambar lewat next/image dengan width dan height. Wadah iklan bertinggi tetap.
- Aksesibilitas WCAG 2.2 AA: kontras, fokus terlihat, alt gambar, landmark.

## SEO dan iklan
- Setiap rute punya generateMetadata dengan canonical absolut.
- Slug lama Blogger tidak boleh berubah. Redirect permanen untuk semua URL lama.
- Skrip AdSense hanya di produksi dan bila siteSettings.adsense.enabled benar.
- Halaman preview, 404, pencarian, dan noindex tidak memuat iklan.

## Cara bekerja
- Buat rencana singkat dulu dan tunggu persetujuan sebelum mengubah banyak berkas.
- Kerjakan satu tugas kecil per langkah. Jangan menambah dependensi tanpa alasan.
- Laporkan hasil perintah yang benar-benar dijalankan, termasuk galat.
- Di akhir tahap, perbarui docs/PROGRESS.md dan catat keputusan di docs/DECISIONS.md.
```

Perbarui berkas ini setiap kali ada aturan baru yang harus selalu dipatuhi AI, misalnya setelah memutuskan pola URL atau paket layanan.

## B3. Tahap 0 dan 1

### Tahap 0: Fondasi repositori

**Tujuan.** Monorepo siap, CI hijau, dan preview Vercel terhubung. Belum ada fitur.

**Langkah manual Anda lebih dulu:** buat repositori GitHub privat, proyek Sanity (dataset `production` dan `staging`), proyek Supabase, dan hubungkan repositori ke Vercel. Salin `docs/PRD.md` dan `CLAUDE.md` ke repositori.

**Prompt**

```text
Baca CLAUDE.md dan docs/PRD.md bagian A5. Tugas: siapkan monorepo pnpm tanpa fitur apa pun.
1. apps/web: Next.js App Router, TypeScript strict, Tailwind CSS.
2. apps/studio: Sanity Studio, TypeScript.
3. Root: ESLint, Prettier, Vitest; skrip lint, typecheck, test, dan build.
4. .env.example berisi NAMA variabel saja: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
   SANITY_API_READ_TOKEN, SANITY_REVALIDATE_SECRET, NEXT_PUBLIC_SUPABASE_URL,
   NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL.
5. GitHub Actions: lint, typecheck, test pada setiap pull request.
6. docs/PROGRESS.md berisi Tahap 0 sampai 11 berstatus belum mulai.
Buat rencana singkat dulu dan tunggu persetujuan saya sebelum menulis berkas.
```

**Hasil:** repositori terstruktur sesuai A5, CI hijau, deploy Vercel menampilkan halaman awal. **Verifikasi:** `pnpm install && pnpm lint && pnpm typecheck && pnpm build` sukses; preview Vercel terbuka.

### Tahap 1: Skema Sanity dan Studio (FR-201, FR-202, FR-203)

**Tujuan.** Studio dengan seluruh tipe dokumen, validasi, dan struktur menu yang rapi.

**Prompt**

```text
Baca docs/PRD.md bagian A3 (FR-201 sampai FR-203) dan A6. Implementasikan skema Sanity di apps/studio:
- Dokumen: post, page, author, category, tag, event, publication, siteSettings (singleton), redirect.
- Objek: seo (title maks 60, description 120-160, ogImage, canonicalUrl, noIndex) dan legacy
  (bloggerPostId, bloggerUrl, importedAt).
- blockContent (Portable Text): H2-H4, kutipan, daftar, tautan internal (referensi) dan eksternal,
  gambar dengan alt WAJIB, keterangan, kredit; blok youtube, callout, adSlot.
- Validasi: slug unik, publishedAt wajib, coverImage wajib untuk post, alt wajib, referensi author dan
  category tidak boleh dihapus bila dipakai.
- Desk structure: siteSettings sebagai singleton, daftar post diurutkan publishedAt menurun.
- Preview list untuk setiap tipe (judul, penulis, tanggal).
Jalankan sanity schema extract dan sanity typegen generate; simpan tipe di apps/web. Deploy Studio ke
dataset staging, lalu seed 3 author, 5 category, dan 5 post contoh. Rencana dulu, tunggu persetujuan.
```

**Hasil:** Studio berjalan lokal dan ter-deploy, tipe TypeScript dihasilkan, data contoh di `staging`. **Verifikasi:** coba menerbitkan artikel tanpa alt gambar atau dengan slug ganda dan pastikan ditolak; undang satu pengguna uji dengan peran Penulis dan pastikan tidak dapat menerbitkan (peran diatur di dasbor Sanity).

## B4. Tahap 2 dan 3

### Tahap 2: Database Supabase (NFR-03, dasar FR-601 sampai FR-603)

**Tujuan.** Tabel dan keamanan siap, diuji, dan hanya dapat diakses dari server.

**Prompt**

```text
Baca docs/PRD.md bagian A6 (Supabase) dan NFR-03. Tugas:
1. Inisialisasi Supabase CLI dan buat migrasi SQL di supabase/migrations dari skema A6
   (subscribers, contact_messages, event_registrations, redirect_map), RLS aktif, TANPA kebijakan publik.
2. Buat apps/web/lib/supabase/server.ts yang membuat client dengan SUPABASE_SERVICE_ROLE_KEY dan
   memakai 'server-only' agar tidak bisa diimpor ke komponen klien.
3. Buat skema Zod untuk input formulir buletin, kontak, dan pendaftaran kegiatan di lib/validation.ts.
4. Tulis tes otomatis: client dengan anon key TIDAK boleh membaca atau menulis keempat tabel.
Jangan membuat endpoint formulir dulu. Rencana dulu, tunggu persetujuan.
```

**Hasil:** migrasi terterap di proyek Supabase, modul server dan validasi siap. **Verifikasi:** `supabase db push` sukses; tes akses anonim lulus; `grep` memastikan service role key tidak muncul di kode klien maupun repositori.

### Tahap 3: Design system (A10)

**Tujuan.** Token, huruf, dan komponen dasar yang konsisten, terdokumentasi, dengan mode terang dan gelap.

**Prompt**

```text
Baca docs/PRD.md bagian A10. Tugas di apps/web:
1. globals.css berisi token warna terang dan gelap (data-theme='dark'), radius, bayangan; petakan ke Tailwind.
2. Muat Plus Jakarta Sans dan Source Serif 4 lewat next/font (subset latin, display swap).
3. Inisialisasi shadcn/ui; buat komponen: Button (utama, sekunder, aksen, ghost), Chip, Container,
   Header (menempel, mengecil saat digulir, hamburger di ponsel), Footer (4 kolom), ThemeToggle
   (Terang, Gelap, Sistem) dengan skrip pra-render tanpa kilatan.
4. Kartu: ArticleCard (besar, standar, horizontal, kompak), EventCard, PublicationCard, AuthorCard.
5. Storybook dengan story tiap komponen dalam mode terang dan gelap serta lebar 360 dan 1280 px.
6. Semua animasi hormati prefers-reduced-motion; area sentuh minimal 44 px.
Gunakan data contoh statis, belum terhubung ke Sanity. Rencana dulu, tunggu persetujuan.
```

**Hasil:** pustaka komponen yang bisa dilihat di Storybook. **Verifikasi:** buka Storybook di lebar 360 dan 1280 px dan di kedua mode; jalankan pemeriksa aksesibilitas Storybook; pastikan tidak ada gulir horizontal pada 320 px dan kontras teks lulus 4,5:1.

## B5. Tahap 4 dan 5

### Tahap 4: Halaman publik (FR-101 sampai FR-107)

**Tujuan.** Situs dapat dijelajahi dengan data nyata dari Sanity `staging`, sesuai tata letak A10.

**Prompt**

```text
Baca docs/PRD.md bagian A3 (FR-101 sampai FR-107) dan A10. Tugas di apps/web, memakai next-sanity,
GROQ, dan tipe hasil TypeGen:
1. lib/sanity: client, query GROQ per halaman, dan helper fetch dengan cache tag (post:{slug}, posts,
   category:{slug}, tag:{slug}, author:{slug}, event:{slug}, siteSettings).
2. Rute: / (beranda), /berita/[slug], /kategori/[slug], /tag/[slug], /penulis/[slug], /[page-slug]
   untuk halaman statis, /cari, dan not-found.tsx (status 404).
3. Renderer Portable Text: heading, kutipan, daftar, tautan, gambar berketerangan (next/image),
   YouTube 16:9, callout, tabel yang dapat digeser, dan blok adSlot (sementara kotak penanda).
4. Halaman artikel: breadcrumb, label kategori, judul, meta (penulis, tanggal, waktu baca), gambar
   sampul, daftar isi dari H2, bagikan (WhatsApp, Facebook, X, salin tautan, Web Share di ponsel),
   kartu penulis, baca juga (kategori atau tag sama), tata letak sesuai A10.
5. Paginasi di halaman daftar; pencarian berdasar judul dan ringkasan lewat GROQ.
6. Rute /rss.xml untuk 20 artikel terbaru.
7. generateStaticParams dan revalidate 3600 sebagai jaring pengaman.
Kerjakan per rute dan berhenti setelah beranda dan halaman artikel selesai agar saya bisa meninjau.
Rencana dulu, tunggu persetujuan.
```

**Hasil:** semua rute berjalan dengan data `staging`. **Verifikasi:** bandingkan beranda dan artikel dengan wireframe A10 pada 360 dan 1280 px; coba artikel dengan gambar, tabel, dan YouTube; matikan Sanity (token salah) dan pastikan halaman statis tetap tersaji dari cache.

### Tahap 5: SEO teknis dan revalidasi (FR-401 sampai FR-404)

**Tujuan.** Semua tag SEO, sitemap, data terstruktur, dan pembaruan konten otomatis.

**Prompt**

```text
Baca docs/PRD.md bagian A8 dan FR-401 sampai FR-404. Tugas:
1. metadataBase dari NEXT_PUBLIC_SITE_URL; generateMetadata di setiap rute: judul bertemplat,
   deskripsi (seo.description atau excerpt), canonical absolut, Open Graph (article:published_time,
   penulis, tag), Twitter summary_large_image; gambar OG dengan next/og bila seo.ogImage kosong.
2. app/sitemap.ts dari GROQ (artikel, halaman, kategori, tag, penulis, kegiatan) dengan lastmod
   dari _updatedAt; app/robots.ts (blokir /api dan jalur pratinjau, cantumkan sitemap).
3. Komponen JsonLd: Article/NewsArticle, BreadcrumbList, Organization dan WebSite di beranda.
4. noindex untuk /cari dan tag dengan kurang dari 3 artikel; <html lang='id'>.
5. Route Handler /api/revalidate: verifikasi tanda tangan webhook Sanity (SANITY_REVALIDATE_SECRET),
   panggil revalidateTag sesuai _type dan slug.
6. Tulis tes unit untuk pembuat metadata dan JSON-LD.
Setelah selesai, beri daftar perintah untuk memvalidasi hasil.
```

**Hasil:** sitemap, robots, JSON-LD, dan webhook bekerja. **Verifikasi:** buka `/sitemap.xml` dan `/robots.txt`; uji 3 artikel di Rich Results Test; buat webhook di Sanity ke URL preview dan pastikan artikel yang diubah tayang kurang dari 60 detik.

## B6. Tahap 6 dan 7

### Tahap 6: AdSense (FR-501 sampai FR-504)

**Tujuan.** Iklan terkendali dari Sanity, `ads.txt` benar, dan tidak ada pergeseran tata letak.

**Siapkan dulu:** ID penayang AdSense (`pub-...`) dari dasbor Anda. ID ini publik di kode halaman sehingga aman diisi di Sanity.

**Prompt**

```text
Baca docs/PRD.md bagian A9 dan FR-501 sampai FR-504. Tugas:
1. Pastikan siteSettings.adsense di skema Sanity memuat enabled, publisherId, autoAds, ID slot per posisi
   (inArticle, belowArticle, sidebar, inFeed), injectAfterParagraph; post.adsEnabled default true.
2. components/ads/AdsenseScript.tsx: next/script (afterInteractive, async, crossOrigin anonymous),
   hanya dirender bila NODE_ENV production, adsense.enabled benar, dan halaman bukan noindex/404/pencarian.
   Tambahkan meta google-adsense-account lewat metadata.other.
3. components/ads/AdSlot.tsx (client): satu kali adsbygoogle.push dengan penjaga useRef,
   data-ad-format auto, data-full-width-responsive true, min-height tetap per posisi, label 'Iklan'.
   Di dev dan preview tampilkan kotak penanda abu-abu.
4. Di renderer Portable Text: sisipkan AdSlot setelah paragraf ke-N (injectAfterParagraph) dan
   render blok adSlot manual; lewati semua bila post.adsEnabled salah.
5. Letakkan AdSlot bawah artikel dan bilah samping (hanya di breakpoint 1024 px ke atas).
6. public/ads.txt dengan baris: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   (ganti dengan ID penayang; tulis TODO jelas di berkas bila belum diketahui).
Tulis tes untuk logika kapan skrip dan slot boleh dirender. Rencana dulu, tunggu persetujuan.
```

**Hasil:** skrip dan slot hanya muncul pada kondisi yang benar. **Verifikasi:** di preview Vercel tidak ada skrip AdSense; di produksi `/ads.txt` terbuka dan berisi ID yang benar; ukur CLS pada artikel dengan slot (target di bawah 0,1); pastikan artikel dengan `adsEnabled` mati tanpa slot.

### Tahap 7: Formulir dan data pengunjung (FR-601 sampai FR-603)

**Tujuan.** Buletin, kontak, dan (P1) pendaftaran kegiatan tersimpan aman di Supabase.

**Prompt**

```text
Baca docs/PRD.md FR-601 sampai FR-603, A6, dan NFR-03/04. Tugas:
1. Route Handler POST /api/newsletter, /api/contact (P0) dan /api/events/register (P1), semuanya
   memvalidasi dengan skema Zod dari lib/validation.ts dan menulis lewat client server Supabase.
2. Buletin: double opt-in. Simpan status pending, kirim email konfirmasi berisi tautan
   /api/newsletter/confirm?token=... yang mengubah status ke confirmed; sediakan tautan berhenti berlangganan.
   Gunakan penyedia email yang saya pilih: [ISI NAMA PENYEDIA].
3. Penangkal spam: honeypot dan pembatasan laju per IP (misalnya 5 permintaan per menit).
4. Komponen form dengan label di atas, galat inline, kotak persetujuan privasi wajib berisi tautan
   ke Kebijakan Privasi, status kirim dan toast.
5. Respons tidak membocorkan apakah sebuah email sudah terdaftar.
6. Tes: validasi gagal, spam honeypot ditolak, laju terlampaui ditolak, duplikat pendaftaran kegiatan ditolak.
```

**Hasil:** formulir berfungsi end-to-end di `staging`. **Verifikasi:** kirim formulir dan periksa baris di Supabase; coba kirim tanpa persetujuan dan dengan email salah; pastikan akses anonim langsung ke tabel tetap ditolak.

## B7. Tahap 8 dan 9

### Tahap 8: Migrasi Blogger (FR-301)

**Tujuan.** Seluruh artikel, halaman, label, dan gambar masuk ke Sanity `staging`, bisa diulang tanpa duplikat.

**Siapkan dulu:** letakkan berkas XML ekspor Blogger di `scripts/migrate/input/` (folder ini masuk `.gitignore`) dan simpan token Sanity dengan hak tulis di `.env.local` khusus skrip. Token tulis tidak dipakai situs.

**Prompt (tiga langkah terpisah; tunggu persetujuan di antaranya)**

```text
Langkah A (inspeksi, JANGAN menulis kode migrasi dulu):
Baca docs/PRD.md bagian A7. Buka scripts/migrate/input/*.xml dan laporkan struktur nyata: jenis entri
(POST, PAGE, COMMENT), status (LIVE, DRAFT), lokasi jalur permalink, format label, tanggal, penulis,
jumlah tiap jenis, 5 pola HTML yang paling sering (pembungkus gambar, iframe, tabel, dll.), dan
daftar domain gambar. Beri ringkasan dan usulan aturan pembersihan.

Langkah B (parser dan transformasi, tanpa menulis ke Sanity):
Buat scripts/migrate dengan fast-xml-parser, jsdom, dan @portabletext/block-tools (htmlToBlocks).
Keluaran: file JSON per artikel di scripts/migrate/out/. Aturan: _id post.blogger-<postId>, slug dari
jalur lama, tanggal asli, label ke tag, penulis lewat author-map.json, gambar ditandai untuk diunggah,
HTML dibersihkan sesuai usulan Langkah A. Tulis tes unit untuk 10 pola HTML contoh dan jalankan
hanya pada 10 artikel pertama; tampilkan hasilnya untuk saya periksa.

Langkah C (unggah dan impor ke staging):
Tambahkan pengunggahan gambar (ukuran asli, client.assets.upload, cache URL ke assetId agar tidak
diunggah dua kali, alt dari atribut gambar, tandai yang tanpa alt) dan impor dengan createOrReplace
per 50 dokumen. Wajib dry-run dulu dan hanya dataset staging; tolak dataset production kecuali
dengan flag eksplisit --confirm-production. Hasilkan laporan: jumlah diimpor, dilewati, gagal, dan
gambar tanpa alt.
```

**Hasil:** semua konten Blogger ada di `staging` dengan laporan impor. **Verifikasi:** jalankan impor dua kali dan pastikan jumlah dokumen tidak bertambah; periksa 30 artikel contoh di situs (gambar, tabel, YouTube, tautan); pastikan tidak ada URL `googleusercontent.com` atau `bp.blogspot.com` tersisa di `body`.

### Tahap 9: Redirect dan QA (FR-302)

**Tujuan.** Semua URL lama berujung ke halaman yang benar dalam satu lompatan, dibuktikan oleh uji otomatis.

**Prompt**

```text
Baca docs/PRD.md bagian A7 (Redirect) dan FR-302. Tugas:
1. Dari impor, hasilkan peta URL lama ke baru dan masukkan ke tabel redirect_map di Supabase.
2. Di next.config.ts: redirect permanen untuk pola /:year(\d{4})/:month(\d{2})/:slug.html ke /berita/:slug,
   /feeds/posts/default ke /rss.xml, /search ke /cari, serta pemetaan halaman dan label;
   hapus parameter ?m=1 dan ?m=0. Jika jumlah pengecualian melebihi 900, pindahkan ke Middleware
   dengan Edge Config dan jelaskan alasannya.
3. Skrip scripts/qa/check-redirects.ts: baca daftar URL sitemap Blogger lama (berkas teks), ikuti
   redirect, dan laporkan URL yang tidak berujung 200 dalam SATU lompatan atau mengarah ke halaman salah.
4. Skrip scripts/qa/check-links.ts: periksa tautan internal dan URL gambar semua artikel (status 200).
5. Jalankan keduanya sebagai langkah opsional di CI terhadap preview.
Pola regex harus diuji pada contoh nyata sebelum dipakai. Laporkan temuan, jangan menyembunyikan kegagalan.
```

**Hasil:** laporan nol URL gagal. **Verifikasi:** jalankan skrip terhadap preview; periksa manual 20 URL teratas dari Search Console; pastikan pola yang tidak cocok (misalnya slug berubah) tertangani lewat `redirect_map`.

## B8. Tahap 10 dan 11

### Tahap 10: Kesiapan produksi dan cutover

**Tujuan.** Situs lolos semua gerbang kualitas, lalu domain dialihkan dari Blogger ke Vercel dengan rencana pemulihan.

**Prompt (bagian kode)**

```text
Baca docs/PRD.md bagian A4 dan A11. Tugas:
1. Header keamanan di next.config.ts: HSTS, X-Content-Type-Options, Referrer-Policy, dan Content
   Security Policy dalam mode report-only (AdSense memuat banyak domain; catat pelanggaran yang muncul).
2. Lighthouse CI pada preview dengan ambang kinerja, SEO, dan aksesibilitas masing-masing 90.
3. Vercel Speed Insights, GA4 (dimuat setelah interaksi), dan pengecekan variabel lingkungan wajib saat build.
4. Skrip scripts/backup/export-sanity.sh (sanity dataset export) dan dokumentasi cara memulihkannya.
5. Daftar kebutuhan NFR dan FR P0 yang belum terpenuhi beserta buktinya; jangan mencentang tanpa bukti.
```

**Gerbang sebelum DNS dialihkan.** Semua centang berikut harus terpenuhi:

- [ ] Impor penuh ke `production` selesai dan QA tahap 8 dan 9 lulus.
- [ ] `/ads.txt` terbuka di domain Vercel dan berisi ID penayang yang benar.
- [ ] Preview dan staging `noindex`; produksi `index, follow`.
- [ ] Core Web Vitals seluler lulus pada Lighthouse CI; JSON-LD lolos pada 5 artikel.
- [ ] Formulir menulis ke Supabase dan akses anonim ke tabel ditolak.
- [ ] Webhook Sanity memicu revalidasi dalam kurang dari 60 detik.
- [ ] Kebijakan Privasi, Tentang, Kontak, Redaksi terbit.

**Cutover (langkah manual Anda)**

1. Dua minggu sebelumnya: turunkan TTL DNS menjadi 300 detik dan catat semua rekaman DNS saat ini.
2. H-1: bekukan penerbitan di Blogger, jalankan impor delta, pastikan `ads.txt`, `robots.txt`, dan sitemap benar.
3. Hari H: tambahkan domain di Vercel, ganti rekaman DNS yang mengarah ke Blogger sesuai instruksi Vercel, tunggu HTTPS aktif.
4. Uji 20 URL teratas, semua aturan redirect, `/ads.txt`, `/rss.xml`, `/sitemap.xml`.
5. Kirim sitemap di Search Console dan minta pemeriksaan URL untuk 10 halaman teratas.
6. Atur blog Blogger menjadi pribadi agar alamat blogspot tidak menjadi duplikat.

**Pemulihan:** bila terjadi kegagalan besar dalam 48 jam pertama, kembalikan rekaman DNS ke nilai yang dicatat pada langkah 1.

### Tahap 11: Pasca-peluncuran dan rilis 2 (P1)

**Pemantauan mingguan selama 8 minggu:** laporan Pengindeksan Halaman, Statistik Perayapan, dan Core Web Vitals di Search Console; klik dan posisi halaman teratas dibanding baseline; RPM halaman dan status `ads.txt` di AdSense; daftar 404 dari log Vercel; uji redirect bulanan. Penempatan iklan tidak diubah selama dua minggu pertama.

**Prompt rilis 2 (kerjakan satu per satu)**

```text
Baca docs/PRD.md FR-204, FR-205, FR-503, FR-701 sampai FR-703, dan FR-801. Kerjakan SATU item per sesi,
urut prioritas yang saya sebut: (1) halaman kegiatan dan pendaftaran online beserta halaman admin
pendaftar dengan ekspor CSV, hanya untuk Administrator; (2) halaman publikasi dengan unduhan PDF;
(3) pratinjau draf lewat Presentation tool dan Draft Mode (noindex, tanpa iklan); (4) unit iklan manual
berdasarkan data RPM; (5) penyempurnaan mode gelap. Untuk setiap item: rencana dulu, tes, dan
pembaruan docs/PROGRESS.md.
```

## B9. Pola prompt perbaikan dan pemecahan masalah

**Kerangka prompt yang konsisten**

```text
Konteks: [tahap dan ID kebutuhan, misalnya Tahap 4, FR-102]
Tugas: [satu hasil yang jelas]
Batasan: [yang tidak boleh diubah, dependensi yang tidak boleh ditambah]
Selesai bila: [kriteria yang bisa diperiksa, misalnya tes lulus dan tampil benar di 360 px]
Berhenti dan tanya bila ada keputusan yang tidak ada di PRD.
```

**Masalah umum dan prompt perbaikannya**

| Masalah | Prompt perbaikan |
| --- | --- |
| AI mengubah terlalu banyak berkas | "Batalkan perubahan di luar \[berkas\]. Ulangi hanya untuk \[tugas\] dan tampilkan daftar berkas yang akan diubah sebelum menulis." |
| Hasil menyimpang dari PRD | "Periksa hasil terhadap FR-xxx dan NFR-xx di docs/PRD.md. Buat tabel: kebutuhan, terpenuhi atau tidak, bukti. Perbaiki yang tidak terpenuhi." |
| Mengklaim selesai tanpa bukti | "Jalankan pnpm lint, typecheck, test, build dan tempelkan keluaran apa adanya. Jangan merangkum." |
| Tampilan rusak di ponsel | "Periksa halaman \[rute\] pada 360 px. Temukan elemen yang menyebabkan gulir horizontal atau teks terpotong dan perbaiki dengan mobile-first, tanpa media query desktop-first." |
| Galat hidrasi atau pergeseran tata letak | "Cari penyebab galat hidrasi di \[komponen\]. Jelaskan penyebabnya dulu, lalu perbaiki. Pastikan wadah iklan dan gambar punya dimensi tetap." |
| Kunci rahasia terlanjur tertulis | "Hapus kunci dari kode dan riwayat commit, pindahkan ke env var. Saya akan memutar (rotate) kuncinya. Tambahkan pemeriksaan di CI." |
| Query Sanity lambat atau salah | "Tampilkan query GROQ untuk \[halaman\] dan hasil mentahnya. Optimalkan dengan proyeksi hanya field yang dipakai dan pastikan tipe TypeGen ter-update." |
| Impor menghasilkan duplikat | "Periksa penggunaan \_id deterministik dan createOrReplace. Tulis tes yang mengimpor dua kali dan memastikan jumlah dokumen sama." |
| Konteks sesi sudah terlalu panjang dan AI mulai lupa aturan | "Ringkas keadaan saat ini ke docs/PROGRESS.md (selesai, sedang dikerjakan, keputusan, langkah berikut), lalu saya mulai sesi baru." |
| Ragu pada saran AI soal paket layanan atau kebijakan | "Sebutkan sumber resmi untuk klaim itu dan tandai bagian yang belum diverifikasi. Jangan menebak batas atau harga." |

**Tanda untuk berhenti dan menimbang ulang:** tes terus gagal setelah tiga kali perbaikan pada hal yang sama, AI menambah dependensi besar tanpa diminta, atau solusinya menyimpang dari arsitektur A5. Pada titik itu, kembali ke rencana, perkecil tugas, atau catat keputusan di `docs/DECISIONS.md` sebelum melanjutkan.
