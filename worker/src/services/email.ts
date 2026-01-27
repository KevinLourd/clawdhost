/**
 * Email service for Clawd Host worker
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Clawd Host <noreply@clawdhost.tech>";
const SUPPORT_EMAIL = "support@clawdhost.tech";
const BCC_EMAILS = ["kevin@clawdhost.tech", "kevin.lourd@gmail.com"];

interface CredentialsEmailParams {
  to: string;
  customerName?: string;
  terminalUrl: string;
  planName: string;
}

export async function sendCredentialsEmail({
  to,
  customerName,
  terminalUrl,
  planName,
}: CredentialsEmailParams) {
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Your ClawdBot instance is ready!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://clawdhost.tech/clawdhost_logo_27kb.jpg" alt="Clawd Host" style="width: 80px; height: 80px; border-radius: 12px;">
            <h1 style="margin: 16px 0 0 0; font-size: 24px; color: #E87C7C;">Clawd Host</h1>
          </div>
          
          <p>${greeting},</p>
          
          <p>Great news! Your <strong>${planName}</strong> ClawdBot instance is now ready.</p>
          
          <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #065f46;">Access Your Terminal</h3>
            <p style="margin: 0 0 16px 0; color: #047857;">Click the button below to open your ClawdBot terminal in your browser:</p>
            <a href="${terminalUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Open Terminal
            </a>
            <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">
              Or copy this link: <a href="${terminalUrl}" style="color: #059669;">${terminalUrl}</a>
            </p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">Getting started</h3>
            <p style="margin: 0 0 12px 0;">Once in the terminal, run:</p>
            <div style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px;">
              clawdbot onboard
            </div>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #666;">
              This wizard will guide you through connecting your messaging apps.
            </p>
          </div>
          
          <h3 style="margin: 24px 0 12px 0; font-size: 16px;">The onboarding wizard will help you:</h3>
          <ol style="padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Connect your AI provider (Anthropic/OpenAI)</li>
            <li style="margin-bottom: 8px;">Link WhatsApp, Telegram, Discord, or other channels</li>
            <li style="margin-bottom: 8px;">Configure your assistant's personality</li>
            <li style="margin-bottom: 8px;">Start chatting with your ClawdBot!</li>
          </ol>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Tip:</strong> Bookmark your terminal link - you can access it anytime to manage your ClawdBot.
            </p>
          </div>
          
          <p style="margin-top: 24px;">
            Need help? Check out the <a href="https://docs.clawd.bot" style="color: #E87C7C;">ClawdBot documentation</a> 
            or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #E87C7C;">${SUPPORT_EMAIL}</a>.
          </p>
          
          <p style="margin-top: 30px;">
            Enjoy your ClawdBot!<br>
            The Clawd Host Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666;">
            You received this email because you subscribed to Clawd Host.<br>
            <a href="https://clawdhost.tech" style="color: #666;">clawdhost.tech</a>
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send credentials email:", error);
    throw error;
  }

  console.log(`[Email] Credentials email sent to ${to}`);
  return data;
}

export async function sendProvisioningErrorEmail(
  to: string,
  customerName: string | undefined,
  error: string
) {
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Issue with your ClawdBot instance",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>${greeting},</p>
          
          <p>We encountered an issue while setting up your ClawdBot instance. Our team has been notified and will resolve this shortly.</p>
          
          <p>We'll send you another email once your instance is ready. If you have any questions, please contact us at 
            <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
          </p>
          
          <p>Sorry for the inconvenience.</p>
          
          <p>The Clawd Host Team</p>
        </body>
      </html>
    `,
  });

  // Also notify admin
  await resend.emails.send({
    from: FROM_EMAIL,
    to: BCC_EMAILS,
    subject: `[ALERT] Provisioning failed for ${to}`,
    html: `
      <p>Provisioning failed for customer: ${to}</p>
      <p>Error: ${error}</p>
    `,
  });
}
