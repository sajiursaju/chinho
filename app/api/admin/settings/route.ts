import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import {
  getShopSettings,
  saveShopSettings,
  type ShopSettings,
} from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    return NextResponse.json(await getShopSettings(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Could not load admin settings:", error);
    return NextResponse.json(
      { error: "Could not load settings" },
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
      return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const current = await getShopSettings();

    const number = (value: unknown, field: string) => {
      if (value === "" || value === null || value === undefined) {
        throw new Error(`${field} is required.`);
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`${field} must be zero or more.`);
      }
      return parsed;
    };

    const text = (
      value: unknown,
      previous: string,
      field: string,
      maxLength: number
    ) => {
      const result =
        value === undefined
          ? previous
          : typeof value === "string"
            ? value.trim()
            : "";
      if (result.length > maxLength) {
        throw new Error(`${field} must be ${maxLength} characters or fewer.`);
      }
      return result;
    };

    const action = (
      value: unknown,
      previous: "Send Money" | "Cash Out"
    ): "Send Money" | "Cash Out" => {
      if (value === undefined) return previous;
      if (value === "Send Money" || value === "Cash Out") return value;
      throw new Error("Choose a valid wallet action.");
    };

    const settings: ShopSettings = {
      freeShippingThreshold: number(
        payload.freeShippingThreshold,
        "Free delivery threshold"
      ),
      dhakaDeliveryCharge: number(
        payload.dhakaDeliveryCharge,
        "Dhaka delivery charge"
      ),
      outsideDhakaDeliveryCharge: number(
        payload.outsideDhakaDeliveryCharge,
        "Outside Dhaka delivery charge"
      ),
      enableCod: payload.enableCod === true,
      enableBkash: payload.enableBkash === true,
      enableNagad: payload.enableNagad === true,
      codInstruction: text(
        payload.codInstruction,
        current.codInstruction,
        "Cash on Delivery instructions",
        1000
      ),
      bkashNumber: text(
        payload.bkashNumber,
        current.bkashNumber,
        "bKash number",
        40
      ),
      bkashAction: action(payload.bkashAction, current.bkashAction),
      bkashInstruction: text(
        payload.bkashInstruction,
        current.bkashInstruction,
        "bKash instructions",
        1000
      ),
      nagadNumber: text(
        payload.nagadNumber,
        current.nagadNumber,
        "Nagad number",
        40
      ),
      nagadAction: action(payload.nagadAction, current.nagadAction),
      nagadInstruction: text(
        payload.nagadInstruction,
        current.nagadInstruction,
        "Nagad instructions",
        1000
      ),

      // Preserve the admin-managed promo copy if this form doesn't submit it.
      announcementText: text(
        payload.announcementText,
        current.announcementText,
        "Announcement text",
        200
      ),
      storeOfferTitle: text(
        payload.storeOfferTitle,
        current.storeOfferTitle,
        "Store offer title",
        80
      ),
      storeOfferSubtitle: text(
        payload.storeOfferSubtitle,
        current.storeOfferSubtitle,
        "Store offer subtitle",
        120
      ),
    };

    if (settings.enableBkash && !settings.bkashNumber) {
      throw new Error("Enter a bKash number before enabling bKash.");
    }
    if (settings.enableNagad && !settings.nagadNumber) {
      throw new Error("Enter a Nagad number before enabling Nagad.");
    }

    await saveShopSettings(settings);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}