import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawdHost Setup",
  description: "Set up your MoltBot instance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
