"use client";

import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error);
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={onDelete} className="text-red-600 underline">
      Delete
    </button>
  );
}