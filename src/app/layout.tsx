import type { Metadata, Viewport } from "next";
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "YKS Planlayıcı",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('yks-planner-storage');
                  var theme = 'dark';
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    if (parsed && parsed.state && parsed.state.theme) {
                      theme = parsed.state.theme;
                    }
                  }
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-neutral-200">{children}</body>
    </html>
  );
}
