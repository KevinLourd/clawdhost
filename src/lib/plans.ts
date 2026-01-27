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
    name: "Essentiel",
    description: "Toutes les fonctionnalités ClawdBot. Fiable, rapide, abordable.",
    price: 29,
    currency: "USD",
    interval: "month",
    features: [
      "ClawdBot prêt à l'emploi",
      "WhatsApp, Telegram, Discord",
      "Automatisation web",
      "Recherche internet",
      "Gestion d'emails",
      "Accès terminal web 24/7",
    ],
    badge: "Populaire",
  },
  {
    id: "macos-m1",
    name: "Apple",
    description: "L'écosystème Apple en plus. iMessage et accès à vos fichiers iCloud.",
    price: 149,
    currency: "USD",
    interval: "month",
    features: [
      "Tout du plan Essentiel",
      "iMessage intégré",
      "Accès à vos fichiers iCloud",
      "Contrôle d'apps macOS",
      "Accès bureau complet",
      "Support prioritaire",
    ],
    popular: true,
  },
  {
    id: "macos-m4",
    name: "Pro",
    description: "Machine ultra-puissante. Idéal pour le vibe coding intensif.",
    price: 249,
    currency: "USD",
    interval: "month",
    features: [
      "Tout du plan Apple",
      "Puce M4 dernière génération",
      "2x plus de puissance",
      "Parfait pour le coding IA",
      "Multi-tâches intensif",
      "Support prioritaire",
    ],
    badge: "Ultra-puissant",
  },
];
