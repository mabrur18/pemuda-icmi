import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Home, Newspaper, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 bg-background">
      <Container className="max-w-2xl">
        <div className="text-center max-w-lg mx-auto">
          {/* 404 Badge & Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-soft text-brand mb-6 shadow-xs">
            <HelpCircle className="w-8 h-8" />
          </div>

          <div className="text-6xl md:text-7xl font-heading font-black text-brand mb-3 tracking-tight">
            404
          </div>

          <h1 className="font-heading font-bold text-2xl md:text-3xl text-ink mb-3">
            Halaman Tidak Ditemukan
          </h1>

          <p className="text-ink/70 text-sm md:text-base leading-relaxed mb-8">
            Mohon maaf, halaman yang Anda cari mungkin telah dipindahkan, diubah alamat tautannya,
            atau tidak lagi tersedia di portal ini.
          </p>

          {/* Quick Search */}
          <form action="/cari" method="GET" className="relative mb-8 max-w-md mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="search"
                name="q"
                placeholder="Cari artikel atau topik..."
                required
                className="w-full h-11 pl-10 pr-24 rounded-control border border-border bg-surface text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 rounded-control bg-brand text-white text-xs font-semibold hover:bg-brand-strong transition-colors min-h-[32px]"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-control text-sm font-semibold bg-brand text-white hover:bg-brand-strong transition-colors min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
            <Link
              href="/berita"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-control text-sm font-semibold border border-border bg-surface text-ink hover:bg-brand-soft hover:text-brand transition-colors min-h-[44px]"
            >
              <Newspaper className="w-4 h-4" />
              <span>Indeks Berita</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
