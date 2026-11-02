"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

type Props = { images: string[]; name: string };

// Every product shows this many small pictures.
// If it has fewer real pictures, the existing ones repeat.
// Set to 1 to show only the real pictures.
const MIN_PICTURES = 3;

export default function ProductGallery({ images, name }: Props) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 text-gray-300">
        <ShoppingBag size={96} />
      </div>
    );
  }

  const slides = Array.from(
    { length: Math.max(MIN_PICTURES, images.length) },
    (_, i) => images[i % images.length]
  );
  const total = slides.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
      {/* Big picture */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slides[index]}
        alt={`${name} ${index + 1}`}
        className="h-full w-full object-cover"
      />

      {/* Half shadow at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous picture"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow transition hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next picture"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow transition hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Small pictures inside the big picture */}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 px-3">
          {slides.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show picture ${i + 1}`}
              className={`h-14 w-16 overflow-hidden rounded-lg border-2 shadow-md transition sm:h-16 sm:w-20 ${
                i === index
                  ? "border-white"
                  : "border-white/40 opacity-80 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${name} small ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}