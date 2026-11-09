import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings } from "@/lib/shopSettings";
import ShopSettingsForm from "@/components/admin/ShopSettingsForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    return <main className="p-6"><p className="text-gray-700">Admin access required.</p></main>;
  }

  const settings = await getShopSettings();

  return (
    <main className="space-y-6 p-6">
      <div>
        <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:underline">← Back to dashboard</Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Payments &amp; Delivery Settings</h1>
        <p className="text-sm text-gray-500">Manage payment methods, wallet instructions, and delivery charges.</p>
      </div>
      <ShopSettingsForm initialValues={settings} />
    </main>
  );
}
