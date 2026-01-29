"use client";

import { SignIn, useAuth, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // If user is signed in but got unauthorized error, show message
  if (isSignedIn && error === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-500 mt-2 mb-6">
              Your account is not authorized to access the admin dashboard.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Only kevin@clawdhost.tech can access this area.
            </p>
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ClawdHost Admin</h1>
          <p className="text-gray-500 mt-2">Sign in to access the admin dashboard</p>
        </div>
        <SignIn
          forceRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
        />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
