"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomepageSlide } from "@/lib/homepageSlides";

export default function HomepageHeroCarousel({
  slides,
  storeName,
}: {
  slides: HomepageSlide[];
  storeName: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section
        aria-labelledby="home-hero-title"
        className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-800 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14"
      >
        <div className="relative max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">
            Welcome to {storeName}
          </p>
          <h1
            id="home-hero-title"
            className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Style made for <span className="text-amber-300">your everyday.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">
            Discover fresh styles for every occasion.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-gray-950 hover:bg-amber-200"
          >
            Shop all products →
          </Link>
        </div>
      </section>
    );
  }

  const activeIndex = index % slides.length;
  const slide = slides[activeIndex];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative mb-8 min-h-[300px] overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl sm:min-h-[380px]"
    >
      {slide.image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/10" />
        </>
      )}

      <div className="relative z-10 flex min-h-[300px] max-w-3xl flex-col items-start justify-center px-6 py-10 sm:min-h-[380px] sm:px-10 lg:px-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">
          {storeName}
        </p>

        {slide.title && (
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
        )}

        {slide.subtitle && (
          <p className="mt-4 max-w-2xl text-base leading-7 text-white sm:text-lg">
            {slide.subtitle}
          </p>
        )}

        {slide.buttonText && (
          <Link
            href={slide.href || "/products"}
            className="mt-7 inline-flex rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-amber-200"
          >
            {slide.buttonText} <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setIndex((current) => (current - 1 + slides.length) % slides.length)
            }
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % slides.length)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((item, slideIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Show slide ${slideIndex + 1}`}
                aria-current={slideIndex === activeIndex ? "true" : undefined}
                className={`h-2.5 w-2.5 rounded-full ${
                  slideIndex === activeIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}