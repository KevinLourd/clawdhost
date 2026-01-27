import { PricingCard } from "@/components/pricing-card";
import { plans } from "@/lib/plans";
import Image from "next/image";

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
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#E87C7C]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#A8D8EA]/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFB6C1]/10 rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/clawdhost_logo_27kb.jpg" 
              alt="Clawd Host Logo" 
              width={44} 
              height={44}
              className="rounded-lg"
            />
            <span className="font-bold text-xl">Clawd Host</span>
          </div>
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
          <span className="text-sm font-medium">The easiest way to host ClawdBot</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Your <a href="https://clawd.bot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ClawdBot</a> Instance,
          <br />
          <span className="text-primary">Running 24/7</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Skip the VPS setup. We host <a href="https://github.com/clawdbot/clawdbot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ClawdBot</a> for you on dedicated Linux or macOS servers. 
          Pre-configured, always online, ready in hours.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>No setup required</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>24/7 availability</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Ready in 2-3 hours</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 -z-10" />
        <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          All plans include a fully configured ClawdBot instance with Cloudflare Tunnel for secure remote access.
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
              {" "}is an open-source personal AI assistant created by @steipete that runs on your computer. 
              It can manage your emails, calendar, browse the web, control apps, and more — 
              all through WhatsApp, Telegram, or Discord.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">Why use Clawd Host instead of self-hosting?</h3>
            <p className="text-muted-foreground text-sm">
              ClawdBot needs to run 24/7 to be truly useful. With Clawd Host, 
              you get a dedicated machine in the cloud that never sleeps — no need to 
              leave your computer on, configure servers, or manage updates.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">Why choose macOS over Linux?</h3>
            <p className="text-muted-foreground text-sm">
              macOS plans support iCloud Desktop sync (your files are always available) 
              and iMessage integration. If you use Apple devices, the macOS plan gives 
              ClawdBot access to your entire ecosystem.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">How long does setup take?</h3>
            <p className="text-muted-foreground text-sm">
              After payment, we provision your instance and configure ClawdBot. 
              You will receive an email with your instance details within 2-3 hours.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <h3 className="font-semibold mb-2">Is Clawd Host open source?</h3>
            <p className="text-muted-foreground text-sm">
              Yes! This hosting platform is fully open source. You can view the code on{" "}
              <a 
                href="https://github.com/KevinLourd/clawdhost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                our GitHub repository
              </a>
              . We host the original{" "}
              <a 
                href="https://github.com/clawdbot/clawdbot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ClawdBot open-source project
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
            <div className="flex items-center gap-3">
              <Image 
                src="/clawdhost_logo_27kb.jpg" 
                alt="Clawd Host Logo" 
                width={32} 
                height={32}
                className="rounded-md"
              />
              <span className="font-semibold">Clawd Host</span>
            </div>
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
