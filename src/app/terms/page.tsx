export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
            <p className="text-muted-foreground">
              ClawdBot Hosting provides managed hosting for ClawdBot, an open-source AI assistant. 
              We provision and maintain dedicated server instances running ClawdBot on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Subscription and Billing</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Subscriptions are billed monthly in advance</li>
              <li>Prices are listed in EUR and include all applicable taxes</li>
              <li>You can cancel your subscription at any time from your Stripe customer portal</li>
              <li>Refunds are provided on a case-by-case basis within the first 7 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You agree not to use ClawdBot Hosting for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Any illegal activities</li>
              <li>Spamming or unauthorized bulk messaging</li>
              <li>Harassment or abuse of others</li>
              <li>Activities that violate third-party terms of service (e.g., WhatsApp, Telegram)</li>
              <li>Cryptocurrency mining or other resource-intensive background processes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Service Availability</h2>
            <p className="text-muted-foreground">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. 
              Scheduled maintenance will be communicated in advance when possible. 
              We are not liable for downtime caused by third-party infrastructure providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Keep your access credentials secure</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Use the service in accordance with ClawdBot&apos;s intended purpose</li>
              <li>For macOS plans: comply with Apple&apos;s terms of service for iCloud and iMessage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account if you violate these terms. 
              Upon termination, your server instance and all data will be deleted within 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              ClawdBot Hosting is provided &quot;as is&quot; without warranties of any kind. 
              We are not liable for any damages arising from the use of our service, 
              including data loss, business interruption, or actions taken by ClawdBot on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Open Source</h2>
            <p className="text-muted-foreground">
              ClawdBot is open-source software. Our hosting service is also open-source and 
              available at{" "}
              <a 
                href="https://github.com/KevinLourd/clawdbot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/KevinLourd/clawdbot
              </a>
              . You are free to self-host if you prefer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. 
              Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, contact us at{" "}
              <a href="mailto:support@clawdbot.day" className="text-primary hover:underline">
                support@clawdbot.day
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <a href="/" className="text-primary hover:underline">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
