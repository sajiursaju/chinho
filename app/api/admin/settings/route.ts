import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings, saveShopSettings } from "@/lib/shopSettings";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    return NextResponse.json(await getShopSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load shop settings:", error);
    return NextResponse.json({ error: "Could not load settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const payload = await request.json();
    const asBool = (value: unknown) => value === true || value === "true";
    const settings = await saveShopSettings({
      freeShippingThreshold: Number(payload.freeShippingThreshold),
      dhakaDeliveryCharge: Number(payload.dhakaDeliveryCharge),
      outsideDhakaDeliveryCharge: Number(payload.outsideDhakaDeliveryCharge),
      enableCod: asBool(payload.enableCod),
      enableBkash: asBool(payload.enableBkash),
      enableNagad: asBool(payload.enableNagad),
      codInstruction: String(payload.codInstruction ?? "").trim(),
      bkashNumber: String(payload.bkashNumber ?? "").trim(),
      bkashAction: payload.bkashAction === "Cash Out" ? "Cash Out" : "Send Money",
      bkashInstruction: String(payload.bkashInstruction ?? "").trim(),
      nagadNumber: String(payload.nagadNumber ?? "").trim(),
      nagadAction: payload.nagadAction === "Cash Out" ? "Cash Out" : "Send Money",
      nagadInstruction: String(payload.nagadInstruction ?? "").trim(),
    });
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save settings" }, { status: 400 });
  }
}
