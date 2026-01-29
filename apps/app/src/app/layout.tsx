import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "ClawdHost - Setup Your AI Assistant",
  description: "Set up your personal AI assistant running 24/7. Chat via Telegram, WhatsApp, or Discord. No terminal required.",
  metadataBase: new URL("https://app.clawdhost.tech"),
  keywords: ["ClawdBot", "MoltBot", "AI assistant", "Telegram bot", "WhatsApp bot", "Discord bot"],
  authors: [{ name: "Clawd Host" }],
  creator: "Clawd Host",
  publisher: "Clawd Host",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "ClawdHost - Setup Your AI Assistant",
    description: "Set up your personal AI assistant running 24/7. Chat via Telegram, WhatsApp, or Discord.",
    url: "https://app.clawdhost.tech",
    siteName: "Clawd Host",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://clawdhost.tech/clawdhost_landscape_64kb.jpg",
        width: 1200,
        height: 630,
        alt: "Clawd Host - AI Assistant Setup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawdHost - Setup Your AI Assistant",
    description: "Set up your personal AI assistant running 24/7. No terminal required.",
    images: ["https://clawdhost.tech/clawdhost_landscape_64kb.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
