import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <img 
              src="https://clawdhost.tech/clawdhost_logo_27kb.jpg" 
              alt="ClawdHost" 
              className="w-16 h-16 rounded-xl shadow-lg"
            />
            <span className="text-3xl font-bold text-foreground">ClawdHost</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Your AI, always on
            </h1>
            <p className="text-lg text-muted-foreground">
              Personal AI assistant running 24/7 on your own server. 
              Chat via Telegram, WhatsApp, or Discord.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>No terminal required</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Ready in 3 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b">
          <Link href="https://clawdhost.tech" className="flex items-center gap-2">
            <img 
              src="https://clawdhost.tech/clawdhost_logo_27kb.jpg" 
              alt="ClawdHost" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-semibold">ClawdHost</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="text-muted-foreground">
                Sign in to continue to your dashboard
              </p>
            </div>
            
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 p-0 w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border border-border hover:bg-accent",
                  formButtonPrimary: "bg-primary hover:bg-primary/90",
                  footerActionLink: "text-primary hover:text-primary/80",
                }
              }}
            />

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="p-4 text-center text-sm text-muted-foreground border-t">
          <Link href="https://clawdhost.tech" className="hover:text-foreground">
            clawdhost.tech
          </Link>
          {" · "}
          <Link href="https://clawdhost.tech/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          {" · "}
          <Link href="https://clawdhost.tech/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
