import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);
const ALLOWED_EMAILS = ["kevin@clawdhost.tech"];

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes
  const { userId, sessionClaims } = await auth.protect();

  // Check if user email is allowed
  const email = sessionClaims?.email as string | undefined;
  
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    // Redirect unauthorized users to sign-in with error
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
