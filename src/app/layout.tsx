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
  title: "ClawdBot Hosting - Your AI Assistant, Hosted 24/7",
  description: "Get your own ClawdBot instance running 24/7 in the cloud. No setup required.",
  metadataBase: new URL("https://clawdbot.day"),
  openGraph: {
    title: "ClawdBot Hosting - Your AI Assistant, Hosted 24/7",
    description: "Get your own ClawdBot instance running 24/7 in the cloud. No setup required.",
    url: "https://clawdbot.day",
    siteName: "ClawdBot Hosting",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawdBot Hosting - Your AI Assistant, Hosted 24/7",
    description: "Get your own ClawdBot instance running 24/7 in the cloud. No setup required.",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17908084420"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17908084420');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
