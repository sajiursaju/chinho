import { NextResponse } from "next/server";
import { getHomepageSlides } from "@/lib/homepageSlides";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slides = await getHomepageSlides(false);

    return NextResponse.json(
      { slides },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Could not load public homepage slides:", error);
    return NextResponse.json(
      { slides: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}