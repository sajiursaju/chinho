"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { productCategories } from "@/config/site";

type PictureKey = "image" | "image_2" | "image_3";

type Values = {
  name: string;
  price: string;
  category: string;
  description: string;
  image: string;
  image_2: string;
  image_3: string;
};

const EMPTY: Values = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  image_2: "",
  image_3: "",
};

const PICTURES: { key: PictureKey; label: string }[] = [
  { key: "image", label: "Picture 1 (main)" },
  { key: "image_2", label: "Picture 2" },
  { key: "image_3", label: "Picture 3" },
];

const MAX_BYTES = 2 * 1024 * 1024;

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

function previewSrc(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return /^(\/(?!\/)|https?:\/\/)/.test(t) ? t : null;
}

export default function ProductForm({
  productId,
  initial,
}: {
  productId?: number; // set = edit mode
  initial?: Partial<Record<keyof Values, string | null>>;
}) {
  const router = useRouter();

  // Database NULLs become empty strings so no field is ever undefined or null
  const [values, setValues] = useState<Values>(() => {
    const merged = { ...EMPTY };
    for (const k of Object.keys(EMPTY) as (keyof Values)[]) {
      merged[k] = String(initial?.[k] ?? "");
    }
    return merged;
  });

  const [uploading, setUploading] = useState<Record<PictureKey, boolean>>({
    image: false,
    image_2: false,
    image_3: false,
  });
  const [pictureError, setPictureError] = useState<Record<PictureKey, string>>({
    image: "",
    image_2: "",
    image_3: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const anyUploading = Object.values(uploading).some(Boolean);

  const set =
    (key: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleFile(key: PictureKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets you pick the same file again later
    if (!file) return;

    setPictureError((p) => ({ ...p, [key]: "" }));

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPictureError((p) => ({ ...p, [key]: "Only JPG, PNG or WebP" }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setPictureError((p) => ({ ...p, [key]: "Picture is too big (max 2 MB)" }));
      return;
    }

    setUploading((u) => ({ ...u, [key]: true }));
    try {
      const body = new FormData();
      body.append("file", file);

      // POST -> /api/admin/upload
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      const url = data.url ?? data.path;

      if (!res.ok) {
        setPictureError((p) => ({ ...p, [key]: data.error ?? "Upload failed" }));
      } else if (typeof url !== "string") {
        setPictureError((p) => ({
          ...p,
          [key]: "Upload failed (no file address returned)",
        }));
      } else {
        setValues((v) => ({ ...v, [key]: url }));
      }
    } catch {
      setPictureError((p) => ({ ...p, [key]: "Network error, try again" }));
    }
    setUploading((u) => ({ ...u, [key]: false }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // POST -> /api/admin/products   or   PUT -> /api/admin/products/[id]
      const res = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error, try again");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          value={values.name}
          onChange={set("name")}
          required
          maxLength={150}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass}>
            Price ($)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={set("price")}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            value={values.category}
            onChange={set("category")}
            required
            className={inputClass}
          >
            <option value="" disabled>
              Select a category
            </option>
            {productCategories.map((c: any) => (
              <optgroup key={c.value} label={c.label}>
                <option value={c.value}>{c.label} (general)</option>
                {c.children?.map((s: any) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={set("description")}
          rows={4}
          maxLength={5000}
          className={inputClass}
        />
      </div>

      {/* Pictures */}
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Pictures</p>
        <p className="mb-3 text-xs text-gray-500">
          Choose from your computer. JPG, PNG or WebP, up to 2 MB each.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {PICTURES.map(({ key, label }) => {
            const src = previewSrc(values[key]);
            return (
              <div key={key}>
                <div className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={label} className="h-full w-full object-cover" />
                  ) : (
                    <label
                      htmlFor={`file-${key}`}
                      className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600"
                    >
                      <ImagePlus size={28} />
                      <span className="text-xs">
                        {uploading[key] ? "Uploading..." : "Choose picture"}
                      </span>
                    </label>
                  )}

                  {src && (
                    <button
                      type="button"
                      onClick={() => setValues((v) => ({ ...v, [key]: "" }))}
                      aria-label={`Remove ${label}`}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {uploading[key] && src && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium text-gray-700">
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600">{label}</span>
                  {src && (
                    <label
                      htmlFor={`file-${key}`}
                      className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Change
                    </label>
                  )}
                </div>

                <input
                  id={`file-${key}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFile(key, e)}
                  className="hidden"
                />

                {pictureError[key] && (
                  <p className="mt-1 text-xs text-red-600">{pictureError[key]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || anyUploading}
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : anyUploading
            ? "Uploading picture..."
            : productId
            ? "Save changes"
            : "Add product"}
        </button>
        <Link href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}