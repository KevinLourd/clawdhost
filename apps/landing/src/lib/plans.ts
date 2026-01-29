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
}

export const plans: Plan[] = [
  {
    id: "linux",
    name: "Essential",
    description: "All ClawdBot features. Reliable, fast, affordable.",
    price: 29,
    currency: "USD",
    interval: "month",
    features: [
      "ClawdBot ready to use",
      "WhatsApp, Telegram, Discord",
      "Web automation",
      "Internet search",
      "Email management",
      "24/7 web terminal access",
    ],
    badge: "Popular",
  },
  {
    id: "macos-m1",
    name: "Apple",
    description: "Apple ecosystem included. iMessage and iCloud file access.",
    price: 149,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Essential",
      "Built-in iMessage",
      "Access to your iCloud files",
      "Control macOS apps",
      "Full desktop access",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "macos-m4",
    name: "Pro",
    description: "Ultra-powerful machine. Perfect for intensive AI coding.",
    price: 249,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Apple",
      "Latest M4 chip",
      "2x more power",
      "Perfect for AI coding",
      "Intensive multitasking",
      "Priority support",
    ],
    badge: "Most Powerful",
  },
];
