# Panduan Deployment Produksi: Vercel, Supabase, dan Domain DNS

Dokumen ini merupakan panduan langkah-demi-langkah resmi untuk merilis situs web **Pemuda ICMI Kota Bekasi** (`pemudaicmi-kotabekasi.org`) ke lingkungan produksi, mencakup konfigurasi database Supabase, konfigurasi CMS Sanity produksi, deployment Next.js di Vercel, serta pengalihan domain (DNS cutover) dari Blogger ke Vercel.

---

## Daftar Isi
1. [Prasyarat & Persiapan Awal](#1-prasyarat--persiapan-awal)
2. [Langkah 1: Pengaturan Database Supabase (Produksi)](#2-langkah-1-pengaturan-database-supabase-produksi)
3. [Langkah 2: Pengaturan Dataset & Akses Sanity (Produksi)](#3-langkah-2-pengaturan-dataset--akses-sanity-produksi)
4. [Langkah 3: Deployment Aplikasi Frontend ke Vercel](#4-langkah-3-deployment-aplikasi-frontend-ke-vercel)
5. [Langkah 4: Konfigurasi Domain Kustom & DNS Cutover](#5-langkah-4-konfigurasi-domain-kustom--dns-cutover)
6. [Langkah 5: Verifikasi Pasca-Cutover & Pemeriksaan Mutu](#6-langkah-5-verifikasi-pasca-cutover--pemeriksaan-mutu)
7. [Langkah 6: Prosedur Rollback Darurat](#7-langkah-6-prosedur-rollback-darurat)

---

## 1. Prasyarat & Persiapan Awal

Sebelum memulai, pastikan Anda memiliki akses administratif ke:
- [x] Repositori Git (GitHub/GitLab) proyek `pemuda-icmi`.
- [x] Akun **Supabase** (pembuatan project database baru).
- [x] Akun **Sanity.io** (Project ID: `glupcaxn`).
- [x] Akun **Vercel** (deployment platform).
- [x] Dasbor pengelola DNS domain `pemudaicmi-kotabekasi.org` (Registrar atau Cloudflare).
- [x] Dasbor Google Search Console & Google AdSense.

---

## 2. Langkah 1: Pengaturan Database Supabase (Produksi)

Database Supabase digunakan untuk menyimpan data transaksional: pendaftar buletin, pesan kontak, pendaftaran kegiatan, dan peta redirect URL warisan Blogger.

### 1.1 Buat Project Baru di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Klik **New Project**.
3. Isi informasi project:
   - **Name**: `pemuda-icmi-production`
   - **Database Password**: *Buat password yang kuat dan simpan di pengelola sandi (password manager)*.
   - **Region**: Pilih **Singapore (`ap-southeast-1`)** untuk mendapatkan latensi terendah bagi pengunjung Indonesia.
   - **Pricing Plan**: Free Tier atau Pro Tier.
4. Klik **Create new project** dan tunggu proses inisialisasi (~1-2 menit).

### 1.2 Eksekusi Skema Migrasi Database (DDL & RLS)
1. Buka menu **SQL Editor** pada navigasi kiri dasbor Supabase.
2. Salin isi berkas skema inti repositori:
   - Lokasi berkas: `supabase/migrations/20261020000000_create_core_tables.sql`
3. Tempelkan ke SQL Editor Supabase, lalu klik tombol **Run**.
4. Skrip ini akan membuat:
   - Tabel `subscribers` (beserta fungsi double opt-in & token).
   - Tabel `contact_messages` (beserta proteksi honeypot).
   - Tabel `event_registrations` (beserta batasan unik kegiatan + email).
   - Tabel `redirect_map` (peta redirect URL 308).
   - Mengaktifkan **Row Level Security (RLS)** pada seluruh tabel tanpa kebijakan akses publik (akses hanya diperbolehkan melalui server backend menggunakan `SERVICE_ROLE_KEY`).

### 1.3 Masukkan Data Awal Peta Redirect (Seed Redirects)
1. Tetap di menu **SQL Editor** Supabase.
2. Buka dan salin seluruh isi berkas:
   - Lokasi berkas: `supabase/seed_redirect_map.sql`
3. Tempelkan ke SQL Editor, lalu klik tombol **Run**.
4. Pastikan 53 baris pemetaan redirect URL berhasil masuk ke tabel `redirect_map`.

### 1.4 Catat Kunci Kredensial API Supabase
Buka menu **Project Settings** (ikon gerigi) $\rightarrow$ **API**:
1. **Project URL**: Simpan URL berformat `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   $\rightarrow$ Digunakan sebagai `NEXT_PUBLIC_SUPABASE_URL`.
2. **anon / public key**: Simpan token anonim.
   $\rightarrow$ Digunakan sebagai `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **service_role key**: Klik ikon mata untuk membuka rahasia server.
   $\rightarrow$ Digunakan sebagai `SUPABASE_SERVICE_ROLE_KEY`.  
   *(PENTING: Jangan pernah membagikan kunci ini ke publik atau menyisipkannya ke berkas client-side).*

---

## 3. Langkah 2: Pengaturan Dataset & Akses Sanity (Produksi)

### 3.1 Buat Dataset `production` di Sanity
Di komputer lokal Anda, buka terminal di folder proyek dan jalankan:
```bash
pnpm sanity dataset create production --visibility public
```
*(Atau buat langsung melalui https://manage.sanity.io pada project `glupcaxn` $\rightarrow$ Datasets).*

### 3.2 Migrasi Konten ke Dataset `production`
Lakukan impor seluruh konten Blogger (39 artikel, aset gambar, kategori, tag, dan penulis) ke dataset `production`:
```bash
pnpm tsx scripts/migrate/importer.ts --dataset=production --confirm-production
```
*Catatan: Skrip ini idempoten dan memvalidasi integritas seluruh aset gambar sebelum disimpan.*

### 3.3 Konfigurasi CORS Origins di Sanity
1. Masuk ke [Sanity Manage](https://manage.sanity.io) $\rightarrow$ pilih project `glupcaxn`.
2. Pilih tab **API** $\rightarrow$ **CORS Origins**.
3. Klik **Add CORS origin**:
   - Origin: `https://pemudaicmi-kotabekasi.org` (Centang: *Allow credentials*)
   - Origin: `https://www.pemudaicmi-kotabekasi.org` (Centang: *Allow credentials*)
   - Origin: `https://*.vercel.app` (Centang: *Allow credentials* — untuk preview deployments)
4. Klik **Save**.

### 3.4 Buat API Read Token & Revalidation Secret
1. Di tab **API** Sanity Manage $\rightarrow$ bagian **Tokens**:
   - Klik **Add API token**.
   - Nama: `Next.js Production Read Token`.
   - Permissions: **Viewer** (Read).
   - Salin token $\rightarrow$ Digunakan sebagai `SANITY_API_READ_TOKEN`.
2. Buat string acak yang aman untuk webhook revalidasi:
   - Misal: `icmi_rev_sec_89f72b901a8e41`
   - Simpan string ini $\rightarrow$ Digunakan sebagai `SANITY_REVALIDATE_SECRET`.

### 3.5 Konfigurasi On-Demand ISR Webhook di Sanity
1. Masuk ke tab **API** Sanity Manage $\rightarrow$ bagian **Webhooks**.
2. Klik **Create webhook**:
   - **Name**: `Next.js On-Demand Revalidate`
   - **URL**: `https://pemudaicmi-kotabekasi.org/api/revalidate`
   - **Dataset**: `production`
   - **Trigger on**: Create, Update, Delete
   - **Filter**: `_type in ["post", "page", "category", "tag", "author", "siteSettings"]`
   - **HTTP method**: `POST`
   - **Secret**: Masukkan nilai `SANITY_REVALIDATE_SECRET` yang telah dibuat.
3. Klik **Save**.

---

## 4. Langkah 3: Deployment Aplikasi Frontend ke Vercel

### 4.1 Hubungkan Repositori ke Vercel
1. Masuk ke [Dasbor Vercel](https://vercel.com/dashboard).
2. Klik **Add New...** $\rightarrow$ **Project**.
3. Hubungkan akun Git (GitHub/GitLab) dan pilih repositori `pemuda-icmi`.

### 4.2 Konfigurasi Proyek Vercel (Monorepo Settings)
Pada halaman konfigurasi proyek:
1. **Project Name**: `pemuda-icmi-web`
2. **Framework Preset**: Pilih **Next.js**.
3. **Root Directory**:
   - Klik **Edit** pada Root Directory.
   - Pilih folder: `apps/web`.
4. **Build & Development Settings**:
   - Vercel secara otomatis mendeteksi monorepo pnpm.
   - Build Command: `pnpm run build` (atau kosongkan untuk default Vercel).
   - Output Directory: `.next` (default).
   - Install Command: Biarkan default (`pnpm install`).

### 4.3 Masukkan Variabel Lingkungan (Environment Variables)
Buka bagian **Environment Variables** di Vercel dan masukkan variabel berikut:

| Key | Value (Produksi) | Target Environment |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `glupcaxn` | Production, Preview |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Production *(Gunakan `staging` untuk Preview jika diinginkan)* |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2024-01-01` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://pemudaicmi-kotabekasi.org` | Production |
| `SANITY_API_READ_TOKEN` | *(Token read Sanity dari Langkah 3.4)* | Production, Preview |
| `SANITY_REVALIDATE_SECRET` | *(Secret webhook dari Langkah 3.4)* | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxxxxxxxxxx.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Token anon Supabase dari Langkah 1.4)* | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Service role key dari Langkah 1.4)* | Production, Preview |
| `NEXT_PUBLIC_GA_ID` | *(Opsional: ID GA4, misal `G-XXXXXXXXXX`)* | Production |

### 4.4 Eksekusi Deploy Perdana
1. Klik tombol **Deploy**.
2. Pantau jalannya build log:
   - Validasi variabel lingkungan build-time (`lib/env.ts`) berjalan.
   - Static Site Generation (SSG) mengompilasi seluruh halaman statis, artikel berita, arsip kategori, dan sitemap.
   - Seluruh lint dan typecheck tervalidasi.
3. Setelah selesai, Vercel akan memberikan domain preview acak (misal: `pemuda-icmi-web-xxx.vercel.app`).
4. Buka URL preview tersebut dan pastikan:
   - Beranda memuat artikel dengan baik.
   - Halaman artikel `/berita/[slug]` tampil utuh dengan Portable Text.
   - Halaman `/kontak` dapat dibuka.

---

## 5. Langkah 4: Konfigurasi Domain Kustom & DNS Cutover

Tahap ini mengalihkan pengunjung dari Blogger lama ke website baru di Vercel.

### 5.1 Persiapan H-14 Sebelum Cutover
1. Buka dasbor pengelola DNS domain `pemudaicmi-kotabekasi.org` (di Registrar atau Cloudflare).
2. **Turunkan nilai TTL (Time to Live)** pada seluruh rekaman A dan CNAME saat ini menjadi **300 detik (5 menit)**.
3. **Catat rekaman DNS Blogger saat ini** untuk persiapan rollback darurat:
   - Catat 4 IP Google A-Record (`216.239.32.21`, `216.239.34.21`, `216.239.36.21`, `216.239.38.21`).
   - Catat CNAME `www` ke `ghs.google.com`.

### 5.2 Tambahkan Domain di Dasbor Vercel
1. Di dasbor Vercel proyek `pemuda-icmi-web`, buka **Settings** $\rightarrow$ **Domains**.
2. Masukkan domain utama: `pemudaicmi-kotabekasi.org`.
3. Vercel akan menyarankan penambahan domain `www.pemudaicmi-kotabekasi.org` dengan rekomendasi redirect otomatis:
   - Pilih: **Redirect `www.pemudaicmi-kotabekasi.org` to `pemudaicmi-kotabekasi.org`** (atau sebaliknya sesuai preferensi kanonikal).
4. Vercel akan menampilkan instruksi DNS yang dibutuhkan:
   - **Apex / Root Domain (`@`)**: `A Record` $\rightarrow$ `76.76.21.21`
   - **Subdomain (`www`)**: `CNAME Record` $\rightarrow$ `cname.vercel-dns.com`

### 5.3 Perbarui Rekaman DNS di Pengelola DNS
Buka pengelola DNS domain Anda dan ganti rekaman lama Blogger:

| Type | Name / Host | Target / Value | TTL | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` *(atau kosongkan)* | `76.76.21.21` | `300` detik | Mengarahkan apex domain ke Anycast Edge Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | `300` detik | Mengarahkan subdomain www ke Vercel |

> [!IMPORTANT]
> **Khusus Pengguna Cloudflare:**
> Pada saat awal cutover, pastikan status **Proxy Status** diatur ke **DNS Only (ikon awan abu-abu)** agar Vercel dapat memvalidasi domain dan menerbitkan sertifikat SSL Let's Encrypt secara otomatis tanpa benturan verifikasi ACME. Jika sertifikat SSL di Vercel sudah berstatus *Valid*, Proxy Cloudflare (awan oranye) dapat diaktifkan kembali dengan mode SSL/TLS diatur ke **Full (Strict)**.

### 5.4 Verifikasi Sertifikat SSL di Vercel
1. Kembali ke dasbor Vercel $\rightarrow$ **Settings** $\rightarrow$ **Domains**.
2. Klik tombol **Refresh** di samping domain.
3. Tunggu hingga tanda centang hijau muncul untuk status DNS dan status SSL Certificate (biasanya 2–10 menit).

---

## 6. Langkah 5: Verifikasi Pasca-Cutover & Pemeriksaan Mutu

Setelah domain aktif dan mengarah ke Vercel, jalankan serangkaian pengujian langsung (live verification):

### 6.1 Uji QA Redirect Otomatis
Jalankan skrip pengujian redirect terhadap domain langsung:
```bash
pnpm tsx scripts/qa/check-redirects.ts --base-url=https://pemudaicmi-kotabekasi.org
```
- **Kriteria Lolos**: 53 dari 53 URL lama Blogger harus berstatus **HTTP 200 OK dalam tepat 1 lompatan (single hop 308 $\rightarrow$ 200)**.

### 6.2 Uji Integritas Tautan & Gambar
Jalankan skrip pengujian tautan dan gambar:
```bash
pnpm tsx scripts/qa/check-links.ts --base-url=https://pemudaicmi-kotabekasi.org
```
- **Kriteria Lolos**: 100% tautan dan aset gambar mengembalikan **HTTP 200 OK** (0 broken images).

### 6.3 Verifikasi Berkas-Berkas Kritis
Buka di browser Anda:
1. `https://pemudaicmi-kotabekasi.org/ads.txt`: Pastikan merespons status 200 dengan format baris Google AdSense yang valid.
2. `https://pemudaicmi-kotabekasi.org/robots.txt`: Pastikan tidak ada aturan `Disallow: /` yang memblokir Googlebot di domain produksi.
3. `https://pemudaicmi-kotabekasi.org/sitemap.xml`: Pastikan sitemap XML memuat artikel, halaman statis, dan kategori.
4. `https://pemudaicmi-kotabekasi.org/rss.xml`: Pastikan feed RSS artikel valid.

### 6.4 Google Search Console
1. Buka [Google Search Console](https://search.google.com/search-console).
2. Daftarkan properti `https://pemudaicmi-kotabekasi.org`.
3. Buka menu **Sitemaps**, masukkan URL `sitemap.xml`, lalu klik **Submit**.
4. Lakukan **URL Inspection** untuk 5 URL artikel terpopuler untuk mempercepat pengindeksan ulang oleh Googlebot.

### 6.5 Lindungi Blog Blogger Lawas dari Konten Duplikat
1. Masuk ke dasbor Google Blogger $\rightarrow$ **Settings**.
2. Pada bagian **Privacy** $\rightarrow$ **Visible to search engines**: matikan opsi ini.
3. Pada bagian **Permissions** $\rightarrow$ **Blog access**: ubah menjadi **Private - Authors only**.
4. Langkah ini memastikan Google tidak mengindeks domain lama `*.blogspot.com` sebagai konten duplikat.

---

## 7. Langkah 6: Prosedur Rollback Darurat

Bila ditemukan kegagalan kritis yang tidak dapat diatasi dalam waktu singkat pada 48 jam pertama pasca-cutover:

1. **Kembalikan DNS ke Blogger**:
   - Buka pengelola DNS domain.
   - Hapus A-Record `76.76.21.21`.
   - Masukkan kembali 4 IP Google A-Record yang telah dicatat:
     - `216.239.32.21`
     - `216.239.34.21`
     - `216.239.36.21`
     - `216.239.38.21`
   - Kembalikan CNAME `www` ke `ghs.google.com`.
2. **Kembalikan Akses Blogger**:
   - Buka dasbor Blogger $\rightarrow$ Settings $\rightarrow$ ubah Blog access kembali ke **Public**.
3. Karena TTL telah diatur ke 300 detik pada tahap H-14, lalu lintas pengunjung akan kembali normal ke Blogger dalam waktu **kurang dari 5 menit**.
