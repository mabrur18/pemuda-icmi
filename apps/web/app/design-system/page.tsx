import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { EventCard } from "@/components/cards/EventCard";
import { PublicationCard } from "@/components/cards/PublicationCard";
import { AuthorCard } from "@/components/cards/AuthorCard";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1 py-10">
        <Container className="space-y-16">
          {/* Header Showcase */}
          <div className="border-b border-border pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider bg-brand-soft px-3 py-1 rounded-full">
                  Design System Showcase (PRD A10)
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mt-3">
                  Komponen & Desain Editorial
                </h1>
                <p className="text-muted mt-2 max-w-2xl text-sm sm:text-base">
                  Katalog token visual, huruf, tombol, dan kartu editorial modern untuk Portal Pemuda ICMI Kota Bekasi.
                </p>
              </div>
              <div>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Section 1: Palette Token Warna */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink">1. Token Warna (Emerald Green & Warm Gold)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
              <div className="p-4 rounded-control bg-brand text-white font-medium flex flex-col justify-between h-24 shadow-sm">
                <span>Brand</span>
                <span>#0F6B4F</span>
              </div>
              <div className="p-4 rounded-control bg-brand-strong text-white font-medium flex flex-col justify-between h-24 shadow-sm">
                <span>Brand Strong</span>
                <span>#0B5640</span>
              </div>
              <div className="p-4 rounded-control bg-brand-soft text-brand font-medium flex flex-col justify-between h-24 border border-brand/20">
                <span>Brand Soft</span>
                <span>#E8F5EF</span>
              </div>
              <div className="p-4 rounded-control bg-accent text-[#14201B] font-bold flex flex-col justify-between h-24 shadow-sm">
                <span>Accent (Gold)</span>
                <span>#E0A526</span>
              </div>
              <div className="p-4 rounded-control bg-surface border border-border text-ink font-medium flex flex-col justify-between h-24">
                <span>Surface</span>
                <span>#FFFFFF</span>
              </div>
              <div className="p-4 rounded-control bg-bg border border-border text-ink font-medium flex flex-col justify-between h-24">
                <span>Background</span>
                <span>#F7F8F5</span>
              </div>
            </div>
          </section>

          {/* Section 2: Tombol & Chips */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-ink">2. Tombol (Min. 44px Touch Target) & Chips</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="md">
                Tombol Utama (Brand)
              </Button>
              <Button variant="secondary" size="md">
                Tombol Sekunder (Outline)
              </Button>
              <Button variant="accent" size="md">
                Tombol Aksen (Gold CTA)
              </Button>
              <Button variant="ghost" size="md">
                Tombol Ghost
              </Button>
              <Button variant="primary" size="sm">
                Kecil (SM)
              </Button>
              <Button variant="accent" size="lg">
                Besar (LG)
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Chip variant="default">Kategori Bawaan</Chip>
              <Chip variant="brand">Kaderisasi</Chip>
              <Chip variant="accent">Berita Utama</Chip>
              <Chip variant="success">Pendaftaran Buka</Chip>
              <Chip variant="warning">Sisa 5 Kursi</Chip>
              <Chip variant="danger">Ditutup</Chip>
            </div>
          </section>

          {/* Section 3: Article Card Large (Hero) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink">3. Kartu Artikel — Varian Large (Hero/Featured)</h2>
            <ArticleCard
              variant="large"
              title="Pelantikan Pengurus Daerah Pemuda ICMI Kota Bekasi Periode 2026-2029"
              slug="pelantikan-pengurus-daerah-pemuda-icmi-bekasi-2026-2029"
              excerpt="Pengurus Daerah Pemuda ICMI Kota Bekasi resmi dilantik dengan mengusung spirit transformasi intelektual dan kepemimpinan pemuda berlandaskan nilai keislaman dan keindonesiaan di Balai Patriot."
              category={{ title: "Berita Utama", slug: "berita-utama" }}
              author={{ name: "Dr. Ahmad Fauzi, M.Pd", role: "Ketua Umum" }}
              publishedAt="2026-10-15T09:00:00Z"
              readingTime="4 mnt baca"
            />
          </section>

          {/* Section 4: Article Card Standard (3 Kolom) & Horizontal */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink">4. Kartu Artikel — Varian Standard & Horizontal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ArticleCard
                variant="standard"
                title="Workshop Literasi Digital Cendekia Muda: Mengakselerasi Daya Saing Pemuda Bekasi"
                slug="workshop-literasi-digital-cendekia-muda-bekasi"
                excerpt="Bidang Riset dan Transformasi Digital Pemuda ICMI menyelenggarakan pelatihan intensif pemanfaatan AI untuk pemuda produktif."
                category={{ title: "Kaderisasi", slug: "kaderisasi" }}
                author={{ name: "M. Rizky Pratama, M.Kom" }}
                publishedAt="2026-10-16T13:30:00Z"
              />
              <ArticleCard
                variant="standard"
                title="Dialog Kebangsaan Pemuda: Menjaga Kerukunan dan Stabilitas Sosial di Kota Patriot"
                slug="dialog-kebangsaan-menjaga-kerukunan-stabilitas-bekasi"
                excerpt="Pemuda ICMI menggelar forum silaturahmi lintas organisasi kepemudaan untuk memperkokoh persaudaraan dan kondusivitas wilayah."
                category={{ title: "Kolaborasi", slug: "kemitraan" }}
                author={{ name: "Siti Nurhaliza, S.Sos" }}
                publishedAt="2026-10-18T10:15:00Z"
              />
              <ArticleCard
                variant="standard"
                title="Rakerda Pemuda ICMI: Rumuskan Program Inkubasi Wirausaha Muda Syariah"
                slug="rakerda-program-inkubasi-wirausaha-muda-syariah"
                excerpt="Fokus pada penguatan kemandirian ekonomi, Rapat Kerja Daerah menetapkan inisiatif inkubator bisnis pemula bagi generasi muda."
                category={{ title: "Kegiatan", slug: "kegiatan" }}
                author={{ name: "M. Rizky Pratama, M.Kom" }}
                publishedAt="2026-10-19T14:00:00Z"
              />
            </div>

            <div className="pt-4">
              <ArticleCard
                variant="horizontal"
                title="Pandangan Pemuda ICMI Terhadap Kebijakan Pendidikan Kota Bekasi Menuju Indonesia Emas"
                slug="pandangan-kebijakan-pendidikan-bekasi-indonesia-emas"
                excerpt="Sebuah catatan kritis dan konstruktif mengenai pemerataan akses pendidikan bermutu dan integrasi penguatan karakter akhlak mulia di sekolah negeri maupun swasta."
                category={{ title: "Opini Cendekia", slug: "opini-cendekia" }}
                author={{ name: "Dr. Ahmad Fauzi, M.Pd" }}
                publishedAt="2026-10-17T08:00:00Z"
              />
            </div>
          </section>

          {/* Section 5: Event & Publication Cards */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink">5. Kartu Agenda Kegiatan & Publikasi PDF</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <EventCard
                  title="Seminar Kepemimpinan Pemuda & Dialog Transformasi Digital"
                  slug="seminar-kepemimpinan-pemuda-2026"
                  startDate="2026-11-10T08:30:00Z"
                  location="Auditorium Pemkot Bekasi, Jl. Ahmad Yani No. 1"
                  registrationOpen={true}
                />
                <EventCard
                  title="Kajian Cendekia Bulanan: Etika AI & Masa Depan Ketenagakerjaan"
                  slug="kajian-cendekia-etika-ai"
                  startDate="2026-11-25T19:30:00Z"
                  location="Masjid Agung Al-Barkah Bekasi / Zoom Hybrid"
                  registrationOpen={false}
                  isFull={true}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PublicationCard
                  title="Kompilasi Pemikiran Cendekiawan Muda Kota Bekasi Vol. 1"
                  year={2026}
                  summary="Buku bunga rampai gagasan anggota Pemuda ICMI mengenai pembangunan berkelanjutan, pendidikan, dan ekonomi umat."
                  fileUrl="#"
                  fileSize="2.4 MB"
                />
                <PublicationCard
                  title="Laporan Riset Kesiapan Talenta Digital Pemuda Bekasi 2026"
                  year={2026}
                  summary="Hasil survei kuantitatif dan kualitatif pemetaan kompetensi teknologi generasi Z di 12 kecamatan Kota Bekasi."
                  fileUrl="#"
                  fileSize="1.8 MB"
                />
              </div>
            </div>
          </section>

          {/* Section 6: Author Cards */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink">6. Kartu Profil Penulis & Pengurus (AuthorCard)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AuthorCard
                name="Dr. Ahmad Fauzi, M.Pd"
                slug="ahmad-fauzi"
                role="Ketua Umum"
                bio="Cendekiawan muda aktif di bidang riset kebijakan publik dan kepemudaan Islam di Kota Bekasi."
                social={{
                  instagram: "https://instagram.com",
                  linkedin: "https://linkedin.com",
                  twitter: "https://twitter.com",
                }}
              />
              <AuthorCard
                name="Siti Nurhaliza, S.Sos"
                slug="siti-nurhaliza"
                role="Bidang Komunikasi Publik"
                bio="Praktisi media dan komunikasi publik dengan fokus pada literasi digital pemuda dan jurnalisme warga."
                social={{
                  instagram: "https://instagram.com",
                  website: "https://example.com",
                }}
              />
              <AuthorCard
                name="M. Rizky Pratama, M.Kom"
                slug="rizky-pratama"
                role="Bidang Riset Digital"
                bio="Peneliti teknologi informasi dan advokat pemanfaatan AI untuk pemberdayaan ekonomi masyarakat."
                social={{
                  linkedin: "https://linkedin.com",
                  twitter: "https://twitter.com",
                }}
              />
            </div>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
