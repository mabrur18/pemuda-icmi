# Panduan Pencadangan dan Pemulihan Bencana (Backup & Disaster Recovery Playbook)

Proyek: **CMS & Portal Web Pemuda ICMI Kota Bekasi**  
Domain: `pemudaicmi-kotabekasi.org`  
Referensi PRD: **NFR-09, A4, A11, Tahap 10**

---

## 1. Strategi Pencadangan (Backup Strategy)

| Lapisan Sistem | Frekuensi | Mekanisme | Lokasi Arsip |
| :--- | :--- | :--- | :--- |
| **Sanity Content Lake** | Mingguan (otomatis) / Pra-deploy | `scripts/backup/export-sanity.ts` (Sanity Dataset Export) | `backups/sanity-*.tar.gz` & Object Storage aman |
| **Supabase Postgres** | Harian (otomatis) | Manajemen cadangan bawaan Supabase PITR (Point-in-Time Recovery) | Dasbor Supabase & berkas SQL migration/seed |
| **Konten Lama Blogger** | Permanen (One-time) | Berkas XML ekspor `feed.atom` & Album foto asli (109 berkas) | Folder `blog/` tersimpan permanen di penyimpanan dingin |
| **Repositori Kode** | Tiap Commit & Tag | Git version control | GitHub Remote Repository (branch `master`) |

---

## 2. Prosedur Ekspor Sanity Dataset (Pencadangan)

Untuk mengekspor dataset Sanity, jalankan skrip cadangan:

### Menggunakan TypeScript (Cross-Platform)
```bash
# Cadangkan dataset staging
pnpm tsx scripts/backup/export-sanity.ts --dataset=staging

# Cadangkan dataset production (saat sudah live)
pnpm tsx scripts/backup/export-sanity.ts --dataset=production
```

### Menggunakan Bash (Linux / macOS / CI)
```bash
chmod +x scripts/backup/export-sanity.sh
./scripts/backup/export-sanity.sh staging
```

### Menggunakan PowerShell (Windows)
```powershell
.\scripts\backup\export-sanity.ps1 -Dataset staging
```

Hasil ekspor akan tersimpan di direktori `backups/` dalam format arsip terkompresi `sanity-<projectId>-<dataset>-<timestamp>.tar.gz`.

---

## 3. Prosedur Pemulihan Sanity (Disaster Recovery)

Jika terjadi kerusakan data atau kebutuhan pemulihan titik waktu (rollback):

### Langkah 1: Siapkan Dataset Target
Direkomendasikan memulihkan data ke dataset baru atau dataset staging terlebih dahulu sebelum menimpa produksi.
```bash
# Buat dataset baru untuk pemulihan jika diperlukan
npx sanity dataset create recovery-test
```

### Langkah 2: Impor Arsip Cadangan
Gunakan Sanity CLI untuk memulihkan berkas `.tar.gz`:
```bash
npx sanity dataset import ./backups/sanity-glupcaxn-staging-<timestamp>.tar.gz staging --replace
```
> **Catatan:** Flag `--replace` akan menimpa dokumen yang memiliki ID sama dengan versi dari berkas cadangan.

### Langkah 3: Verifikasi Integritas Data
Jalankan skrip pemeriksaan integritas tautan dan gambar:
```bash
pnpm tsx scripts/qa/check-links.ts --base-url=http://localhost:3000
```

---

## 4. Prosedur Pemulihan Supabase (Data Transaksional)

Tabel Supabase mencakup data pengunjung: `subscribers`, `contact_messages`, `event_registrations`, dan `redirect_map`.

### Pemulihan Skema
Bila basis data baru diinisialisasi:
1. Eksekusi skrip migrasi struktur:
   ```bash
   # Jalankan isi berkas migrasi di SQL Editor Supabase
   supabase/migrations/20261020000000_create_core_tables.sql
   ```
2. Injeksi ulang peta redirect URL Blogger:
   ```bash
   # Jalankan di SQL Editor Supabase
   supabase/seed_redirect_map.sql
   ```

---

## 5. Rencana Pemulihan & Rollback DNS Cutover (48 Jam Pertama)

Jika terjadi kegagalan katastropik saat DNS dialihkan dari Blogger ke Vercel pada Hari H:

1. **Catatan DNS Sebelum Cutover**:
   - Catat seluruh IP A Record dan CNAME Blogger (`ghs.googlehosted.com`, token verifikasi Google) sebelum diubah.
2. **Kondisi Memicu Rollback**:
   - Vercel down terus-menerus > 2 jam tanpa mitigasi.
   - SSL certificate gagal diterbitkan > 4 jam setelah propagasi DNS.
   - Galat 500 menyeluruh pada halaman utama.
3. **Langkah Rollback Cepat**:
   - Masuk ke dasbor registrar DNS (Cloudflare / Namecheap / Niagahoster / DNS hosting domain).
   - Ubah kembali A Record `@` ke IP Google Blogger:
     - `216.239.32.21`
     - `216.239.34.21`
     - `216.239.36.21`
     - `216.239.38.21`
   - Kembalikan CNAME `www` ke `ghs.googlehosted.com`.
   - Karena TTL DNS telah diturunkan menjadi 300 detik pada H-14, trafik akan kembali ke Blogger dalam 5-10 menit.
