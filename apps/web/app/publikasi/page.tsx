import React from "react";
import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { sanityFetch } from "@/lib/sanity/fetch";
import { PUBLICATIONS_QUERY } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Publikasi & Riset",
  description:
    "Publikasi, kajian, dan dokumen riset Pemuda ICMI Kota Bekasi yang dapat diunduh.",
  alternates: { canonical: "/publikasi" },
};

interface PublicationItem {
  _id: string;
  title: string;
  year: number;
  summary?: string;
  fileUrl?: string;
}

export default async function PublikasiPage() {
  const items =
    (await sanityFetch<PublicationItem[]>({
      query: PUBLICATIONS_QUERY,
      tags: ["publications"],
    }).catch(() => [])) || [];

  return (
    <div className="py-10 sm:py-14 bg-bg min-h-screen">
      <Container>
        <div className="max-w-3xl mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            Dokumen Resmi
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
            Publikasi &amp; Riset
          </h1>
          <p className="text-muted text-base sm:text-lg">
            Kajian, buku, dan dokumen riset yang diterbitkan Pemuda ICMI Kota Bekasi.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-card">
            <p className="text-muted">Belum ada publikasi yang diterbitkan.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((p) => (
              <li
                key={p._id}
                className="flex flex-col gap-3 p-6 bg-surface border border-border rounded-card shadow-card"
              >
                <span className="text-xs font-bold text-brand uppercase tracking-wider">
                  Tahun {p.year}
                </span>
                <h2 className="text-lg font-bold text-ink leading-snug">{p.title}</h2>
                {p.summary && (
                  <p className="text-sm text-muted leading-relaxed line-clamp-4">{p.summary}</p>
                )}
                {p.fileUrl && (
                  <a
                    href={`${p.fileUrl}?dl=`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline mt-auto"
                  >
                    <Download className="w-4 h-4" />
                    Unduh PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
