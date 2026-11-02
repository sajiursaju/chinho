"use client";

import { useRef, useState } from "react";

// Crop to a centered square, shrink to 256x256 and convert to JPEG
async function resizeImage(file: File, size = 256): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
      "image/jpeg",
      0.85
    )
  );
}

export default function AvatarUploader({
  name,
  hasAvatar,
}: {
  name: string;
  hasAvatar: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shown = preview ?? (hasAvatar ? "/api/account/avatar" : null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setMessage("");
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file");
    if (file.size > 10 * 1024 * 1024) return setError("Image must be under 10 MB");

    try {
      const resized = await resizeImage(file);
      setBlob(resized);
      setPreview(URL.createObjectURL(resized));
    } catch {
      setError("This image can't be read. Try a JPG or PNG.");
    }
  }

  async function onSave() {
    if (!blob) return;
    setLoading(true);
    setError("");
    const form = new FormData();
    form.append("avatar", blob, "avatar.jpg");
    const res = await fetch("/api/account/avatar", { method: "POST", body: form });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error);
    window.location.reload(); // refreshes the header picture too
  }

  async function onRemove() {
    if (!confirm("Remove your profile picture?")) return;
    setLoading(true);
    const res = await fetch("/api/account/avatar", { method: "DELETE" });
    setLoading(false);
    if (res.ok) window.location.reload();
    else setError("Could not remove the picture");
  }

  return (
    <div className="flex items-center gap-5">
      {shown ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shown} alt="Profile picture" className="h-24 w-24 rounded-full border object-cover" />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-gray-100 text-3xl font-semibold text-gray-600">
          {name.trim().charAt(0).toUpperCase() || "?"}
        </div>
      )}

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPick}
          className="hidden"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded border px-3 py-1.5 text-sm"
          >
            Choose photo
          </button>
          {blob && (
            <button
              type="button"
              onClick={onSave}
              disabled={loading}
              className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save photo"}
            </button>
          )}
          {hasAvatar && !blob && (
            <button
              type="button"
              onClick={onRemove}
              disabled={loading}
              className="px-3 py-1.5 text-sm text-red-600 underline"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">JPG, PNG or WebP. It is cropped to a square.</p>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}