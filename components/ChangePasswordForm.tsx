"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setMessage("");
    setError("");
    setLoading(true);

    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.get("currentPassword"),
        newPassword: data.get("newPassword"),
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage(json.message);
      form.reset();
    } else {
      setError(json.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="font-semibold">Change password</h2>
      <input
        name="currentPassword"
        type="password"
        placeholder="Current password"
        required
        className="w-full rounded border p-2"
      />
      <input
        name="newPassword"
        type="password"
        placeholder="New password (8+ characters)"
        required
        className="w-full rounded border p-2"
      />
      <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Saving..." : "Update password"}
      </button>
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}