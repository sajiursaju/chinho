import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { saveShopSettings, getShopSettings } from "@/lib/shopSettings";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getShopSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const payload = await request.json().catch(() => ({}));
    const settings = await saveShopSettings({
      freeShippingThreshold: Number(payload.freeShippingThreshold ?? 2000),
      dhakaDeliveryCharge: Number(payload.dhakaDeliveryCharge ?? 60),
      outsideDhakaDeliveryCharge: Number(payload.outsideDhakaDeliveryCharge ?? 120),
      enableCod: Boolean(payload.enableCod ?? true),
      enableBkash: Boolean(payload.enableBkash ?? true),
      enableNagad: Boolean(payload.enableNagad ?? true),
      codInstruction: String(payload.codInstruction ?? ""),
      bkashNumber: String(payload.bkashNumber ?? ""),
      bkashInstruction: String(payload.bkashInstruction ?? ""),
      nagadNumber: String(payload.nagadNumber ?? ""),
      nagadInstruction: String(payload.nagadInstruction ?? ""),
    });

    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }
}
