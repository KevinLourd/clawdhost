import { notFound } from "next/navigation";
import { getUserWithInstances } from "@/lib/db";
import { getClerkUser } from "@/lib/clerk";
import { DeleteUserButton } from "./delete-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  provisioning: "bg-blue-100 text-blue-800",
  configuring: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  terminated: "bg-gray-100 text-gray-800",
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getUserWithInstances(id);

  if (!data) {
    notFound();
  }

  const { user, instances } = data;
  const clerkUser = await getClerkUser(user.clerk_user_id);

  return (
    <div className="max-w-4xl">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to users
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">{user.id}</p>
        </div>
        <DeleteUserButton userId={user.id} clerkUserId={user.clerk_user_id} />
      </div>

      {/* Clerk Info */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clerk User</h2>
        {clerkUser ? (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">
                {clerkUser.emailAddresses[0]?.emailAddress || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium text-gray-900">
                {clerkUser.fullName || clerkUser.firstName || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Clerk ID</dt>
              <dd className="text-sm font-mono text-gray-900">{user.clerk_user_id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {new Date(user.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-red-600">Clerk user not found (may have been deleted)</p>
        )}
      </div>

      {/* Instances */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Instances ({instances.length})
        </h2>

        {instances.length === 0 ? (
          <p className="text-sm text-gray-500">No instances</p>
        ) : (
          <div className="space-y-4">
            {instances.map((instance) => (
              <div key={instance.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-900">{instance.id}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[instance.status] || "bg-gray-100 text-gray-800"}`}>
                    {instance.status}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Plan</dt>
                    <dd className="font-medium">{instance.plan_id}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Provider</dt>
                    <dd className="font-medium">{instance.provider || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Server ID</dt>
                    <dd className="font-mono">{instance.server_id || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Server IP</dt>
                    <dd className="font-mono">{instance.server_ip || "-"}</dd>
                  </div>
                  {instance.error_message && (
                    <div className="col-span-2">
                      <dt className="text-gray-500">Error</dt>
                      <dd className="text-red-600">{instance.error_message}</dd>
                    </div>
                  )}
                </dl>

                {instance.moltbot_config && (
                  <details className="mt-3">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                      Config JSON
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-48">
                      {JSON.stringify(instance.moltbot_config, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
