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
    name: "Linux",
    description: "ClawdBot on a fast Linux VPS. Perfect for automation tasks.",
    price: 29,
    currency: "USD",
    interval: "month",
    features: [
      "8 vCPU, 16GB RAM",
      "160GB NVMe SSD",
      "ClawdBot pre-installed",
      "Cloudflare Tunnel included",
      "WhatsApp, Telegram, Discord",
      "Browser automation",
      "24/7 uptime",
    ],
    badge: "Best Value",
  },
  {
    id: "macos-m1",
    name: "macOS M1",
    description: "Full macOS experience with iCloud and iMessage support.",
    price: 149,
    currency: "USD",
    interval: "month",
    features: [
      "Apple M1 chip",
      "8GB RAM, 256GB SSD",
      "iCloud Desktop sync",
      "iMessage integration",
      "ClawdBot pre-installed",
      "Cloudflare Tunnel included",
      "Full macOS access via VNC",
      "24/7 uptime",
    ],
    popular: true,
  },
  {
    id: "macos-m4",
    name: "macOS M4",
    description: "Latest Apple Silicon for demanding workloads.",
    price: 249,
    currency: "USD",
    interval: "month",
    features: [
      "Apple M4 chip (10-core)",
      "16GB RAM, 256GB SSD",
      "iCloud Desktop sync",
      "iMessage integration",
      "ClawdBot pre-installed",
      "Cloudflare Tunnel included",
      "Full macOS access via VNC",
      "Priority support",
      "24/7 uptime",
    ],
    badge: "Most Powerful",
  },
];
