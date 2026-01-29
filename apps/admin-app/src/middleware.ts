import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/unauthorized(.*)"]);
const ALLOWED_EMAILS = ["kevin@clawdhost.tech"];

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Get auth state without forcing redirect
  const { userId, sessionClaims } = await auth();

  // If not signed in, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user email is allowed
  const email = sessionClaims?.email as string | undefined;
  
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    // Sign out and show unauthorized message
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}, {
  // Required for subdomain auth security
  authorizedParties: [
    "https://admin-app.clawdhost.tech",
    "https://app.clawdhost.tech",
    "https://clawdhost.tech",
  ],
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
