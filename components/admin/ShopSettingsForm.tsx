"use client";

import { useState } from "react";
import type { ShopSettings } from "@/lib/shopSettings";

export default function ShopSettingsForm({ initialValues }: { initialValues: ShopSettings }) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateValue<K extends keyof ShopSettings>(key: K, value: ShopSettings[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save settings");
      setMessage("Settings saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save settings"); }
    finally { setSaving(false); }
  }

  const fieldClass = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900";
  const walletFields = (method: "bkash" | "nagad") => {
    const enabledKey = method === "bkash" ? "enableBkash" : "enableNagad";
    const numberKey = method === "bkash" ? "bkashNumber" : "nagadNumber";
    const actionKey = method === "bkash" ? "bkashAction" : "nagadAction";
    const instructionKey = method === "bkash" ? "bkashInstruction" : "nagadInstruction";
    const label = method === "bkash" ? "bKash" : "Nagad";
    return <section className="rounded-xl border bg-white p-5 shadow-sm"><label className="flex items-center gap-3 font-semibold"><input type="checkbox" checked={values[enabledKey]} onChange={(e) => updateValue(enabledKey, e.target.checked)} />Enable {label}</label>{values[enabledKey] && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">{label} personal number<input required value={values[numberKey]} onChange={(e) => updateValue(numberKey, e.target.value)} maxLength={40} className={fieldClass} /></label><label className="text-sm font-medium">Customer action<select value={values[actionKey]} onChange={(e) => updateValue(actionKey, e.target.value as ShopSettings[typeof actionKey])} className={fieldClass}><option>Send Money</option><option>Cash Out</option></select></label><label className="text-sm font-medium sm:col-span-2">Instructions for customer<textarea value={values[instructionKey]} onChange={(e) => updateValue(instructionKey, e.target.value)} rows={3} maxLength={1000} className={fieldClass} placeholder={`Explain how to pay by ${label}.`} /></label></div>}</section>;
  };

  return <form onSubmit={handleSubmit} className="space-y-5">
    <section className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">Delivery charges (BDT)</h2><div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium">Dhaka delivery fee<input type="number" min="0" step="0.01" required value={values.dhakaDeliveryCharge} onChange={(e) => updateValue("dhakaDeliveryCharge", Number(e.target.value))} className={fieldClass} /></label><label className="text-sm font-medium">Outside Dhaka fee<input type="number" min="0" step="0.01" required value={values.outsideDhakaDeliveryCharge} onChange={(e) => updateValue("outsideDhakaDeliveryCharge", Number(e.target.value))} className={fieldClass} /></label><label className="text-sm font-medium">Free delivery threshold (0 disables)<input type="number" min="0" step="0.01" required value={values.freeShippingThreshold} onChange={(e) => updateValue("freeShippingThreshold", Number(e.target.value))} className={fieldClass} /></label></div></section>
    <section className="rounded-xl border bg-white p-5 shadow-sm"><label className="flex items-center gap-3 font-semibold"><input type="checkbox" checked={values.enableCod} onChange={(e) => updateValue("enableCod", e.target.checked)} />Enable Cash on Delivery</label>{values.enableCod && <label className="mt-4 block text-sm font-medium">Customer instruction<textarea value={values.codInstruction} onChange={(e) => updateValue("codInstruction", e.target.value)} rows={2} maxLength={1000} className={fieldClass} /></label>}</section>
    {walletFields("bkash")}{walletFields("nagad")}
    <div className="flex items-center gap-3"><button disabled={saving} className="rounded bg-gray-900 px-5 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save payment & delivery settings"}</button>{message && <p role="status" className="text-sm text-gray-700">{message}</p>}</div>
  </form>;
}
