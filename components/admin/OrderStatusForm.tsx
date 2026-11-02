"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type Props = {
  orderId: number;
  currentStatus?: string | null;
  currentTracking?: string | null;
};

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentTracking,
}: Props) {
  const router = useRouter();

  // Normalize values that may be null/undefined/uppercase
  const initialStatus = (currentStatus ?? "pending").toLowerCase();
  const initialTracking = currentTracking ?? "";

  const [status, setStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState(initialTracking);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unchanged = status === initialStatus && tracking === initialTracking;

  async function handleSave() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber: tracking }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update order");
      }

      // Re-run the server page so the table shows the new values
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="Tracking number (optional)"
        maxLength={100}
        className="rounded border px-2 py-1 text-sm"
      />

      <button
        onClick={handleSave}
        disabled={loading || unchanged}
        className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}