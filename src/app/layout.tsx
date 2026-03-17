import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const normalizedPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const normalizedVercelUrl = process.env.VERCEL_URL?.trim();

const siteUrl =
  normalizedPublicSiteUrl ??
  (normalizedVercelUrl ? `https://${normalizedVercelUrl}` : "https://onlinepiano-rho.vercel.app");

export const metadata: Metadata = {
  title: "Online Piano – 88-Key Arranger Keyboard Workstation",
  description:
    "Free browser-based 88-key piano with MIDI input, auto-accompaniment styles (Pop, Gospel, Rock, Ballad, Afrobeat, Funk, Dance), reverb, chorus, delay, EQ, and more. Play online instantly.",
  keywords: [
    "online piano",
    "virtual piano",
    "88 key piano",
    "midi keyboard",
    "arranger keyboard",
    "play piano online",
    "free online piano",
    "web piano",
  ],
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Online Piano – 88-Key Arranger Keyboard Workstation",
    description:
      "Play a free 88-key virtual piano with auto-accompaniment, MIDI input, and live effects right in your browser.",
    url: siteUrl,
    siteName: "Online Piano",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Piano – 88-Key Arranger Keyboard",
    description: "Free browser-based piano with MIDI, auto-styles, reverb, chorus, delay and EQ.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en">
      {adsenseClient ? (
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
      ) : null}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
