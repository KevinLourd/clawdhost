/**
 * Email service for Clawd Host worker
 */

import { Resend } from "resend";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

const FROM_EMAIL = "Clawd Host <noreply@clawdhost.tech>";
const SUPPORT_EMAIL = "support@clawdhost.tech";
const BCC_EMAILS = ["kevin@clawdhost.tech", "kevin.lourd@gmail.com"];
const DASHBOARD_URL = "https://app.clawdhost.tech/setup";

interface WelcomeEmailParams {
  to: string;
  customerName?: string;
}

/**
 * Welcome email - Sent on signup
 * Focus on WHY, not the solution. Celebrate the decision.
 */
export async function sendWelcomeEmail({ to, customerName }: WelcomeEmailParams) {
  const greeting = customerName ? `Hi ${customerName}` : "Hi";

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Welcome to ClawdHost",
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
          </div>
          
          <p>${greeting},</p>
          
          <p>Welcome to ClawdHost.</p>
          
          <p>You just took a step toward having an AI assistant that's truly yours — always on, always available, working for you 24/7.</p>
          
          <p>No more browser tabs. No more copy-pasting. Just message your assistant like you'd message a friend, from any app you already use.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${DASHBOARD_URL}" style="display: inline-block; background: #E87C7C; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Continue Setup
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Questions? Reply to this email or reach out at <a href="mailto:${SUPPORT_EMAIL}" style="color: #E87C7C;">${SUPPORT_EMAIL}</a>.
          </p>
          
          <p style="margin-top: 30px;">
            — The ClawdHost Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            <a href="https://clawdhost.tech" style="color: #999;">clawdhost.tech</a>
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send welcome email:", error);
    throw error;
  }

  console.log(`[Email] Welcome email sent to ${to}`);
  return data;
}

interface InstanceReadyEmailParams {
  to: string;
  customerName?: string;
  planName: string;
}

/**
 * Instance ready email - Sent when provisioning completes
 * Celebration, value delivered, clear next step
 */
export async function sendInstanceReadyEmail({ to, customerName, planName }: InstanceReadyEmailParams) {
  const greeting = customerName ? `${customerName}` : "Hey";

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Your AI assistant is live",
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
          </div>
          
          <p>${greeting},</p>
          
          <p style="font-size: 18px; font-weight: 600; color: #E87C7C;">Your ${planName} instance is live.</p>
          
          <p>Your AI assistant is now running 24/7 on its own server. Open Telegram, send a message, and start chatting.</p>
          
          <p>What you can do right now:</p>
          <ul style="padding-left: 20px; color: #555;">
            <li>Ask questions, get answers instantly</li>
            <li>Search the web, summarize articles</li>
            <li>Write, edit, and organize content</li>
            <li>Automate repetitive tasks</li>
          </ul>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${DASHBOARD_URL}" style="display: inline-block; background: #E87C7C; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Need help getting started? Check the <a href="https://docs.clawd.bot" style="color: #E87C7C;">docs</a> or reply to this email.
          </p>
          
          <p style="margin-top: 30px;">
            Enjoy,<br>
            — The ClawdHost Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            <a href="https://clawdhost.tech" style="color: #999;">clawdhost.tech</a>
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send instance ready email:", error);
    throw error;
  }

  console.log(`[Email] Instance ready email sent to ${to}`);
  return data;
}

/**
 * Provisioning error - Only sent to admins
 */
export async function sendProvisioningErrorEmail(
  to: string,
  customerName: string | undefined,
  error: string
) {
  const resend = getResendClient();
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: BCC_EMAILS,
    subject: `[ALERT] Provisioning failed for ${to}`,
    html: `
      <p><strong>Provisioning failed</strong></p>
      <p>Customer: ${to} (${customerName || "no name"})</p>
      <p>Error: ${error}</p>
    `,
  });
}

// Keep old function name for backwards compatibility
export const sendCredentialsEmail = sendInstanceReadyEmail;
