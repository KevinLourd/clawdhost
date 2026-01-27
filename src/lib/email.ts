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

export async function sendWelcomeEmail({ to, customerName, planName }: WelcomeEmailParams) {
  const greeting = customerName ? `Hi ${customerName}` : "Hi there";
  
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAILS,
    subject: "Welcome to Clawd Host - Your ClawdBot instance is being set up",
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
          
          <p>Thank you for subscribing to <strong>Clawd Host - ${planName}</strong>!</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px;">What happens next?</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">We're provisioning your dedicated ClawdBot instance</li>
              <li style="margin-bottom: 8px;">ClawdBot and all dependencies are being installed</li>
              <li style="margin-bottom: 8px;">You'll receive another email with your access credentials</li>
            </ol>
          </div>
          
          <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">
              <strong>Estimated time:</strong> 2-3 hours
            </p>
          </div>
          
          <p>In the meantime, you can learn more about ClawdBot:</p>
          <ul style="padding-left: 20px;">
            <li><a href="https://docs.clawd.bot" style="color: #E87C7C;">ClawdBot Documentation</a></li>
            <li><a href="https://clawd.bot" style="color: #E87C7C;">ClawdBot Official Site</a></li>
          </ul>
          
          <p>If you have any questions, reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #E87C7C;">${SUPPORT_EMAIL}</a>.</p>
          
          <p style="margin-top: 30px;">
            Cheers,<br>
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
    console.error("Failed to send welcome email:", error);
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
