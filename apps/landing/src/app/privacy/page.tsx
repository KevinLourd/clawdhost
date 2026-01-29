import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Image 
            src="/clawdhost_logo_27kb.jpg" 
            alt="ClawdHost Logo" 
            width={40} 
            height={40}
            className="rounded-lg"
          />
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: January 29, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              ClawdHost (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. 
              This policy explains how we collect, use, and protect your information when you use 
              our MoltBot hosting service. By using ClawdHost, you consent to the practices described 
              in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">
              We collect the following types of information:
            </p>
            <p className="text-muted-foreground font-medium mt-4">Account Information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Email address (required for account creation)</li>
              <li>Name (if provided)</li>
              <li>Authentication data via Clerk (our identity provider)</li>
            </ul>
            <p className="text-muted-foreground font-medium mt-4">Payment Information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Billing information processed by Stripe (we do not store credit card numbers)</li>
              <li>Transaction history and subscription status</li>
            </ul>
            <p className="text-muted-foreground font-medium mt-4">Technical Information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Server provisioning data (instance IDs, IP addresses, status)</li>
              <li>Service usage metrics for operational purposes</li>
              <li>Error logs and diagnostic information</li>
              <li>Analytics data via PostHog (pageviews, session recordings, performance metrics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provision and maintain your MoltBot server instance</li>
              <li>Process payments and manage your subscription</li>
              <li>Send service-related communications (downtime, updates, billing)</li>
              <li>Provide customer support</li>
              <li>Improve our service through analytics</li>
              <li>Prevent fraud and enforce our Terms of Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Your MoltBot Instance Data</h2>
            <p className="text-muted-foreground mb-3">
              <strong>Important:</strong> Your MoltBot instance runs on dedicated infrastructure 
              provisioned specifically for you. Regarding data on your instance:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>We do not routinely access, monitor, or store the contents of your MoltBot activities</li>
              <li>Your API keys, messages, files, and MoltBot outputs remain on your instance</li>
              <li>We may access your instance for technical support only with your explicit consent</li>
              <li>We may access logs or data if required by law or to investigate violations of our Terms</li>
              <li><strong>You are solely responsible for any data processed by MoltBot</strong>, including 
                personal data of third parties that MoltBot may access or process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground mb-3">
              We use the following third-party services that may process your data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Stripe</strong> (USA) - Payment processing</li>
              <li><strong>Clerk</strong> (USA) - Authentication and identity management</li>
              <li><strong>Hetzner</strong> (Singapore) - Linux server infrastructure</li>
              <li><strong>Scaleway</strong> (France) - macOS server infrastructure</li>
              <li><strong>Cloudflare</strong> (USA) - Secure tunnel access and DNS</li>
              <li><strong>Resend</strong> (USA) - Email delivery</li>
              <li><strong>PostHog</strong> (EU) - Product analytics and session recording</li>
              <li><strong>Neon</strong> (USA) - Database hosting</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Each of these services has their own privacy policies. We recommend reviewing them 
              if you have concerns about how your data is handled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information: retained while your subscription is active</li>
              <li>Server instance data: permanently deleted within 7 days of subscription cancellation 
                or account termination</li>
              <li>Payment records: retained for 7 years as required by French tax law</li>
              <li>Support communications: retained for 2 years</li>
              <li>Analytics data: retained for 2 years</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights (GDPR)</h2>
            <p className="text-muted-foreground mb-3">
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:support@clawdhost.tech" className="text-primary hover:underline">
                support@clawdhost.tech
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Data Transfers</h2>
            <p className="text-muted-foreground">
              Some of our service providers are located outside the European Economic Area (EEA). 
              When we transfer data outside the EEA, we ensure appropriate safeguards are in place, 
              including Standard Contractual Clauses approved by the European Commission or reliance 
              on adequacy decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data, including 
              encryption in transit (TLS), secure server infrastructure, and access controls. 
              However, no method of transmission or storage is 100% secure. You are responsible 
              for keeping your account credentials and API keys secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Cookies and Analytics</h2>
            <p className="text-muted-foreground mb-3">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Authentication and session management</li>
              <li>Analytics and service improvement (PostHog)</li>
              <li>Conversion tracking (Google Tag Manager)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              PostHog session recordings may capture your interactions with our website. 
              Sensitive inputs are masked automatically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              ClawdHost is not intended for use by children under 18. We do not knowingly collect 
              personal information from children. If you believe we have collected information from 
              a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of material 
              changes via email or through the service. Continued use of ClawdHost after changes 
              take effect constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Data Controller</h2>
            <p className="text-muted-foreground">
              ClawdHost is the data controller for your personal information. 
              For privacy-related inquiries or to exercise your rights, contact:
            </p>
            <p className="text-muted-foreground mt-3">
              Email:{" "}
              <a href="mailto:support@clawdhost.tech" className="text-primary hover:underline">
                support@clawdhost.tech
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Supervisory Authority</h2>
            <p className="text-muted-foreground">
              If you are not satisfied with our response to a privacy concern, you have the right 
              to lodge a complaint with your local data protection authority. For users in France, 
              this is the CNIL (Commission Nationale de l&apos;Informatique et des Libertés).
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <a href="/" className="text-primary hover:underline">
            ← Back to ClawdHost
          </a>
        </div>
      </div>
    </div>
  );
}
