"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function DataLayerTracker() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId && typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "purchase",
        transactionId: sessionId,
      });
    }
  }, [sessionId]);

  return null;
}

export default function SuccessPage() {
  return (
    <>
      <Suspense fallback={null}>
        <DataLayerTracker />
      </Suspense>
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Thank you for choosing Clawd Host</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Provisioning your instance</p>
                <p className="text-sm text-muted-foreground">
                  We are setting up your dedicated ClawdBot server right now.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Installing ClawdBot</p>
                <p className="text-sm text-muted-foreground">
                  ClawdBot and all dependencies will be pre-configured for you.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Email with access details</p>
                <p className="text-sm text-muted-foreground">
                  You will receive an email with your instance URL and credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Estimated time: 2-3 hours</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Check your email inbox (and spam folder) for updates.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Questions? Contact us at{" "}
              <a 
                href="mailto:support@clawdhost.tech" 
                className="text-primary hover:underline"
              >
                support@clawdhost.tech
              </a>
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Image 
                src="/clawdhost_logo_27kb.jpg" 
                alt="Clawd Host" 
                width={20} 
                height={20}
                className="rounded"
              />
              Back to Clawd Host
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
