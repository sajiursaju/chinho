import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings } from "@/lib/shopSettings";
import ShopSettingsForm from "@/components/admin/ShopSettingsForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    return <main className="p-6"><p className="text-gray-700">Admin access required. Please sign in with an admin account.</p></main>;
  }

  let settings;
  let loadError = "";
  try {
    settings = await getShopSettings();
  } catch (error) {
    console.error("Unable to load payment/delivery settings:", error);
    loadError = "Could not load settings from the database. Check that the shop_settings table exists and the database connection is working.";
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:underline">← Back to dashboard</Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Payments &amp; Delivery Settings</h1>
        <p className="text-sm text-gray-600">Configure payment methods, wallet instructions, and delivery charges.</p>
      </div>
      {loadError ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</div> : settings ? <ShopSettingsForm initialValues={settings} /> : null}
    </main>
  );
}
