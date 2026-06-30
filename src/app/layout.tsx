import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YKS 2027 Çalışma Planlayıcısı — Kişisel Ders Programım",
  description: "YKS 2027 sınavına hazırlanan öğrenciler için tasarlanmış, sade, modern, tarayıcı tabanlı ve baskı dostu PDF destekli ders çalışma planlama aracı.",
  keywords: ["YKS 2027", "TYT", "AYT", "ders çalışma planı", "çalışma planlayıcı", "PDF ders programı", "Sayısal çalışma programı"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-black text-neutral-200">{children}</body>
    </html>
  );
}

