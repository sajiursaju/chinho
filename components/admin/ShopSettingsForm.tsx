"use client";

import { useState } from "react";

export type SettingsFormValues = {
  freeShippingThreshold: number;
  dhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  enableCod: boolean;
  enableBkash: boolean;
  enableNagad: boolean;
  codInstruction: string;
  bkashNumber: string;
  bkashInstruction: string;
  nagadNumber: string;
  nagadInstruction: string;
};

export default function ShopSettingsForm({ initialValues }: { initialValues: SettingsFormValues }) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateValue<T extends keyof SettingsFormValues>(key: T, value: SettingsFormValues[T]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setMessage("Saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Delivery settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Free delivery threshold</span>
            <input
              type="number"
              min={0}
              value={values.freeShippingThreshold}
              onChange={(e) => updateValue("freeShippingThreshold", Number(e.target.value || 0))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <div />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Dhaka delivery charge</span>
            <input
              type="number"
              min={0}
              value={values.dhakaDeliveryCharge}
              onChange={(e) => updateValue("dhakaDeliveryCharge", Number(e.target.value || 0))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Outside Dhaka delivery charge</span>
            <input
              type="number"
              min={0}
              value={values.outsideDhakaDeliveryCharge}
              onChange={(e) => updateValue("outsideDhakaDeliveryCharge", Number(e.target.value || 0))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Payment methods</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={values.enableCod} onChange={(e) => updateValue("enableCod", e.target.checked)} />
            Allow Cash on Delivery
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={values.enableBkash} onChange={(e) => updateValue("enableBkash", e.target.checked)} />
            Allow bKash
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={values.enableNagad} onChange={(e) => updateValue("enableNagad", e.target.checked)} />
            Allow Nagad
          </label>
        </div>

        {values.enableCod && (
          <div className="mt-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Cash on delivery instruction</span>
              <textarea
                value={values.codInstruction}
                onChange={(e) => updateValue("codInstruction", e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
        )}

        {values.enableBkash && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">bKash number</span>
              <input
                value={values.bkashNumber}
                onChange={(e) => updateValue("bkashNumber", e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <div />
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-gray-700">bKash instruction</span>
              <textarea
                value={values.bkashInstruction}
                onChange={(e) => updateValue("bkashInstruction", e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
        )}

        {values.enableNagad && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Nagad number</span>
              <input
                value={values.nagadNumber}
                onChange={(e) => updateValue("nagadNumber", e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <div />
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-gray-700">Nagad instruction</span>
              <textarea
                value={values.nagadInstruction}
                onChange={(e) => updateValue("nagadInstruction", e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        {message && <span className="text-sm text-gray-700">{message}</span>}
      </div>
    </div>
  );
}
