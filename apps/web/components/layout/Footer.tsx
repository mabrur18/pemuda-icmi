import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "../ui/Container";
import { getSiteLogo } from "@/lib/sanity/site-logo";
import { getSiteContact } from "@/lib/sanity/site-settings";
import { sanityFetch } from "@/lib/sanity/fetch";
import { FOOTER_CATEGORIES_QUERY, PAGE_SLUGS_QUERY } from "@/lib/sanity/queries";
import { Instagram, Youtube, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";

const FALLBACK_CATEGORIES = [
  { title: "Berita Utama", slug: "berita-utama" },
  { title: "Kaderisasi & Pelatihan", slug: "kaderisasi" },
  { title: "Opini Cendekia", slug: "opini-cendekia" },
  { title: "Kegiatan Organisasi", slug: "kegiatan" },
  { title: "Kolaborasi & Sinergi", slug: "kemitraan" },
];

export async function Footer() {
  const [logo, contact, categoriesRaw, pageSlugsRaw] = await Promise.all([
    getSiteLogo(),
    getSiteContact(),
    sanityFetch<{ title: string; slug: string }[]>({
      query: FOOTER_CATEGORIES_QUERY,
      tags: ["categories"],
    }).catch(() => []),
    sanityFetch<string[]>({ query: PAGE_SLUGS_QUERY, tags: ["pages"] }).catch(() => []),
  ]);
  const categories = categoriesRaw?.length ? categoriesRaw : FALLBACK_CATEGORIES;
  const pageSlugs = new Set(pageSlugsRaw || []);
  const socials = [
    { href: contact.social.instagram, label: "Instagram", Icon: Instagram },
    { href: contact.social.youtube, label: "YouTube", Icon: Youtube },
    { href: contact.social.facebook, label: "Facebook", Icon: Facebook },
    { href: contact.social.twitter, label: "X (Twitter)", Icon: Twitter },
  ].filter((s) => !!s.href);
  const legalLinks = [
    { href: "/kebijakan-privasi", label: "Kebijakan Privasi", slug: "kebijakan-privasi" },
    { href: "/redaksi", label: "Susunan Redaksi", slug: "redaksi" },
    { href: "/pedoman-media-siber", label: "Pedoman Media Siber", slug: "pedoman-media-siber" },
  ].filter((l) => pageSlugs.has(l.slug));
  const showAbout = pageSlugs.has("tentang-kami");
  return (
    <footer className="w-full bg-surface border-t border-border mt-auto pt-12 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-border">
          {/* Kolom 1: Profil Organisasi */}
          <div className="flex flex-col gap-4">
            {logo ? (
              <Image
                src={logo.url}
                alt={logo.alt}
                width={160}
                height={36}
                unoptimized
                className="h-9 w-auto max-w-[200px] object-contain self-start"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-base shadow-sm">
                  <span className="text-accent font-extrabold">I</span>
                  <span>C</span>
                </div>
                <span className="font-bold text-lg text-ink">Pemuda ICMI</span>
              </div>
            )}
            <p className="text-sm text-muted leading-relaxed">
              Organisasi Daerah Pemuda Ikatan Cendekiawan Muslim se-Indonesia (Pemuda ICMI) Kota Bekasi.
              Mewadahi cendekia muda dalam kepemimpinan, riset, dan pengabdian umat.
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-control bg-bg hover:bg-brand-soft text-muted hover:text-brand transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
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
              {showAbout && (
                <li>
                  <Link href="/tentang-kami" className="hover:text-brand transition-colors">
                    Tentang Organisasi
                  </Link>
                </li>
              )}
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
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="hover:text-brand transition-colors"
                  >
                    {cat.title}
                  </Link>
                </li>
              ))}
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
                <span className="whitespace-pre-line">{contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-brand transition-colors break-all">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand shrink-0" />
                <a href={`tel:+${contact.phoneDigits}`} className="hover:text-brand transition-colors">
                  {contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Copyright & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Pemuda ICMI Kota Bekasi. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-brand transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
