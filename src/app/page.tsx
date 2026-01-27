import { PricingCard } from "@/components/pricing-card";
import { plans } from "@/lib/plans";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦞</span>
            <span className="font-bold text-xl">ClawdBot Day</span>
          </div>
          <nav className="flex items-center gap-4">
            <a 
              href="https://clawd.bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              What is ClawdBot?
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Your AI Assistant,
          <br />
          <span className="text-primary">Running 24/7</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Get your own ClawdBot instance hosted in the cloud. 
          No setup required — we handle everything.
          Talk to it via WhatsApp, Telegram, or Discord.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Pre-configured</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Always on</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Ready in hours</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          All plans include a fully configured ClawdBot instance with Cloudflare Tunnel for secure remote access.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">What is ClawdBot?</h3>
            <p className="text-muted-foreground text-sm">
              ClawdBot is an open-source personal AI assistant that runs on your computer. 
              It can manage your emails, calendar, browse the web, control apps, and more — 
              all through WhatsApp, Telegram, or Discord.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Why do I need a hosted version?</h3>
            <p className="text-muted-foreground text-sm">
              ClawdBot needs to run 24/7 to be truly useful. With our hosted version, 
              you get a dedicated machine in the cloud that never sleeps — no need to 
              leave your computer on or manage servers.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Why choose macOS over Linux?</h3>
            <p className="text-muted-foreground text-sm">
              macOS plans support iCloud Desktop sync (your files are always available) 
              and iMessage integration. If you use Apple devices, the macOS plan gives 
              ClawdBot access to your entire ecosystem.
            </p>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">How long does setup take?</h3>
            <p className="text-muted-foreground text-sm">
              After payment, we provision your instance and configure ClawdBot. 
              You will receive an email with your instance details within 2-3 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🦞</span>
              <span className="font-semibold">ClawdBot Day</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <a 
                href="https://clawd.bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                ClawdBot
              </a>
              {" "}by @steipete
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
