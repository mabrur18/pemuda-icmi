import React from "react";
import Link from "next/link";
import { Container } from "../ui/Container";
import { Instagram, Youtube, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border mt-auto pt-12 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-border">
          {/* Kolom 1: Profil Organisasi */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-base shadow-sm">
                <span className="text-accent font-extrabold">I</span>
                <span>C</span>
              </div>
              <span className="font-bold text-lg text-ink">Pemuda ICMI</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Organisasi Daerah Pemuda Ikatan Cendekiawan Muslim se-Indonesia (Pemuda ICMI) Kota Bekasi.
              Mewadahi cendekia muda dalam kepemimpinan, riset, dan pengabdian umat.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-control bg-bg hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-control bg-bg hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-control bg-bg hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-control bg-bg hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm tracking-wider uppercase text-ink">
              Navigasi
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-brand transition-colors">
                  Indeks Berita
                </Link>
              </li>
              <li>
                <Link href="/kegiatan" className="hover:text-brand transition-colors">
                  Agenda & Kegiatan
                </Link>
              </li>
              <li>
                <Link href="/publikasi" className="hover:text-brand transition-colors">
                  Publikasi & Riset
                </Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="hover:text-brand transition-colors">
                  Tentang Organisasi
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-brand transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kategori Utama */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm tracking-wider uppercase text-ink">
              Kategori
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted">
              <li>
                <Link href="/kategori/berita-utama" className="hover:text-brand transition-colors">
                  Berita Utama
                </Link>
              </li>
              <li>
                <Link href="/kategori/kaderisasi" className="hover:text-brand transition-colors">
                  Kaderisasi & Pelatihan
                </Link>
              </li>
              <li>
                <Link href="/kategori/opini-cendekia" className="hover:text-brand transition-colors">
                  Opini Cendekia
                </Link>
              </li>
              <li>
                <Link href="/kategori/kegiatan" className="hover:text-brand transition-colors">
                  Kegiatan Organisasi
                </Link>
              </li>
              <li>
                <Link href="/kategori/kemitraan" className="hover:text-brand transition-colors">
                  Kolaborasi & Sinergi
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Sekretariat */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm tracking-wider uppercase text-ink">
              Sekretariat
            </h4>
            <div className="flex flex-col gap-3 text-sm text-muted">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>Kota Bekasi, Jawa Barat, Indonesia</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand shrink-0" />
                <span>kontak@pemudaicmi-kotabekasi.org</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Copyright & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Pemuda ICMI Kota Bekasi. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <Link href="/kebijakan-privasi" className="hover:text-brand transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/redaksi" className="hover:text-brand transition-colors">
              Susunan Redaksi
            </Link>
            <Link href="/pedoman-media-siber" className="hover:text-brand transition-colors">
              Pedoman Media Siber
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
