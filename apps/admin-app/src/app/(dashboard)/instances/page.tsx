import Link from "next/link";
import { getAllInstances } from "@/lib/db";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  provisioning: "bg-blue-100 text-blue-800",
  configuring: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  terminated: "bg-gray-100 text-gray-800",
};

export default async function InstancesPage() {
  const instances = await getAllInstances();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Instances</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Server IP</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {instances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No instances yet
                </td>
              </tr>
            ) : (
              instances.map((instance) => (
                <tr key={instance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                    {instance.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[instance.status] || "bg-gray-100 text-gray-800"}`}>
                      {instance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {instance.plan_id}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {instance.server_ip || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(instance.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/users/${instance.user_id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      User
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
