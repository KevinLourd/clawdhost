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
  title: "ClawdHost - Easy MoltBot Hosting, 24/7",
  description: "The easiest way to host MoltBot. Get your own AI assistant running 24/7 in the cloud. No setup required. Free tier available.",
  metadataBase: new URL("https://clawdhost.tech"),
  keywords: ["MoltBot", "MoltBot hosting", "ClawdHost", "AI assistant", "cloud hosting", "macOS VPS", "Linux VPS", "WhatsApp bot", "Telegram bot", "iCloud sync"],
  authors: [{ name: "ClawdHost" }],
  creator: "ClawdHost",
  publisher: "ClawdHost",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ClawdHost - Easy MoltBot Hosting, 24/7",
    description: "The easiest way to host MoltBot. Get your own AI assistant running 24/7 in the cloud. No setup required. Free tier available.",
    url: "https://clawdhost.tech",
    siteName: "ClawdHost",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://clawdhost.tech/clawdhost_landscape_64kb.jpg",
        width: 1200,
        height: 630,
        alt: "ClawdHost - Easy MoltBot Hosting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawdHost - Easy MoltBot Hosting, 24/7",
    description: "The easiest way to host MoltBot. Get your own AI assistant running 24/7 in the cloud. No setup required.",
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
                  name: "ClawdHost",
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
                  name: "ClawdHost",
                  publisher: { "@id": "https://clawdhost.tech/#organization" },
                },
                {
                  "@type": "Product",
                  name: "MoltBot Free Hosting",
                  description: "MoltBot AI assistant hosted for free. 24/7 availability, Telegram integration, bring your own API key.",
                  brand: { "@id": "https://clawdhost.tech/#organization" },
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/InStock",
                    url: "https://clawdhost.tech",
                  },
                },
                {
                  "@type": "Product",
                  name: "MoltBot Pro Hosting",
                  description: "MoltBot AI assistant with unlimited channels, skills, and hooks. 24/7 availability, WhatsApp & Telegram integration.",
                  brand: { "@id": "https://clawdhost.tech/#organization" },
                  offers: {
                    "@type": "Offer",
                    price: "49",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/PreOrder",
                    url: "https://clawdhost.tech",
                  },
                },
                {
                  "@type": "Product",
                  name: "MoltBot Apple Hosting",
                  description: "MoltBot AI assistant hosted on macOS. iCloud sync, iMessage integration, 24/7 availability.",
                  brand: { "@id": "https://clawdhost.tech/#organization" },
                  offers: {
                    "@type": "Offer",
                    price: "149",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/PreOrder",
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
