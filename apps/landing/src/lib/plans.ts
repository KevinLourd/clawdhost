export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month";
  features: string[];
  badge?: string;
  popular?: boolean;
  comingSoon?: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Your personal MoltBot, always on. Use your own AI provider.",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "1 MoltBot running 24/7",
      "3 messaging apps (WhatsApp, Telegram...)",
      "10 automations (email, calendar...)",
      "10 triggers (reminders, alerts...)",
      "Bring your own AI key",
      "Free forever",
    ],
    badge: "Start Here",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For power users. No limits, scale as you need.",
    price: 20,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited MoltBots",
      "Unlimited messaging apps",
      "Unlimited automations",
      "Unlimited triggers",
      "Bring your own AI key",
      "Priority support",
    ],
    badge: "Popular",
    popular: true,
    comingSoon: true,
  },
  {
    id: "apple",
    name: "Apple",
    description: "Dedicated Apple machine. iMessage, iCloud, and macOS apps.",
    price: 149,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Pro",
      "iMessage integration",
      "Access your iCloud files",
      "Control macOS apps",
      "Full desktop access",
      "Priority support",
    ],
    badge: "Apple Ecosystem",
    comingSoon: true,
  },
];
