# Lembar Pemantauan Perkembangan Proyek (PROGRESS.md)

Proyek: **CMS & Portal Web Pemuda ICMI Kota Bekasi**  
Domain: `pemudaicmi-kotabekasi.org`

---

## Status Tahapan

| Tahap | Nama Tahap | Prioritas / ID Terkait | Status | Catatan / Tanggal Selesai |
| :--- | :--- | :--- | :--- | :--- |
| **Tahap 0** | Fondasi repositori & Monorepo pnpm | Fondasi (A5) | **Selesai** | Monorepo pnpm, Next.js, Sanity Studio v3, CI workflow, Prettier, Vitest, lint/typecheck/build/test lulus 100% (2026-10-20) |
| **Tahap 1** | Skema Sanity dan Studio | FR-201, FR-202, FR-203 | **Selesai** | Seluruh skema (9 dokumen, 6 objek), validasi ketat, desk structure, TypeGen TypeScript, seed 3 author, 5 category, 5 post, 1 siteSettings di staging (2026-10-20) |
| **Tahap 2** | Database Supabase & Server Client | NFR-03, FR-601 - FR-603 | **Selesai** | SQL migration (4 tabel + RLS aktif tanpa kebijakan publik), server-only client Supabase dengan SUPABASE_SERVICE_ROLE_KEY, skema Zod (buletin, kontak, pendaftaran kegiatan), 14 unit test lulus (2026-10-20) |
| **Tahap 3** | Design System & Komponen UI | A10, NFR-05, NFR-07 | **Selesai** | Token warna/tipografi, dark mode anti-flash, Header sticky responsif, Footer 4-kolom, ArticleCard (4 varian), EventCard, PublicationCard, AuthorCard, Button 44px, Chip, halaman showcase /design-system (2026-10-20) |
| **Tahap 4** | Halaman Publik Utama | FR-101 - FR-107 | **Siap Dikerjakan** | Beranda, Berita, Kategori, Tag, Penulis, Halaman Statis, RSS, Cari |
| **Tahap 5** | SEO Teknis & Webhook Revalidasi | FR-401 - FR-404 | Belum Mulai | MetadataBase, dynamic sitemap, robots, JSON-LD, on-demand ISR |
| **Tahap 6** | Integrasi AdSense & ads.txt | FR-501 - FR-504 | Belum Mulai | AdsenseScript, AdSlot, penjaga CLS, kontrol per artikel |
| **Tahap 7** | Formulir & Data Pengunjung | FR-601 - FR-603 | Belum Mulai | Newsletter (double opt-in), Kontak, proteksi spam & rate-limit |
| **Tahap 8** | Skrip Migrasi Blogger Idempoten | FR-301 | Belum Mulai | XML parse, transformasi Portable Text, upload asset, idempotency |
| **Tahap 9** | Pemetaan Redirect & QA URL | FR-302 | Belum Mulai | next.config redirects, redirect_map, skrip verifikasi 200 |
| **Tahap 10** | Kesiapan Produksi & Cutover | A4, A11, NFR-01 - NFR-11 | Belum Mulai | Security headers, audit Lighthouse CI, backup Sanity, DNS cutover |
| **Tahap 11** | Pasca-peluncuran & Fitur Rilis 2 (P1) | FR-204, FR-205, FR-503, FR-701-703, FR-801 | Belum Mulai | Kegiatan & registrasi online, publikasi PDF, visual preview, dark mode |

---

## Log Riwayat Singkat
- **2026-10-20**: Repositori diinisialisasi. Berkas `CLAUDE.md`, `docs/PRD.md`, `docs/PROGRESS.md`, dan `docs/DECISIONS.md` dibuat. Tahap 0 (Fondasi repositori monorepo pnpm) diselesaikan dengan verifikasi lint, typecheck, unit test, dan build sukses pada kedua aplikasi `apps/web` dan `apps/studio`.
- **2026-10-20**: Tahap 1 (Skema Sanity dan Studio) selesai: 9 tipe dokumen (`post`, `page`, `author`, `category`, `tag`, `event`, `publication`, `redirect`, `siteSettings`), 6 tipe objek (`seo`, `legacy`, `blockContent`, `youtube`, `callout`, `adSlot`), desk structure singleton & post ordering, Sanity TypeGen terintegrasi ke `apps/web/types/sanity.types.ts`, serta seed 14 dokumen (3 author, 5 kategori, 5 post artikel, 1 siteSettings) sukses diterbitkan di dataset `staging`.
- **2026-10-20**: Tahap 2 (Database Supabase & Server Client) selesai: SQL migrations (`subscribers`, `contact_messages`, `event_registrations`, `redirect_map`) dengan RLS aktif tanpa kebijakan publik, modul server-only Supabase client (`apps/web/lib/supabase/server.ts`), validasi Zod formulir & proteksi spam honeypot (`apps/web/lib/validation.ts`), dan pengujian otomatis (14 tests passed).
- **2026-10-20**: Tahap 3 (Design System & Komponen UI) selesai: Token CSS warna emerald/gold/dark mode, tipografi Next/font (Plus Jakarta Sans & Source Serif 4), komponen Button (min. 44px touch target), Chip, Container, Header sticky dengan drawer mobile, Footer 4-kolom, ThemeToggle (anti-flash script), ArticleCard (4 varian: large, standard, horizontal, compact), EventCard, PublicationCard, AuthorCard, dan halaman interaktif showcase `/design-system`. Build Next.js sukses 100%.
