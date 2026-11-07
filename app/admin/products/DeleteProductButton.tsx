"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: number;
  name: string;
};

// Delete button for the admin product list.
// It asks the browser to confirm first, and deletes only if the admin clicks OK.
export default function DeleteProductButton({ id, name }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    // Browser popup with OK and Cancel. Cancel stops here and nothing is deleted.
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // The server sends a message when the product can't be deleted,
        // for example when it is already in an order.
        window.alert(data.error ?? "This product could not be deleted.");
        return;
      }

      // Reload the list so the deleted product disappears.
      router.refresh();
    } catch {
      window.alert("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}