"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isAdmin?: boolean;
};

type Result = { ok: boolean; error?: string };
type Msg = { type: "ok" | "error"; text: string } | null;

async function send(url: string, method: string, body?: unknown): Promise<Result> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, error: data.error };
  } catch {
    return { ok: false, error: "Network error, try again" };
  }
}

function Message({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return <p className={`text-sm ${msg.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>;
}

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

export default function AccountForms({
  name: initialName,
  email: initialEmail,
  phone: initialPhone = "",
  address: initialAddress = "",
  isAdmin = false,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [emailPassword, setEmailPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<Msg>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== initialEmail.trim().toLowerCase();

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    const result = await send("/api/account/profile", "POST", {
      name,
      email,
      phone,
      address,
      currentPassword: emailChanged ? emailPassword : "",
    });
    setProfileLoading(false);
    if (!result.ok) {
      setProfileMsg({ type: "error", text: result.error ?? "Could not update profile" });
      return;
    }
    setProfileMsg({ type: "ok", text: "Profile updated" });
    setEmailPassword("");
    router.refresh();
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 8 || newPassword.length > 72) {
      setPasswordMsg({ type: "error", text: "New password must be 8 to 72 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match" });
      return;
    }

    setPasswordLoading(true);
    const result = await send("/api/account/password", "POST", { currentPassword, newPassword });
    setPasswordLoading(false);
    if (!result.ok) {
      setPasswordMsg({ type: "error", text: result.error ?? "Could not change password" });
      return;
    }
    setPasswordMsg({ type: "ok", text: "Password updated" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function signOut() {
    await send("/api/logout", "POST");
    router.push(isAdmin ? "/admin-login" : "/login");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Edit profile</h3>
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={255} className={inputClass} />
        </div>
        {emailChanged && (
          <div>
            <label htmlFor="emailPassword" className={labelClass}>Current password (needed to change email)</label>
            <input id="emailPassword" type="password" value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} required className={inputClass} />
          </div>
        )}
        {!isAdmin && (
          <>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} className={inputClass} />
            </div>
            <div>
              <label htmlFor="address" className={labelClass}>Address</label>
              <input id="address" value={address} onChange={(event) => setAddress(event.target.value)} maxLength={255} className={inputClass} />
            </div>
          </>
        )}
        <Message msg={profileMsg} />
        <button type="submit" disabled={profileLoading} className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50">
          {profileLoading ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Change password</h3>
        <div>
          <label htmlFor="current" className={labelClass}>Current password</label>
          <input id="current" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="new" className={labelClass}>New password (8 to 72 characters)</label>
          <input id="new" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} maxLength={72} className={inputClass} />
        </div>
        <div>
          <label htmlFor="confirm" className={labelClass}>Confirm new password</label>
          <input id="confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required maxLength={72} className={inputClass} />
        </div>
        <Message msg={passwordMsg} />
        <button type="submit" disabled={passwordLoading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">
          {passwordLoading ? "Updating..." : "Update password"}
        </button>
      </form>

      <section className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sign out</h3>
          <p className="text-sm text-gray-500">End your {isAdmin ? "admin" : "customer"} session on this device.</p>
        </div>
        <button type="button" onClick={signOut} className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
          Sign out
        </button>
      </section>
    </div>
  );
}
