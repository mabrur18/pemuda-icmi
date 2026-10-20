"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";
import { clsx } from "clsx";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Berita", href: "/berita" },
  { label: "Kegiatan", href: "/kegiatan" },
  { label: "Publikasi", href: "/publikasi" },
  { label: "Tentang", href: "/tentang" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md bg-surface/90 border-b border-border",
        isScrolled ? "h-14 sm:h-14 shadow-sm" : "h-[72px] sm:h-[72px]"
      )}
    >
      <Container className="h-full flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-accent font-extrabold">I</span>
            <span>C</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg leading-tight text-ink group-hover:text-brand transition-colors">
              Pemuda ICMI
            </span>
            <span className="text-[11px] font-medium text-muted tracking-wider uppercase">
              Kota Bekasi
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "px-3.5 py-2 text-sm font-medium rounded-control transition-colors min-h-[44px] flex items-center",
                  isActive
                    ? "text-brand bg-brand-soft font-semibold"
                    : "text-muted hover:text-ink hover:bg-brand-soft/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/cari"
            className="w-10 h-10 flex items-center justify-center rounded-control text-muted hover:text-ink hover:bg-brand-soft transition-colors"
            title="Cari Berita"
          >
            <Search className="w-4 h-4" />
          </Link>

          <ThemeToggle />

          <Link href="/kegiatan">
            <Button variant="accent" size="md">
              Daftar Kegiatan
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink hover:text-brand rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[100%] bg-surface border-b border-border shadow-xl px-4 py-6 transition-all animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "px-4 py-3 text-base font-medium rounded-control transition-colors flex items-center min-h-[44px]",
                    isActive
                      ? "text-brand bg-brand-soft font-semibold"
                      : "text-ink hover:bg-brand-soft/50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/cari"
              className="px-4 py-3 text-base font-medium text-ink hover:bg-brand-soft/50 rounded-control flex items-center gap-2 min-h-[44px]"
            >
              <Search className="w-4 h-4" />
              <span>Pencarian Artikel</span>
            </Link>

            <div className="pt-4 border-t border-border mt-2">
              <Link href="/kegiatan" className="block w-full">
                <Button variant="accent" size="lg" className="w-full">
                  Daftar Kegiatan
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
