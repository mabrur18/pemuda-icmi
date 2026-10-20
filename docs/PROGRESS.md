# Lembar Pemantauan Perkembangan Proyek (PROGRESS.md)

Proyek: **CMS & Portal Web Pemuda ICMI Kota Bekasi**  
Domain: `pemudaicmi-kotabekasi.org`

---

## Status Tahapan

| Tahap | Nama Tahap | Prioritas / ID Terkait | Status | Catatan / Tanggal Selesai |
| :--- | :--- | :--- | :--- | :--- |
| **Tahap 0** | Fondasi repositori & Monorepo pnpm | Fondasi (A5) | **Selesai** | Monorepo pnpm, Next.js, Sanity Studio v3, CI workflow, Prettier, Vitest, lint/typecheck/build/test lulus 100% (2026-10-20) |
| **Tahap 1** | Skema Sanity dan Studio | FR-201, FR-202, FR-203 | **Siap Dikerjakan** | Dokumen, validasi, singleton, preview list |
| **Tahap 2** | Database Supabase & Server Client | NFR-03, FR-601 - FR-603 | Belum Mulai | SQL Migrations, RLS, server client, Zod schema |
| **Tahap 3** | Design System & Komponen UI | A10, NFR-05, NFR-07 | Belum Mulai | Token warna/tipografi, Tailwind, shadcn/ui, Storybook |
| **Tahap 4** | Halaman Publik Utama | FR-101 - FR-107 | Belum Mulai | Beranda, Berita, Kategori, Tag, Penulis, Halaman Statis, RSS, Cari |
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
