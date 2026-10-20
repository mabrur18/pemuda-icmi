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
