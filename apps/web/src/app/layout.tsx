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

export const metadata: Metadata = {
  title: "Clawd Host - Easy ClawdBot Hosting, 24/7",
  description: "The easiest way to host ClawdBot. Get your own instance running 24/7 in the cloud. No setup required. Linux from $29/mo, macOS from $149/mo.",
  metadataBase: new URL("https://clawdhost.tech"),
  keywords: ["ClawdBot", "ClawdBot hosting", "AI assistant", "cloud hosting", "macOS VPS", "Linux VPS", "WhatsApp bot", "Telegram bot", "iCloud sync"],
  authors: [{ name: "Clawd Host" }],
  creator: "Clawd Host",
  publisher: "Clawd Host",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Clawd Host - Easy ClawdBot Hosting, 24/7",
    description: "The easiest way to host ClawdBot. Get your own instance running 24/7 in the cloud. No setup required. Linux from $29/mo, macOS from $149/mo.",
    url: "https://clawdhost.tech",
    siteName: "Clawd Host",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://clawdhost.tech/clawdhost_landscape_64kb.jpg",
        width: 1200,
        height: 630,
        alt: "Clawd Host - Easy ClawdBot Hosting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clawd Host - Easy ClawdBot Hosting, 24/7",
    description: "The easiest way to host ClawdBot. Get your own instance running 24/7 in the cloud. No setup required.",
    images: ["https://clawdhost.tech/clawdhost_landscape_64kb.jpg"],
  },
  alternates: {
    canonical: "https://clawdhost.tech",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MFBQ79QV');
          `}
        </Script>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://clawdhost.tech/#organization",
                  name: "Clawd Host",
                  url: "https://clawdhost.tech",
                  logo: "https://clawdhost.tech/clawdhost_logo_27kb.jpg",
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "support@clawdhost.tech",
                    contactType: "customer service",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://clawdhost.tech/#website",
                  url: "https://clawdhost.tech",
                  name: "Clawd Host",
                  publisher: { "@id": "https://clawdhost.tech/#organization" },
                },
                {
                  "@type": "Product",
                  name: "ClawdBot Linux Hosting",
                  description: "ClawdBot AI assistant hosted on Linux VPS. 24/7 availability, WhatsApp & Telegram integration, web browsing, file management.",
                  brand: { "@id": "https://clawdhost.tech/#organization" },
                  offers: {
                    "@type": "Offer",
                    price: "29",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/InStock",
                    url: "https://clawdhost.tech",
                  },
                },
                {
                  "@type": "Product",
                  name: "ClawdBot macOS M1 Hosting",
                  description: "ClawdBot AI assistant hosted on macOS M1. iCloud sync, iMessage integration, desktop mirroring, 24/7 availability.",
                  brand: { "@id": "https://clawdhost.tech/#organization" },
                  offers: {
                    "@type": "Offer",
                    price: "149",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/InStock",
                    url: "https://clawdhost.tech",
                  },
                },
                {
                  "@type": "Product",
                  name: "ClawdBot macOS M4 Hosting",
                  description: "ClawdBot AI assistant hosted on macOS M4. Premium performance, iCloud sync, iMessage integration, desktop mirroring, 24/7 availability.",
                  brand: { "@id": "https://clawdhost.tech/#organization" },
                  offers: {
                    "@type": "Offer",
                    price: "249",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/InStock",
                    url: "https://clawdhost.tech",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MFBQ79QV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
