"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { name: string; email: string; phone: string; address: string };

export default function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [values, setValues] = useState<Profile>(initial);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailChanged = values.email.trim().toLowerCase() !== initial.email;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, currentPassword }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) return setError(json.error);
    router.push("/account");
    router.refresh();
  }

  const field = "w-full rounded border p-2";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Full name</span>
        <input
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
          maxLength={100}
          className={field}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          required
          className={field}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Phone (optional)</span>
        <input
          value={values.phone}
          onChange={(e) => setValues({ ...values, phone: e.target.value })}
          className={field}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Address (optional)</span>
        <textarea
          rows={3}
          value={values.address}
          onChange={(e) => setValues({ ...values, address: e.target.value })}
          maxLength={255}
          className={field}
        />
      </label>

      {emailChanged && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Current password (required to change email)
          </span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={field}
          />
        </label>
      )}

      <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Saving..." : "Save profile"}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}