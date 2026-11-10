"use client";

import { useState } from "react";
import type { HomepageSlide } from "@/lib/homepageSlides";

function createSlide(): HomepageSlide {
  return {
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    buttonText: "Shop now",
    href: "/products",
    image: "",
    active: true,
  };
}

export default function HomepageSlidesForm({
  initialSlides,
}: {
  initialSlides: HomepageSlide[];
}) {
  const [slides, setSlides] = useState(initialSlides);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  function updateSlide<K extends keyof HomepageSlide>(
    id: string,
    key: K,
    value: HomepageSlide[K]
  ) {
    setSlides((current) =>
      current.map((slide) =>
        slide.id === id ? { ...slide, [key]: value } : slide
      )
    );
    setSaved(false);
    setMessage("");
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    setSlides((current) => {
      const updated = [...current];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
    setSaved(false);
  }

  async function uploadImage(id: string, file?: File) {
    if (!file) return;

    setUploadingId(id);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not upload image.");
      }

      updateSlide(id, "image", data.url || data.path);
      setMessage("Image uploaded. Save slides to publish the change.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
      setSaved(false);
    } finally {
      setUploadingId(null);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setSaved(false);

    try {
      const response = await fetch("/api/admin/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not save slides.");
      }

      setSlides(data.slides);
      setSaved(true);
      setMessage("Homepage slides saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save slides.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900";

  return (
    <form onSubmit={save} className="space-y-5">
      <p className="text-sm text-gray-600">
        Add up to 10 slides. Active slides appear in the homepage carousel.
        Upload JPG, PNG, or WebP images up to 2 MB using the existing image
        uploader.
      </p>

      {slides.length === 0 && (
        <div className="rounded-xl border border-dashed bg-white p-6 text-sm text-gray-600">
          No slides yet. Add one to replace the current homepage hero.
        </div>
      )}

      {slides.map((slide, index) => (
        <section
          key={slide.id}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Slide {index + 1}</h2>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveSlide(index, -1)}
                disabled={index === 0}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                aria-label={`Move slide ${index + 1} up`}
              >
                Move up
              </button>
              <button
                type="button"
                onClick={() => moveSlide(index, 1)}
                disabled={index === slides.length - 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                aria-label={`Move slide ${index + 1} down`}
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() =>
                  setSlides((current) =>
                    current.filter((item) => item.id !== slide.id)
                  )
                }
                className="rounded border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={slide.active}
              onChange={(event) =>
                updateSlide(slide.id, "active", event.target.checked)
              }
            />
            Active on homepage
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Heading
              <input
                value={slide.title}
                maxLength={120}
                onChange={(event) =>
                  updateSlide(slide.id, "title", event.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Button text
              <input
                value={slide.buttonText}
                maxLength={40}
                onChange={(event) =>
                  updateSlide(slide.id, "buttonText", event.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium sm:col-span-2">
              Description
              <textarea
                value={slide.subtitle}
                maxLength={300}
                rows={3}
                onChange={(event) =>
                  updateSlide(slide.id, "subtitle", event.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Button link
              <input
                value={slide.href}
                maxLength={300}
                placeholder="/products"
                onChange={(event) =>
                  updateSlide(slide.id, "href", event.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Upload slide image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingId === slide.id}
                onChange={(event) => {
                  void uploadImage(slide.id, event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
                className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1`}
              />
              <span className="mt-1 block text-xs text-gray-500">
                {uploadingId === slide.id
                  ? "Uploading…"
                  : "JPG, PNG, or WebP; maximum 2 MB."}
              </span>
            </label>
          </div>

          {slide.image && (
            <div>
              <p className="mb-2 text-sm font-medium">Current image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={`Preview for slide ${index + 1}`}
                className="h-40 w-full rounded-lg bg-gray-100 object-cover"
              />
            </div>
          )}
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={slides.length >= 10}
          onClick={() => {
            setSlides((current) => [...current, createSlide()]);
            setSaved(false);
            setMessage("");
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Add slide
        </button>

        <button
          type="submit"
          disabled={saving || uploadingId !== null}
          className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save slides"}
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