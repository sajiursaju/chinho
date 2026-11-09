"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["pending", "confirmed", "rejected", "paid"] as const;

type Props = { orderId: number; currentStatus?: string | null; currentTracking?: string | null; currentPaymentStatus?: string | null };

export default function OrderStatusForm({ orderId, currentStatus, currentTracking, currentPaymentStatus }: Props) {
  const router = useRouter();
  const initialStatus = (currentStatus ?? "pending").toLowerCase();
  const initialTracking = currentTracking ?? "";
  const initialPaymentStatus = (currentPaymentStatus ?? "pending").toLowerCase();
  const [status, setStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState(initialTracking);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const unchanged = status === initialStatus && tracking === initialTracking && paymentStatus === initialPaymentStatus;

  async function handleSave() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber: tracking, paymentStatus }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update order");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  return <div className="flex min-w-40 flex-col gap-2">
    <select aria-label="Order status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-2 py-1 text-sm">{STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}</select>
    <select aria-label="Payment verification status" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="rounded border px-2 py-1 text-sm">{PAYMENT_STATUSES.map((value) => <option key={value} value={value}>{value === "pending" ? "payment pending" : `payment ${value}`}</option>)}</select>
    <input aria-label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number (optional)" maxLength={100} className="rounded border px-2 py-1 text-sm" />
    <button type="button" onClick={handleSave} disabled={loading || unchanged} className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50">{loading ? "Saving…" : "Save"}</button>
    {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
  </div>;
}
