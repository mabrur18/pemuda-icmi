import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, Info, MailCheck, ArrowLeft, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Konfirmasi Buletin",
  description: "Status konfirmasi langganan buletin Pemuda ICMI Kota Bekasi.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function BuletinKonfirmasiPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  let title = "Konfirmasi Berlangganan";
  let description = "Memverifikasi permohonan langganan buletin Anda...";
  let icon = <MailCheck className="w-12 h-12 text-brand" />;
  let badgeColor = "bg-brand-soft text-brand";

  if (status === "success") {
    title = "Langganan Berhasil Dikonfirmasi!";
    description =
      "Alamat email Anda telah aktif terdaftar dalam buletin berkala Pemuda ICMI Kota Bekasi. Anda akan menerima intisari kegiatan, rilis riset, dan analisis cendekia terkurasi.";
    icon = <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400" />;
    badgeColor = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  } else if (status === "already_confirmed") {
    title = "Email Sudah Terdaftar";
    description =
      "Alamat email Anda sebelumnya telah terkonfirmasi aktif. Anda tetap akan menerima buletin berkala seperti biasa.";
    icon = <Info className="w-14 h-14 text-blue-600 dark:text-blue-400" />;
    badgeColor = "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  } else if (status === "unsubscribed") {
    title = "Berhenti Berlangganan Berhasil";
    description =
      "Anda telah berhasil berhenti berlangganan dari buletin berkala Pemuda ICMI Kota Bekasi. Kami menghormati keputusan Anda.";
    icon = <CheckCircle2 className="w-14 h-14 text-amber-600 dark:text-amber-400" />;
    badgeColor = "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  } else if (status === "invalid") {
    title = "Tautan Konfirmasi Tidak Valid";
    description =
      "Tautan konfirmasi yang Anda gunakan tidak ditemukan atau telah kedaluwarsa. Silakan lakukan pendaftaran ulang melalui situs web.";
    icon = <AlertCircle className="w-14 h-14 text-red-600 dark:text-red-400" />;
    badgeColor = "bg-red-500/10 text-red-700 dark:text-red-400";
  } else if (status === "error") {
    title = "Terjadi Kesalahan";
    description =
      "Maaf, terjadi kendala saat memproses konfirmasi Anda. Silakan coba sesaat lagi atau hubungi tim sekretariat kami.";
    icon = <AlertCircle className="w-14 h-14 text-red-600 dark:text-red-400" />;
    badgeColor = "bg-red-500/10 text-red-700 dark:text-red-400";
  }

  return (
    <div className="py-16 sm:py-24 bg-bg min-h-[70vh] flex items-center justify-center">
      <Container>
        <div className="max-w-xl mx-auto bg-surface border border-border rounded-card p-8 sm:p-12 shadow-card text-center flex flex-col items-center">
          <div className="mb-6 p-4 rounded-full bg-surface shadow-xs border border-border inline-flex">
            {icon}
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${badgeColor}`}
          >
            Buletin Cendekia Muda
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-4 font-sans">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-muted font-serif leading-relaxed mb-8 max-w-md">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full gap-2 min-h-[44px]">
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </Button>
            </Link>

            <Link href="/berita" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full gap-2 min-h-[44px]">
                <Newspaper className="w-4 h-4" />
                <span>Baca Berita Terbaru</span>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
