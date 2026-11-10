import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings, saveShopSettings } from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const settings = await getShopSettings();

    return NextResponse.json(
      {
        announcementText: settings.announcementText ?? "",
        storeOfferTitle: settings.storeOfferTitle ?? "",
        storeOfferSubtitle: settings.storeOfferSubtitle ?? "",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Could not load offer text:", error);
    return NextResponse.json(
      { error: "Could not load promo settings" },
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid offer settings." },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    const current = await getShopSettings();

    function offerText(
      value: unknown,
      currentValue: string,
      field: string,
      maxLength: number
    ) {
      const result =
        value === undefined
          ? currentValue
          : typeof value === "string"
            ? value.trim()
            : null;

      if (result === null) {
        throw new Error(`${field} must be text.`);
      }
      if (result.length > maxLength) {
        throw new Error(`${field} must be ${maxLength} characters or fewer.`);
      }

      return result;
    }

    const settings = {
      ...current,
      announcementText: offerText(
        payload.announcementText,
        current.announcementText ?? "",
        "Announcement text",
        200
      ),
      storeOfferTitle: offerText(
        payload.storeOfferTitle,
        current.storeOfferTitle ?? "",
        "Offer title",
        80
      ),
      storeOfferSubtitle: offerText(
        payload.storeOfferSubtitle,
        current.storeOfferSubtitle ?? "",
        "Offer subtitle",
        120
      ),
    };

    await saveShopSettings(settings);

    return NextResponse.json({
      ok: true,
      settings: {
        announcementText: settings.announcementText,
        storeOfferTitle: settings.storeOfferTitle,
        storeOfferSubtitle: settings.storeOfferSubtitle,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save offer text";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}