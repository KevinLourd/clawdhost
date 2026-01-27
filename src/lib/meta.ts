import crypto from "crypto";

const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

function hashData(data: string): string {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

interface PurchaseEventParams {
  email: string;
  eventId: string;
  value: number;
  currency: string;
  eventSourceUrl?: string;
}

export async function sendPurchaseEvent({
  email,
  eventId,
  value,
  currency,
  eventSourceUrl = "https://clawdhost.tech/success",
}: PurchaseEventParams) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("Meta Conversions API not configured (missing PIXEL_ID or ACCESS_TOKEN)");
    return null;
  }

  const eventTime = Math.floor(Date.now() / 1000);

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: {
          em: [hashData(email)],
        },
        custom_data: {
          currency,
          value,
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta Conversions API error:", result);
      return null;
    }

    console.log("Meta Conversions API success:", result);
    return result;
  } catch (error) {
    console.error("Meta Conversions API request failed:", error);
    return null;
  }
}
