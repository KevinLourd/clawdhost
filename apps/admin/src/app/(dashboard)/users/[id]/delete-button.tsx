"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export function DeleteUserButton({ userId, clerkUserId }: { userId: string; clerkUserId: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ clerk: boolean; db: boolean; hetzner: boolean } | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setResult(data.results);

      // Redirect after short delay to show results
      setTimeout(() => {
        router.push("/users");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-green-800 mb-2">User deleted successfully</p>
        <ul className="text-green-700 space-y-1">
          <li>Clerk: {result.clerk ? "✓ Deleted" : "✗ Failed"}</li>
          <li>Database: {result.db ? "✓ Deleted" : "✗ Failed"}</li>
          <li>Hetzner: {result.hetzner ? "✓ Deleted" : "✗ No servers"}</li>
        </ul>
        <p className="text-green-600 mt-2">Redirecting...</p>
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Delete this user?</p>
            <p className="text-sm text-red-700 mt-1">
              This will permanently delete:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside mt-1">
              <li>Clerk user and their organizations</li>
              <li>Database user and all instances</li>
              <li>Hetzner servers (if any)</li>
            </ul>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      Delete User
    </button>
  );
}
