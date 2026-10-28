import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapPin, Mail, Phone, Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { getSiteContact } from "@/lib/sanity/site-settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description:
    "Hubungi Sekretariat Pemuda ICMI Kota Bekasi. Kirimkan pertanyaan, proposal kolaborasi, saran, atau aspirasi kepemudaan Anda.",
  alternates: {
    canonical: "/kontak",
  },
  openGraph: {
    title: "Hubungi Kami | Pemuda ICMI Kota Bekasi",
    description:
      "Hubungi Sekretariat Pemuda ICMI Kota Bekasi. Kirimkan pertanyaan, proposal kolaborasi, saran, atau aspirasi kepemudaan Anda.",
    url: "/kontak",
  },
};

export default async function KontakPage() {
  const contact = await getSiteContact();
  return (
    <div className="py-10 sm:py-14 bg-bg min-h-screen">
      <Container>
        {/* Header Bagian */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-wider mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            Layanan Komunikasi & Sekretariat
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4 font-sans">
            Hubungi Pemuda ICMI Kota Bekasi
          </h1>
          <p className="text-base sm:text-lg text-muted font-serif leading-relaxed">
            Kami terbuka untuk dialog, kolaborasi riset, kemitraan program, dan aspirasi masyarakat cendekia di Kota Bekasi.
          </p>
        </div>

        {/* Konten 2 Kolom: Informasi Kontak & Formulir */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Kolom Kiri (5 Kolom): Detail Kontak Organisasi */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface border border-border rounded-card p-6 sm:p-7 flex flex-col gap-6 shadow-xs">
              <h2 className="text-lg font-bold text-ink border-b border-border pb-3">
                Informasi Sekretariat
              </h2>

              <div className="flex flex-col gap-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-control bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">Alamat Kantor</span>
                    <span className="text-muted leading-relaxed whitespace-pre-line">
                      {contact.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-control bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">Surat Elektronik (Email)</span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-brand hover:underline font-medium break-all"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-control bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">Telepon / WhatsApp</span>
                    <a
                      href={`https://wa.me/${contact.phoneDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline font-medium"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-control bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">Jam Operasional Layanan</span>
                    <span className="text-muted">Senin – Jumat: 09.00 – 17.00 WIB</span>
                    <span className="text-muted">Sabtu – Ahad: Libur (Pesan dicatat)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jaminan Privasi */}
            <div className="p-5 rounded-card bg-surface/50 border border-border/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="text-xs text-muted leading-relaxed">
                <span className="font-semibold text-ink block mb-0.5">Privasi Terlindungi</span>
                Setiap pesan dan data pribadi yang dikirimkan melalui situs ini dienkripsi dan dijamin kerahasiaannya sesuai ketentuan undang-undang perlindungan data pribadi.
              </div>
            </div>
          </div>

          {/* Kolom Kanan (7 Kolom): Formulir Kontak Interaktif */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
