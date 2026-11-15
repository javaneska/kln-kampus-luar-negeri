import type { Metadata } from "next";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KLN — Kampus Luar Negeri | Satu rencana, banyak kampus dunia.",
  description:
    "KLN membantu pelajar Indonesia merencanakan studi S1, S2, bahasa, dan pathway di luar negeri melalui jaringan 500+ universitas mitra di 7 negara — tanpa biaya konsultasi untuk pelajar.",
  keywords: [
    "Kampus Luar Negeri",
    "KLN",
    "Kuliah di Luar Negeri",
    "Konsultan Pendidikan Luar Negeri",
    "GlobalBridger.ID",
    "PT Talenta Nusantara Advisory",
    "Study Abroad Indonesia",
  ],
  openGraph: {
    title: "KLN — Kampus Luar Negeri | Satu rencana, banyak kampus dunia.",
    description:
      "Konsultasi gratis perencanaan studi S1, S2, bahasa, dan pathway ke 500+ universitas mitra di Amerika Serikat, Inggris, Australia, Kanada, Selandia Baru, Irlandia, dan Malaysia.",
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-theme="light"
      className={`${montserrat.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-surface-100 text-ink font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
