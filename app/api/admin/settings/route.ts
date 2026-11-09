import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings, saveShopSettings, type ShopSettings } from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await getShopSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load admin settings:", error);
    return NextResponse.json({ error: "Could not load settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const number = (value: unknown) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) throw new Error("Delivery amounts must be zero or more.");
      return parsed;
    };
    const action = (value: unknown): "Send Money" | "Cash Out" => value === "Cash Out" ? "Cash Out" : "Send Money";
    const settings: ShopSettings = {
      freeShippingThreshold: number(body.freeShippingThreshold),
      dhakaDeliveryCharge: number(body.dhakaDeliveryCharge),
      outsideDhakaDeliveryCharge: number(body.outsideDhakaDeliveryCharge),
      enableCod: body.enableCod === true,
      enableBkash: body.enableBkash === true,
      enableNagad: body.enableNagad === true,
      codInstruction: String(body.codInstruction ?? "").trim(),
      bkashNumber: String(body.bkashNumber ?? "").trim(),
      bkashAction: action(body.bkashAction),
      bkashInstruction: String(body.bkashInstruction ?? "").trim(),
      nagadNumber: String(body.nagadNumber ?? "").trim(),
      nagadAction: action(body.nagadAction),
      nagadInstruction: String(body.nagadInstruction ?? "").trim(),
    };
    if (settings.enableBkash && !settings.bkashNumber) throw new Error("Enter a bKash number before enabling bKash.");
    if (settings.enableNagad && !settings.nagadNumber) throw new Error("Enter a Nagad number before enabling Nagad.");
    if (![settings.codInstruction, settings.bkashInstruction, settings.nagadInstruction].every((text) => text.length <= 1000)) {
      throw new Error("Instructions must be 1,000 characters or fewer.");
    }
    await saveShopSettings(settings);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
