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
  metadataBase: new URL("https://portal.admajaskanifo.org"),

  // Tittle
  title: "Portal Admaja",
  description: "Portal Admaja",

  // category
  category: "information",

  // Informasi pembuat
  authors: [{ name: "Nabil Arif", url: "https://appsporto.vercel.app" }],
  creator: "Nabil Arif",
  publisher: "Adika Mahdi Jaya",

  // Favicon dan icon untuk berbagai device
  icons: {
    icon: [
      { url: "/icon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icon/apple-touch-icon.png", // icon untuk iOS
  },

  openGraph: {
    title: "Portal Admaja", // Judul saat di-share
    description: "Portal Admaja", // Deskripsi saat di-share
    url: "https://portal.admajaskanifo.org", // URL utama
    siteName: "Portal Admaja",
    images: [
      {
        url: "/logo-v2.png", // Gambar preview
        width: 1200,
        height: 630,
        alt: "Preview Image",
      },
    ],
    locale: "id_ID", // Bahasa / region
    type: "website",
  },

  // Twitter Card (untuk share ke Twitter/X)
  twitter: {
    card: "summary_large_image", // tipe card
    title: "Portal Admaja",
    description: "Portal Anggota Resmi Admaja",
    images: ["/logo-v2.png"],
    creator: "@n_apipppp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col max-w-lg mx-auto">{children}</body>
    </html>
  );
}
