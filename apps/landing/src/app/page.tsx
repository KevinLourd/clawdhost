import { PricingCard } from "@/components/pricing-card";
import { LogoDownload } from "@/components/logo-download";
import { plans } from "@/lib/plans";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient matching logo colors */}
      <div 
        className="absolute inset-0 -z-20"
        style={{
          background: 'linear-gradient(135deg, rgba(253, 230, 230, 0.4) 0%, rgba(230, 240, 255, 0.4) 50%, rgba(230, 250, 245, 0.3) 100%)',
        }}
      />
      {/* Subtle dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #E87C7C 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          zIndex: -15,
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#E87C7C]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#A8D8EA]/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFB6C1]/10 rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <LogoDownload size="md" />
          <nav className="flex items-center gap-6">
            <a 
              href="https://clawd.bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              What is ClawdBot?
            </a>
            <a 
              href="https://github.com/KevinLourd/clawdhost" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <span className="text-lg">🦞</span>
          <span className="text-sm font-medium">Managed ClawdBot Hosting</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Your ClawdBot,
          <br />
          <span className="text-primary">ready in 5 minutes</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          No AWS account needed. No terminal required.
          <br className="hidden md:block" />
          We host <a href="https://github.com/clawdbot/clawdbot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ClawdBot</a> for you — manage everything from your browser.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Instant setup</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>100% web-based</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Available 24/7</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 -z-10" />
        <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Choose your plan</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          All plans include ClawdBot ready to use, accessible from your browser.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">What is ClawdBot?</h3>
            <p className="text-muted-foreground text-sm">
              <a 
                href="https://github.com/clawdbot/clawdbot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ClawdBot
              </a>
              {" "}is an open-source personal AI assistant. It can manage your emails, 
              browse the web, automate tasks — all via WhatsApp, Telegram, or Discord.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">Why use Clawd Host?</h3>
            <p className="text-muted-foreground text-sm">
              To be truly useful, ClawdBot needs to run 24/7. With Clawd Host, 
              your assistant is always available — no need to keep your computer 
              running or manage anything yourself.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">Why choose an Apple plan?</h3>
            <p className="text-muted-foreground text-sm">
              Apple plans give you access to iMessage and your iCloud files. 
              If you use Apple devices, your ClawdBot will have access to 
              your entire ecosystem.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">How does it work?</h3>
            <p className="text-muted-foreground text-sm">
              After payment, we set everything up automatically. In a few minutes, 
              you receive an email with a link to access your ClawdBot.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">Is it open source?</h3>
            <p className="text-muted-foreground text-sm">
              Yes! Our platform is 100% open source on{" "}
              <a 
                href="https://github.com/KevinLourd/clawdhost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub
              </a>
              . We host the original{" "}
              <a 
                href="https://github.com/clawdbot/clawdbot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ClawdBot project
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <LogoDownload size="sm" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a 
                href="https://github.com/KevinLourd/clawdhost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://github.com/clawdbot/clawdbot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                ClawdBot OSS
              </a>
              <a 
                href="mailto:support@clawdhost.tech" 
                className="hover:text-foreground transition-colors"
              >
                Support
              </a>
              <a 
                href="/privacy" 
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a 
                href="/terms" 
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              <p>© 2026 Clawd Host</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
