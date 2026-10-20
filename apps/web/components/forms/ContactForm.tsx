"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website_hp: "", // Honeypot spam trap
    privacyConsent: false,
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Bersihkan galat inline saat pengguna mengetik ulang
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!formData.privacyConsent) {
      setFieldErrors({
        privacyConsent: ["Anda wajib menyetujui Kebijakan Privasi untuk mengirim pesan."],
      });
      return;
    }

    setStatus("loading");
    setStatusMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setStatusMessage(
          data.message || "Gagal mengirim pesan. Silakan periksa kembali isian formulir Anda."
        );
        return;
      }

      setStatus("success");
      setStatusMessage(
        data.message || "Pesan Anda berhasil dikirim. Terima kasih telah menghubungi kami."
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website_hp: "",
        privacyConsent: false,
      });
    } catch {
      setStatus("error");
      setStatusMessage("Terjadi kendala jaringan ke server. Silakan coba sesaat lagi.");
    }
  };

  return (
    <div className="w-full bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card">
      <h3 className="text-xl font-bold text-ink mb-2">Kirim Pesan atau Pertanyaan</h3>
      <p className="text-sm text-muted mb-6">
        Silakan isi formulir di bawah ini. Pengurus Pemuda ICMI Kota Bekasi akan merespons melalui email.
      </p>

      {status === "success" && (
        <div className="mb-6 p-4 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Sukses!</span>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {status === "error" && statusMessage && (
        <div className="mb-6 p-4 rounded-control bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Honeypot Spam Trap (Field ini tersembunyi bagi manusia, bot akan mengisinya) */}
        <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
          <label htmlFor="website_hp">Website Trap</label>
          <input
            id="website_hp"
            name="website_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website_hp}
            onChange={handleChange}
          />
        </div>

        {/* 1. Nama Lengkap */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-semibold text-ink">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: Muhammad Ihsan"
            disabled={status === "loading"}
            required
            className={`w-full min-h-[44px] px-4 py-2.5 rounded-control text-sm bg-bg border border-border text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all ${
              fieldErrors.name ? "border-red-500 ring-1 ring-red-500" : ""
            }`}
          />
          {fieldErrors.name && (
            <span className="text-xs text-red-500 font-medium">{fieldErrors.name[0]}</span>
          )}
        </div>

        {/* 2. Alamat Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-semibold text-ink">
            Alamat Email <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nama@domain.com"
            disabled={status === "loading"}
            required
            className={`w-full min-h-[44px] px-4 py-2.5 rounded-control text-sm bg-bg border border-border text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all ${
              fieldErrors.email ? "border-red-500 ring-1 ring-red-500" : ""
            }`}
          />
          {fieldErrors.email && (
            <span className="text-xs text-red-500 font-medium">{fieldErrors.email[0]}</span>
          )}
        </div>

        {/* 3. Subjek Pesan */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-subject" className="text-sm font-semibold text-ink">
            Subjek Pesan <span className="text-muted text-xs font-normal">(Opsional)</span>
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Contoh: Permohonan Kerjasama Kegiatan / Riset"
            disabled={status === "loading"}
            className={`w-full min-h-[44px] px-4 py-2.5 rounded-control text-sm bg-bg border border-border text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all ${
              fieldErrors.subject ? "border-red-500 ring-1 ring-red-500" : ""
            }`}
          />
          {fieldErrors.subject && (
            <span className="text-xs text-red-500 font-medium">{fieldErrors.subject[0]}</span>
          )}
        </div>

        {/* 4. Pesan */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="text-sm font-semibold text-ink">
            Pesan Anda <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tuliskan pesan, aspirasi, atau pertanyaan Anda secara rinci..."
            disabled={status === "loading"}
            required
            className={`w-full p-4 rounded-control text-sm bg-bg border border-border text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all resize-y min-h-[120px] ${
              fieldErrors.message ? "border-red-500 ring-1 ring-red-500" : ""
            }`}
          />
          {fieldErrors.message && (
            <span className="text-xs text-red-500 font-medium">{fieldErrors.message[0]}</span>
          )}
        </div>

        {/* 5. Persetujuan Privasi Wajib (FR-603) */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-muted leading-relaxed select-none">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={handleChange}
              disabled={status === "loading"}
              className="mt-0.5 rounded border-border text-brand focus:ring-brand accent-brand shrink-0 w-4 h-4"
            />
            <span>
              Saya menyetujui data pribadi yang saya kirimkan diproses sesuai dengan{" "}
              <Link
                href="/kebijakan-privasi"
                target="_blank"
                className="text-brand font-semibold underline hover:text-brand-strong"
              >
                Kebijakan Privasi
              </Link>{" "}
              Pemuda ICMI Kota Bekasi. <span className="text-red-500">*</span>
            </span>
          </label>
          {fieldErrors.privacyConsent && (
            <span className="text-xs text-red-500 font-medium pl-7">
              {fieldErrors.privacyConsent[0]}
            </span>
          )}
        </div>

        {/* Tombol Kirim */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={status === "loading"}
            className="w-full sm:w-auto min-h-[44px] gap-2 px-8"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirim Pesan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Pesan Sekarang</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
