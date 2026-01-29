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
    id: "free-trial",
    name: "Free Trial",
    description: "Try ClawdBot for 7 days. No credit card required.",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "Full ClawdBot access",
      "Telegram channel",
      "Web automation",
      "Internet search",
      "7 days free",
      "No commitment",
    ],
    badge: "Start Here",
  },
  {
    id: "linux",
    name: "Essential",
    description: "All ClawdBot features. Reliable, fast, affordable.",
    price: 9,
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
    popular: true,
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
    badge: "Apple Ecosystem",
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
