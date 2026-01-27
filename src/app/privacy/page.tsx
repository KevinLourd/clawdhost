export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              When you subscribe to ClawdBot Hosting, we collect:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Email address (required for account creation and communication)</li>
              <li>Name (if provided during checkout)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Server usage data for service operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Provision and maintain your ClawdBot instance</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send important service updates and notifications</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage</h2>
            <p className="text-muted-foreground">
              Your ClawdBot instance runs on dedicated infrastructure (Linux VPS or macOS). 
              Any data you store or process through ClawdBot remains on your dedicated instance. 
              We do not access, monitor, or store the contents of your ClawdBot activities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Stripe</strong> - Payment processing</li>
              <li><strong>Hetzner</strong> - Linux server infrastructure</li>
              <li><strong>Scaleway</strong> - macOS server infrastructure</li>
              <li><strong>Cloudflare</strong> - Secure tunnel access</li>
              <li><strong>Resend</strong> - Email delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your account information for as long as your subscription is active. 
              Upon cancellation, your server instance and all data on it are deleted within 7 days. 
              Payment records are retained as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Cancel your subscription at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related questions, contact us at{" "}
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
