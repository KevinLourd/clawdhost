import Image from "next/image";

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: January 29, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
            <p className="text-muted-foreground">
              ClawdHost (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides managed hosting infrastructure for MoltBot, 
              a third-party open-source AI assistant software. We provision and maintain dedicated server 
              instances on which MoltBot runs. ClawdHost is a hosting service only — we do not develop, 
              control, or maintain the MoltBot software itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="text-muted-foreground mb-3">
              To use ClawdHost, you must:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into a binding contract</li>
              <li>Not be prohibited from using the service under applicable laws</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              By using ClawdHost, you represent and warrant that you meet these requirements. 
              If you are using the service on behalf of an organization, you represent that you 
              have the authority to bind that organization to these terms. We reserve the right 
              to terminate accounts that do not meet these eligibility requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Assumption of Risk</h2>
            <p className="text-muted-foreground mb-3">
              <strong>YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:</strong>
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>MoltBot is an autonomous AI agent capable of executing commands, accessing files, 
                browsing the internet, and sending messages on your behalf</li>
              <li>MoltBot&apos;s actions are inherently unpredictable and may result in unintended consequences</li>
              <li>You are solely responsible for all actions taken by MoltBot on your instance</li>
              <li>You assume all risks associated with using MoltBot, including but not limited to 
                data loss, security breaches, financial losses, and violations of third-party terms of service</li>
              <li>ClawdHost has no control over MoltBot&apos;s behavior, outputs, or decisions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. WE DO NOT WARRANT 
              THAT (A) THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE; (B) MOLTBOT WILL PERFORM 
              AS EXPECTED OR PRODUCE ACCURATE RESULTS; (C) ANY DATA STORED ON YOUR INSTANCE WILL BE PRESERVED; 
              OR (D) THE SERVICE WILL MEET YOUR REQUIREMENTS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CLAWDHOST, ITS OFFICERS, 
              DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Damages arising from MoltBot&apos;s actions, outputs, errors, or omissions</li>
              <li>Damages arising from unauthorized access to your instance</li>
              <li>Damages arising from violations of third-party terms of service (including but not 
                limited to WhatsApp, Telegram, Apple, Anthropic, or any other service)</li>
              <li>Damages arising from AI-generated content, messages, or decisions</li>
              <li>Damages arising from service interruptions or downtime</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              IN ANY CASE, OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US 
              IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify, defend, and hold harmless ClawdHost and its officers, directors, 
              employees, agents, and affiliates from and against any and all claims, damages, losses, 
              liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from or 
              related to: (a) your use of the service; (b) any actions taken by MoltBot on your behalf; 
              (c) your violation of these terms; (d) your violation of any third-party rights or terms 
              of service; (e) any content, data, or messages sent through your MoltBot instance; or 
              (f) any claims by third parties affected by your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
            <p className="text-muted-foreground mb-3">
              Your use of MoltBot may involve integration with third-party services including but not 
              limited to WhatsApp, Telegram, iMessage, iCloud, Anthropic Claude, and various APIs. 
              You acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You are solely responsible for compliance with all third-party terms of service</li>
              <li>ClawdHost is not responsible for any account suspensions, bans, or legal actions 
                resulting from your use of third-party services</li>
              <li>We make no guarantees regarding the availability or compatibility of third-party integrations</li>
              <li>For macOS plans: you must comply with Apple&apos;s terms of service for iCloud, iMessage, 
                and all Apple services, and you are responsible for any violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You agree not to use ClawdHost for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Any illegal activities or activities that violate applicable laws</li>
              <li>Spamming, phishing, or unauthorized bulk messaging</li>
              <li>Harassment, abuse, threats, or harmful activities targeting others</li>
              <li>Activities that violate third-party terms of service</li>
              <li>Cryptocurrency mining or other unauthorized resource-intensive processes</li>
              <li>Attempting to circumvent security measures or access other users&apos; instances</li>
              <li>Any activity that could harm ClawdHost&apos;s infrastructure, reputation, or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Subscription and Billing</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Subscriptions are billed monthly in advance</li>
              <li>Prices are listed in USD</li>
              <li>You can cancel your subscription at any time from your Stripe customer portal</li>
              <li>Refunds are provided on a case-by-case basis within the first 7 days only</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Service Availability</h2>
            <p className="text-muted-foreground">
              We target 99.9% uptime but do not guarantee uninterrupted service. We are not liable 
              for downtime caused by: (a) scheduled or emergency maintenance; (b) third-party 
              infrastructure providers (Hetzner, Scaleway, Cloudflare); (c) force majeure events; 
              (d) your actions or configuration; or (e) MoltBot software issues.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Your Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Keep your access credentials and API keys secure</li>
              <li>Configure MoltBot&apos;s permissions and capabilities responsibly</li>
              <li>Monitor MoltBot&apos;s activities and intervene if necessary</li>
              <li>Maintain backups of any important data</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Report any security issues or vulnerabilities to us promptly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account immediately and without notice 
              if you violate these terms, engage in abusive behavior, or pose a risk to our infrastructure 
              or other users. Upon termination, your server instance and all data will be permanently 
              deleted within 7 days. No refunds will be provided for terminations due to violations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Open Source</h2>
            <p className="text-muted-foreground">
              MoltBot is third-party open-source software. We are not the developers of MoltBot and 
              make no representations regarding its functionality, security, or fitness for any purpose. 
              You are free to self-host MoltBot on your own infrastructure if you prefer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Governing Law and Disputes</h2>
            <p className="text-muted-foreground">
              These terms shall be governed by and construed in accordance with the laws of France, 
              without regard to its conflict of law provisions. Any disputes arising from these terms 
              or your use of the service shall be resolved exclusively in the courts of Paris, France. 
              You waive any objections to jurisdiction or venue in such courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these terms is found to be unenforceable or invalid, that provision 
              shall be limited or eliminated to the minimum extent necessary, and the remaining provisions 
              shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Entire Agreement</h2>
            <p className="text-muted-foreground">
              These terms, together with our Privacy Policy, constitute the entire agreement between 
              you and ClawdHost regarding the service and supersede all prior agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">17. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. We will notify you of material changes via 
              email or through the service. Continued use of the service after changes take effect 
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">18. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, contact us at{" "}
              <a href="mailto:support@clawdhost.tech" className="text-primary hover:underline">
                support@clawdhost.tech
              </a>
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
