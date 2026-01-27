import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "ClawdBot Hosting <noreply@clawdbot.day>";
const SUPPORT_EMAIL = "support@clawdbot.day";
const BCC_EMAILS = ["kevin@clawdbot.day", "kevin.lourd@gmail.com"];

interface WelcomeEmailParams {
  to: string;
  customerName?: string;
  planName: string;
}

export async function sendWelcomeEmail({ to, customerName, planName }: WelcomeEmailParams) {
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";
  
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Welcome to ClawdBot Hosting - Your instance is being set up",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">🦞</span>
            <h1 style="margin: 10px 0 0 0; font-size: 24px;">ClawdBot Hosting</h1>
          </div>
          
          <p>${greeting},</p>
          
          <p>Thank you for subscribing to <strong>ClawdBot Hosting - ${planName}</strong>!</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">What happens next?</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">We're provisioning your dedicated ClawdBot instance</li>
              <li style="margin-bottom: 8px;">ClawdBot and all dependencies are being installed</li>
              <li style="margin-bottom: 8px;">You'll receive another email with your access credentials</li>
            </ol>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px;">
              <strong>⏱️ Estimated time:</strong> 2-3 hours
            </p>
          </div>
          
          <p>In the meantime, you can learn more about ClawdBot:</p>
          <ul style="padding-left: 20px;">
            <li><a href="https://docs.clawd.bot" style="color: #0066cc;">ClawdBot Documentation</a></li>
            <li><a href="https://clawd.bot" style="color: #0066cc;">ClawdBot Official Site</a></li>
          </ul>
          
          <p>If you have any questions, reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #0066cc;">${SUPPORT_EMAIL}</a>.</p>
          
          <p style="margin-top: 30px;">
            Cheers,<br>
            The ClawdBot Hosting Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666;">
            You received this email because you subscribed to ClawdBot Hosting.<br>
            <a href="https://clawdbot.day" style="color: #666;">clawdbot.day</a>
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }

  return data;
}
