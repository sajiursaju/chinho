"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export default function EditProfileForm(props: Props) {
  const router = useRouter();
  const [name, setName] = useState(props.name);
  const [email, setEmail] = useState(props.email);
  const [phone, setPhone] = useState(props.phone);
  const [address, setAddress] = useState(props.address);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== props.email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address, currentPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save your profile");
        setLoading(false);
        return;
      }

      // Tell the header to reload the name, then go back to the profile
      window.dispatchEvent(new Event("auth-changed"));
      router.push(`/account/${props.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const input =
    "w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <h1 className="mb-6 text-xl font-bold text-gray-900">Edit profile</h1>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <label className="mb-1 block text-sm font-medium text-gray-700">
        Name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={100}
        className={`${input} mb-4`}
      />

      <label className="mb-1 block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={`${input} mb-4`}
      />

      {emailChanged && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Current password (needed to change your email)
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={input}
          />
        </div>
      )}

      <label className="mb-1 block text-sm font-medium text-gray-700">
        Phone
      </label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={`${input} mb-4`}
      />

      <label className="mb-1 block text-sm font-medium text-gray-700">
        Address
      </label>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        maxLength={255}
        className={`${input} mb-6`}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <Link
          href={`/account/${props.id}`}
          className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}