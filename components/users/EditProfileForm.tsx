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
  const profileHref = `/users/${props.id}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address, currentPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not save your profile");
        setLoading(false);
        return;
      }

      window.dispatchEvent(new Event("auth-changed"));
      router.replace(profileHref);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const input = "w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-900";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Edit profile</h1>

      {error && <p role="alert" className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="profile-name">Name</label>
      <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} className={`${input} mb-4`} />

      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="profile-email">Email</label>
      <input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className={`${input} mb-4`} />

      {emailChanged && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="current-password">Current password (needed to change your email)</label>
          <input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={input} />
        </div>
      )}

      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="profile-phone">Phone</label>
      <input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className={`${input} mb-4`} />

      <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="profile-address">Address</label>
      <input id="profile-address" value={address} onChange={(event) => setAddress(event.target.value)} maxLength={255} className={`${input} mb-6`} />

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
          {loading ? "Saving..." : "Save changes"}
        </button>
        <Link href={profileHref} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
      </div>
    </form>
  );
}
