import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.URL ?? process.env.SITE_URL ?? "https://sevgili.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sevgili Bulmacası | Kişiye Özel Romantik Bulmaca",
  description:
    "Anılarınızı, şakalarınızı ve özel kelimelerinizi romantik bir bulmacaya dönüştürün.",
  openGraph: {
    title: "Sevgili Bulmacası",
    description:
      "Anılarınızı ona özel bir bulmacaya dönüştürün. Çözdüğünde sürpriz mesajınız açılsın.",
    siteName: "Sevgili Bulmacası",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#9b1f3c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${cormorant.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
