"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

interface NewsletterFormProps {
  source?: string;
  className?: string;
  variant?: "banner" | "card" | "inline";
}

export function NewsletterForm({
  source = "homepage",
  className = "",
  variant = "banner",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!privacyConsent) {
      setFieldErrors({
        privacyConsent: ["Anda wajib menyetujui Kebijakan Privasi untuk berlangganan buletin."],
      });
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source,
          privacyConsent,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setMessage(data.message || "Gagal memproses pendaftaran. Silakan periksa kembali input Anda.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Pendaftaran buletin berhasil! Silakan periksa kotak masuk email Anda.");
      setEmail("");
      setName("");
      setPrivacyConsent(false);
    } catch {
      setStatus("error");
      setMessage("Terjadi gangguan koneksi ke server. Silakan coba sesaat lagi.");
    }
  };

  if (status === "success") {
    return (
      <div className={`p-6 rounded-card bg-brand-soft border border-brand/30 text-ink ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-brand shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-base text-brand">Pendaftaran Berhasil Dikirim</h4>
            <p className="text-sm text-muted leading-relaxed font-serif">{message}</p>
            <p className="text-xs text-muted mt-2">
              Belum menerima email? Periksa folder spam atau promosi Anda.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-3 text-xs font-semibold text-brand hover:underline self-start"
            >
              Daftarkan email lain →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isBanner = variant === "banner";

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3.5 ${className}`} noValidate>
      {status === "error" && message && (
        <div className="p-3.5 rounded-control bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan alamat email Anda"
              disabled={status === "loading"}
              required
              className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-control text-sm transition-all focus:outline-none focus:ring-2 ${
                isBanner
                  ? "bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:ring-accent"
                  : "bg-surface border border-border text-ink placeholder:text-muted focus:ring-brand focus:border-brand"
              } ${fieldErrors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
          </div>
          {fieldErrors.email && (
            <span className="text-xs text-red-400 font-medium pl-1">
              {fieldErrors.email[0]}
            </span>
          )}
        </div>

        <Button
          type="submit"
          variant={isBanner ? "accent" : "primary"}
          size="md"
          disabled={status === "loading"}
          className="shrink-0 whitespace-nowrap min-h-[44px] gap-2"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Langganan Gratis</span>
          )}
        </Button>
      </div>

      {/* Persetujuan Privasi Wajib (FR-603) */}
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs leading-relaxed select-none">
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            disabled={status === "loading"}
            className="mt-0.5 rounded border-border text-brand focus:ring-brand accent-brand shrink-0 w-4 h-4"
          />
          <span className={isBanner ? "text-white/80" : "text-muted"}>
            Saya menyetujui{" "}
            <Link
              href="/kebijakan-privasi"
              target="_blank"
              className={`underline font-semibold transition-colors ${
                isBanner ? "text-accent hover:text-white" : "text-brand hover:underline"
              }`}
            >
              Kebijakan Privasi
            </Link>{" "}
            dan bersedia menerima buletin informasi berkala dari Pemuda ICMI Kota Bekasi.
          </span>
        </label>
        {fieldErrors.privacyConsent && (
          <span className="text-xs text-red-400 font-medium pl-6">
            {fieldErrors.privacyConsent[0]}
          </span>
        )}
      </div>
    </form>
  );
}
