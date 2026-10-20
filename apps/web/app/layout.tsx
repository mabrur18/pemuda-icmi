import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pemuda ICMI Kota Bekasi",
    template: "%s | Pemuda ICMI Kota Bekasi",
  },
  description: "Portal resmi Organisasi Daerah Pemuda ICMI Kota Bekasi.",
};

import { themePreRenderScript } from "@/components/ui/ThemeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${sourceSerif4.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themePreRenderScript,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-bg text-ink">{children}</body>
    </html>
  );
}
