import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Clawd Host <noreply@clawdhost.tech>";
const SUPPORT_EMAIL = "support@clawdhost.tech";
const BCC_EMAILS = ["kevin@clawdhost.tech", "kevin.lourd@gmail.com"];

interface WelcomeEmailParams {
  to: string;
  customerName?: string;
  planName: string;
}

/**
 * Email 1: Welcome - Mission & Value proposition
 * Sent immediately after purchase
 */
export async function sendWelcomeEmail({ to, customerName, planName }: WelcomeEmailParams) {
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";
  
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Welcome to Clawd Host!",
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
            <h1 style="margin: 16px 0 0 0; font-size: 24px; color: #E87C7C;">Welcome to Clawd Host!</h1>
          </div>
          
          <p>${greeting},</p>
          
          <p>Thank you for joining <strong>Clawd Host</strong>!</p>
          
          <div style="background: linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #7c3aed;">Your AI, always on, always yours</h3>
            <p style="margin: 0; color: #4c1d95; font-size: 15px;">
              We believe everyone should have access to AI assistants that work the way they want, 
              where they want. That's why we built Clawd Host — to give you a personal AI that 
              lives in your favorite messaging apps, available 24/7, without the complexity.
            </p>
          </div>
          
          <p>With your <strong>${planName}</strong> plan, you'll be chatting with your AI on WhatsApp, Telegram, Discord, or wherever you prefer — just like texting a friend.</p>
          
          <p>No apps to install. No accounts to manage. Just your AI, always ready.</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #555;">
              <strong>Manage your subscription:</strong><br>
              <a href="https://billing.stripe.com/p/login/4gw9Ev8MO47y2Ry4gg" style="color: #E87C7C;">Access your billing portal</a> to update payment methods, view invoices, or modify your plan.
            </p>
          </div>
          
          <p style="margin-top: 30px;">
            We're excited to have you on board!<br>
            <strong>The Clawd Host Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            <a href="https://clawdhost.tech" style="color: #666;">clawdhost.tech</a> · 
            <a href="mailto:${SUPPORT_EMAIL}" style="color: #666;">Contact support</a>
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

/**
 * Email 2: Instance being created - Progress notification
 * Sent right after welcome email
 */
export async function sendProvisioningStartedEmail({ to, customerName, planName }: WelcomeEmailParams) {
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";
  
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Your ClawdBot instance is being set up",
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
          
          <p>Your <strong>${planName}</strong> instance is now being created!</p>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">⏳</div>
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #92400e;">Setting up your server...</h3>
            <p style="margin: 0; color: #b45309;">Estimated time: 5-10 minutes</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">What's happening:</h3>
            <ol style="margin: 0; padding-left: 20px; color: #555;">
              <li style="margin-bottom: 8px;">Provisioning your dedicated server</li>
              <li style="margin-bottom: 8px;">Installing ClawdBot and dependencies</li>
              <li style="margin-bottom: 8px;">Setting up secure web terminal access</li>
              <li style="margin-bottom: 8px;">Running final checks</li>
            </ol>
          </div>
          
          <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">
              <strong>Next:</strong> You'll receive an email with your terminal access link once everything is ready.
            </p>
          </div>
          
          <p>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #E87C7C;">${SUPPORT_EMAIL}</a>.</p>
          
          <p style="margin-top: 30px;">
            Hang tight!<br>
            The Clawd Host Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666;">
            <a href="https://clawdhost.tech" style="color: #666;">clawdhost.tech</a>
          </p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send provisioning started email:", error);
    throw error;
  }

  return data;
}

interface CredentialsEmailParams {
  to: string;
  customerName?: string;
  serverIp: string;
  rootPassword: string;
  planName: string;
  tunnelUrl?: string;
}

export async function sendCredentialsEmail({
  to,
  customerName,
  serverIp,
  rootPassword,
  planName,
  tunnelUrl,
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
          
          <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #065f46;">Your Server Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Server IP:</td>
                <td style="padding: 8px 0; font-family: monospace; font-weight: bold;">${serverIp}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Username:</td>
                <td style="padding: 8px 0; font-family: monospace; font-weight: bold;">root</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Password:</td>
                <td style="padding: 8px 0; font-family: monospace; font-weight: bold;">${rootPassword}</td>
              </tr>
              ${tunnelUrl ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Tunnel URL:</td>
                <td style="padding: 8px 0;"><a href="${tunnelUrl}" style="color: #E87C7C;">${tunnelUrl}</a></td>
              </tr>
              ` : ""}
            </table>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">How to connect</h3>
            <p style="margin: 0 0 12px 0;">Open your terminal and run:</p>
            <div style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px;">
              ssh root@${serverIp}
            </div>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #666;">
              When prompted, enter the password above.
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Security tip:</strong> We recommend changing your root password and setting up SSH keys after your first login.
            </p>
          </div>
          
          <h3 style="margin: 24px 0 12px 0; font-size: 16px;">Next steps</h3>
          <ol style="padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Connect to your server via SSH</li>
            <li style="margin-bottom: 8px;">Switch to the clawdbot user: <code style="background: #f1f1f1; padding: 2px 6px; border-radius: 4px;">su - clawdbot</code></li>
            <li style="margin-bottom: 8px;">Run: <code style="background: #f1f1f1; padding: 2px 6px; border-radius: 4px;">clawdbot onboard</code></li>
            <li style="margin-bottom: 8px;">Follow the setup wizard to configure your ClawdBot</li>
          </ol>
          
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
    console.error("Failed to send credentials email:", error);
    throw error;
  }

  return data;
}
