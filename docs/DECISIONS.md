# Log Keputusan Arsitektur & Desain (DECISIONS.md)

Proyek: **CMS & Portal Web Pemuda ICMI Kota Bekasi**  
Domain: `pemudaicmi-kotabekasi.org`

Dokumen ini mencatat keputusan-keputusan arsitektur penting, rasionalisasi teknis, dan resolusi atas keputusan terbuka yang teridentifikasi di PRD bagian A12.

---

## 1. Arsitektur Inti (Berdasarkan Bagian A5)

| Keputusan | Pilihan | Rasionalisasi |
| :--- | :--- | :--- |
| **Monorepo Tooling** | pnpm workspace (`apps/web`, `apps/studio`, `scripts/migrate`) | Cepat, hemat disk space, isolasi dependensi yang ketat antar web dan CMS studio. |
| **Frontend Framework** | Next.js (App Router, TypeScript strict, Tailwind CSS) | Mendukung Server Components, ISR (Incremental Static Regeneration), streaming, dan SEO native via `generateMetadata`. |
| **Content Management System** | Sanity Studio v3 (`next-sanity`, GROQ, Sanity TypeGen) | Memberikan alur editorial yang kuat, schema berbasis kode, Portable Text yang terstruktur, dan kemudahan migrasi. |
| **Database Transaksional** | Supabase Postgres | Digunakan khusus data formulir pengunjung (subscribers, contact_messages, event_registrations) dengan RLS aktif dan hanya diakses dari server. |
| **Hosting & Deployment** | Vercel (Web), Sanity Cloud (Studio) | Integrasi preview instan, CDN global untuk cache ISR, dan kemudahan manajemen domain. |

---

## 2. Resolusi Keputusan Terbuka (A12)

| Topik | Status | Rekomendasi PRD / Keputusan | Catatan |
| :--- | :--- | :--- | :--- |
| **Pola URL Baru** | Terpilih | `/berita/[slug]` dengan redirect permanen 308 dari `/YYYY/MM/slug.html` | Struktur URL lebih bersih, modern, dan ramah SEO, dengan backward compatibility 100%. |
| **Komentar Blogger Lama** | Terpilih | Tidak dimigrasikan pada rilis P0 (fokus kualitas artikel dan performa); arsip jika diperlukan pada P2 | Komentar lama Blogger seringkali memuat spam dan format yang sulit distandarisasi tanpa nilai SEO yang signifikan. |
| **Palette Warna Brand** | Terpilih | Emerald Green (`#0F6B4F`), Warm Gold (`#E0A526`), Neutral Dark (`#14201B`), Off-White (`#F7F8F5`) | Sesuai token di A10, melambangkan karakter intelektual muslim dan kepemudaan yang segar namun berwibawa. |
| **Mode Gelap** | Terpilih | Disediakan fondasi token CSS pada P0; penyempurnaan UI toggle di P1 | Menghindari kompleksitas visual berlebih sebelum tata letak utama stabil. |
| **Tombol CTA Header** | Terpilih | "Daftar Kegiatan" (Aksen Emas) | Mendorong konversi partisipasi kegiatan pemuda sebagai objektif organisasi utama. |
| **Paket Layanan** | Divalidasi | Vercel Hobby/Pro, Sanity Free Tier (2 dataset), Supabase Free Tier | Memadai untuk fase peluncuran awal dan staging sebelum skala bertambah. |
