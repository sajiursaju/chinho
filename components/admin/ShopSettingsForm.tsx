"use client";

import { useState } from "react";
import type { ShopSettings } from "@/lib/shopSettings";

export default function ShopSettingsForm({ initialValues }: { initialValues: ShopSettings }) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ShopSettings>(key: K, value: ShopSettings[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save settings");
      setValues(data.settings);
      setSaved(true);
      setMessage("Settings saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  const input = "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900";
  function wallet(method: "bkash" | "nagad") {
    const b = method === "bkash";
    const enabledKey = b ? "enableBkash" : "enableNagad";
    const numberKey = b ? "bkashNumber" : "nagadNumber";
    const actionKey = b ? "bkashAction" : "nagadAction";
    const instructionKey = b ? "bkashInstruction" : "nagadInstruction";
    const label = b ? "bKash" : "Nagad";
    return <section key={method} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <label className="flex items-center gap-3 text-lg font-semibold"><input type="checkbox" checked={values[enabledKey]} onChange={(e) => set(enabledKey, e.target.checked)} />Enable {label}</label>
      {values[enabledKey] && <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Personal account number<input required value={values[numberKey]} maxLength={40} onChange={(e) => set(numberKey, e.target.value)} className={input} /></label>
        <label className="text-sm font-medium">Customer should<select value={values[actionKey]} onChange={(e) => set(actionKey, e.target.value as ShopSettings[typeof actionKey])} className={input}><option>Send Money</option><option>Cash Out</option></select></label>
        <label className="text-sm font-medium sm:col-span-2">Payment instructions<textarea rows={3} maxLength={1000} value={values[instructionKey]} onChange={(e) => set(instructionKey, e.target.value)} className={input} placeholder={`Explain how customers should pay using ${label}.`} /></label>
      </div>}
    </section>;
  }

  return <form onSubmit={submit} className="space-y-5">
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Delivery charges (BDT)</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-medium">Dhaka delivery charge<input type="number" min="0" step="0.01" required value={values.dhakaDeliveryCharge} onChange={(e) => set("dhakaDeliveryCharge", Number(e.target.value))} className={input} /></label>
        <label className="text-sm font-medium">Outside Dhaka delivery charge<input type="number" min="0" step="0.01" required value={values.outsideDhakaDeliveryCharge} onChange={(e) => set("outsideDhakaDeliveryCharge", Number(e.target.value))} className={input} /></label>
        <label className="text-sm font-medium">Free delivery threshold (0 disables)<input type="number" min="0" step="0.01" required value={values.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", Number(e.target.value))} className={input} /></label>
      </div>
    </section>
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <label className="flex items-center gap-3 text-lg font-semibold"><input type="checkbox" checked={values.enableCod} onChange={(e) => set("enableCod", e.target.checked)} />Enable Cash on Delivery</label>
      {values.enableCod && <label className="mt-4 block text-sm font-medium">Customer instructions<textarea rows={2} maxLength={1000} value={values.codInstruction} onChange={(e) => set("codInstruction", e.target.value)} className={input} /></label>}
    </section>
    {wallet("bkash")}
    {wallet("nagad")}
    <div className="flex flex-wrap items-center gap-3">
      <button disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? "Saving…" : "Save payment & delivery settings"}</button>
      {message && <p role="status" className={`text-sm ${saved ? "text-green-700" : "text-red-700"}`}>{message}</p>}
    </div>
  </form>;
}
