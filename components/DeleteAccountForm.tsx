"use client";

import { useState } from "react";

export default function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirm }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.error);
    window.location.href = "/";
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded border border-red-600 px-4 py-2 text-red-600">
        Delete my account
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm">
        This permanently deletes your account and your order history. It cannot be undone.
      </p>
      <input
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded border p-2"
      />
      <input
        placeholder="Type DELETE to confirm"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        className="w-full rounded border p-2"
      />
      <div className="flex gap-3">
        <button
          disabled={loading || confirm !== "DELETE"}
          className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Permanently delete"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 underline">
          Cancel
        </button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}