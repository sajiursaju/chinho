"use client";

import { useState } from "react";

type StoreOfferValues = {
  announcementText: string;
  storeOfferTitle: string;
  storeOfferSubtitle: string;
};

const EMPTY_VALUES: StoreOfferValues = {
  announcementText: "",
  storeOfferTitle: "",
  storeOfferSubtitle: "",
};

export default function StoreOfferForm({
  initialValues,
}: {
  initialValues?: Partial<StoreOfferValues> | null;
}) {
  const [values, setValues] = useState<StoreOfferValues>(() => ({
    ...EMPTY_VALUES,
    ...initialValues,
  }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  function update<K extends keyof StoreOfferValues>(
    key: K,
    value: StoreOfferValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setMessage("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setSaved(false);

    try {
      const response = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not save offer text.");
      }

      setValues({
        announcementText:
          data.settings?.announcementText ?? values.announcementText,
        storeOfferTitle:
          data.settings?.storeOfferTitle ?? values.storeOfferTitle,
        storeOfferSubtitle:
          data.settings?.storeOfferSubtitle ?? values.storeOfferSubtitle,
      });
      setSaved(true);
      setMessage("Offer text saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save offer text."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900";

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Announcement bar
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Leave blank to hide the announcement bar text on the storefront.
        </p>

        <label className="mt-4 block text-sm font-medium text-gray-800">
          Top announcement text
          <textarea
            value={values.announcementText}
            onChange={(event) =>
              update("announcementText", event.target.value)
            }
            rows={3}
            maxLength={200}
            placeholder="Enter announcement text"
            className={`${inputClass} resize-y`}
          />
          <span className="mt-1 block text-xs text-gray-500">
            Maximum 200 characters.
          </span>
        </label>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Sidebar store offer
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Leave both fields blank to hide the offer card.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-800">
            Offer title
            <input
              type="text"
              value={values.storeOfferTitle}
              onChange={(event) =>
                update("storeOfferTitle", event.target.value)
              }
              maxLength={80}
              placeholder="Enter offer title"
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-gray-500">
              Maximum 80 characters.
            </span>
          </label>

          <label className="block text-sm font-medium text-gray-800">
            Offer subtitle
            <input
              type="text"
              value={values.storeOfferSubtitle}
              onChange={(event) =>
                update("storeOfferSubtitle", event.target.value)
              }
              maxLength={120}
              placeholder="Enter offer subtitle"
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-gray-500">
              Maximum 120 characters.
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save offer text"}
        </button>

        {message && (
          <p
            role={saved ? "status" : "alert"}
            className={`text-sm ${saved ? "text-green-700" : "text-red-700"}`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}