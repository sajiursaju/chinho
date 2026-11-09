import { NextResponse } from "next/server";
import { getShopSettings } from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getShopSettings();
    return NextResponse.json({
      freeShippingThreshold: settings.freeShippingThreshold,
      dhakaDeliveryCharge: settings.dhakaDeliveryCharge,
      outsideDhakaDeliveryCharge: settings.outsideDhakaDeliveryCharge,
      enableCod: settings.enableCod,
      enableBkash: settings.enableBkash,
      enableNagad: settings.enableNagad,
      codInstruction: settings.codInstruction,
      bkashNumber: settings.bkashNumber,
      bkashAction: settings.bkashAction,
      bkashInstruction: settings.bkashInstruction,
      nagadNumber: settings.nagadNumber,
      nagadAction: settings.nagadAction,
      nagadInstruction: settings.nagadInstruction,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load checkout settings:", error);
    return NextResponse.json({ error: "Checkout is temporarily unavailable" }, { status: 500 });
  }
}
