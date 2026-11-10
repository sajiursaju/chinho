import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import {
  getHomepageSlides,
  saveHomepageSlides,
  type HomepageSlide,
} from "@/lib/homepageSlides";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const slides = await getHomepageSlides(true);

    return NextResponse.json(
      { slides },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Could not load homepage slides:", error);

    return NextResponse.json(
      { error: "Could not load homepage slides." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray((body as { slides?: unknown }).slides)
    ) {
      return NextResponse.json(
        { error: "Submit a valid slides list." },
        { status: 400 }
      );
    }

    const input = (body as { slides: unknown[] }).slides;

    if (input.length > 10) {
      return NextResponse.json(
        { error: "You can add up to 10 slides." },
        { status: 400 }
      );
    }

    const ids = new Set<string>();

    const slides: HomepageSlide[] = input.map((item, index) => {
      if (!item || typeof item !== "object") {
        throw new Error(`Slide ${index + 1} is invalid.`);
      }

      const slide = item as Record<string, unknown>;
      const id = typeof slide.id === "string" ? slide.id.trim() : "";
      const title = typeof slide.title === "string" ? slide.title.trim() : "";
      const subtitle =
        typeof slide.subtitle === "string" ? slide.subtitle.trim() : "";
      const buttonText =
        typeof slide.buttonText === "string" ? slide.buttonText.trim() : "";
      const href = typeof slide.href === "string" ? slide.href.trim() : "";
      const image = typeof slide.image === "string" ? slide.image.trim() : "";

      if (!id || id.length > 80 || ids.has(id)) {
        throw new Error(`Slide ${index + 1} needs a unique ID.`);
      }
      ids.add(id);

      if (
        title.length > 120 ||
        subtitle.length > 300 ||
        buttonText.length > 40
      ) {
        throw new Error(`Slide ${index + 1} has text that is too long.`);
      }

      if (href && (!href.startsWith("/") || href.startsWith("//"))) {
        throw new Error(
          `Slide ${index + 1} button link must be an internal path.`
        );
      }

      if (
        image &&
        !image.startsWith("/uploads/") &&
        !image.startsWith("https://")
      ) {
        throw new Error(
          `Slide ${index + 1} image must be an uploaded image or HTTPS URL.`
        );
      }

      const active = slide.active === true;

      if (active && !image) {
        throw new Error(`Upload an image for active slide ${index + 1}.`);
      }

      return {
        id,
        title,
        subtitle,
        buttonText,
        href: href || "/products",
        image,
        active,
      };
    });

    await saveHomepageSlides(slides);

    return NextResponse.json({ ok: true, slides });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save slides.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}