/**
 * Modul Layanan Pengiriman Email (FR-601)
 * Default menggunakan Mock Email Provider bawaan.
 * Dapat dihubungkan ke Resend atau SMTP di masa mendatang melalui variabel lingkungan.
 */

export interface NewsletterEmailPayload {
  email: string;
  name?: string;
  confirmToken: string;
  siteUrl?: string;
}

export interface SendEmailResult {
  success: boolean;
  provider: "mock" | "resend" | "smtp";
  messageId?: string;
  confirmationUrl: string;
  unsubscribeUrl: string;
  error?: string;
}

/**
 * Membuat tautan konfirmasi dan penghentian langganan
 */
export function buildNewsletterUrls(siteUrl: string, confirmToken: string) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  return {
    confirmationUrl: `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`,
    unsubscribeUrl: `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(confirmToken)}`,
  };
}

/**
 * Menghasilkan konten HTML email konfirmasi buletin bernuansa Pemuda ICMI
 */
export function generateNewsletterEmailHtml({
  email,
  name,
  confirmationUrl,
  unsubscribeUrl,
}: {
  email: string;
  name?: string;
  confirmationUrl: string;
  unsubscribeUrl: string;
}): string {
  const greeting = name ? `Assalamu'alaikum wr. wb., <strong>${name}</strong>` : "Assalamu'alaikum wr. wb.";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Konfirmasi Berlangganan Buletin Pemuda ICMI Kota Bekasi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; line-height: 1.6; }
    .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #047857 0%, #065f46 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; }
    .btn { display: inline-block; background-color: #047857; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
    .footer { padding: 20px 24px; background-color: #f1f5f9; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer a { color: #047857; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pemuda ICMI Kota Bekasi</h1>
      <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Buletin Warta & Kajian Cendekia</p>
    </div>
    <div class="content">
      <p>${greeting},</p>
      <p>Terima kasih telah mendaftarkan alamat email Anda (<strong>${email}</strong>) untuk menerima buletin berkala Pemuda ICMI Kota Bekasi.</p>
      <p>Untuk mengaktifkan langganan Anda dan memastikan ini adalah permintaan Anda, silakan klik tombol konfirmasi di bawah ini:</p>
      <div style="text-align: center;">
        <a href="${confirmationUrl}" class="btn" target="_blank" rel="noopener noreferrer">Konfirmasi Berlangganan</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">Atau salin tautan berikut ke peramban Anda:<br><a href="${confirmationUrl}" style="color: #047857; word-break: break-all;">${confirmationUrl}</a></p>
      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Jika Anda merasa tidak pernah meminta pendaftaran ini, abaikan email ini atau klik <a href="${unsubscribeUrl}">batalkan langganan</a>.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Pemuda ICMI Kota Bekasi. Jl. Ahmad Yani No. 1, Kota Bekasi, Jawa Barat.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Mengirim email konfirmasi buletin.
 * Menggunakan Mock Provider secara default, atau Resend jika RESEND_API_KEY disetel.
 */
export async function sendNewsletterConfirmationEmail(
  payload: NewsletterEmailPayload
): Promise<SendEmailResult> {
  const siteUrl = payload.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { confirmationUrl, unsubscribeUrl } = buildNewsletterUrls(siteUrl, payload.confirmToken);

  // Jika kunci Resend tersedia, gunakan Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Pemuda ICMI <buletin@pemudaicmi-kotabekasi.org>",
          to: [payload.email],
          subject: "Konfirmasi Berlangganan Buletin - Pemuda ICMI Kota Bekasi",
          html: generateNewsletterEmailHtml({
            email: payload.email,
            name: payload.name,
            confirmationUrl,
            unsubscribeUrl,
          }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[EMAIL RESEND ERROR]:", errorText);
        // Fallback log
      } else {
        const data = await response.json();
        return {
          success: true,
          provider: "resend",
          messageId: data.id,
          confirmationUrl,
          unsubscribeUrl,
        };
      }
    } catch (err: any) {
      console.error("[EMAIL RESEND EXCEPTION]:", err?.message);
    }
  }

  // DEFAULT / MOCK EMAIL PROVIDER
  const mockId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  console.log(`
================================================================================
[MOCK EMAIL PROVIDER] Konfirmasi Buletin Pemuda ICMI
--------------------------------------------------------------------------------
ID           : ${mockId}
To           : ${payload.email} ${payload.name ? `(${payload.name})` : ""}
Subject      : Konfirmasi Berlangganan Buletin - Pemuda ICMI Kota Bekasi
Konfirmasi   : ${confirmationUrl}
Batal Langgan: ${unsubscribeUrl}
================================================================================
`);

  return {
    success: true,
    provider: "mock",
    messageId: mockId,
    confirmationUrl,
    unsubscribeUrl,
  };
}
