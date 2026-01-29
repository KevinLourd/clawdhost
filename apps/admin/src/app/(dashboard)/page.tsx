import { getStats } from "@/lib/db";
import { Users, Server, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "blue" },
    { label: "Total Instances", value: stats.instances, icon: Server, color: "purple" },
    { label: "Ready", value: stats.ready, icon: CheckCircle, color: "green" },
    { label: "Errors", value: stats.error, icon: XCircle, color: "red" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-100`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
