import { NextResponse } from "next/server";
import { getShopSettings } from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getShopSettings();
    return NextResponse.json(
      {
        announcementText: settings.announcementText ?? "",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Could not load storefront announcement:", error);
    return NextResponse.json(
      { announcementText: "" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}