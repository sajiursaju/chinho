import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings } from "@/lib/shopSettings";
import ShopSettingsForm from "@/components/admin/ShopSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) return <main className="p-6"><p className="text-gray-700">Admin access required.</p></main>;
  const settings = await getShopSettings();
  return <main className="space-y-6 p-6"><div><h1 className="text-2xl font-bold text-gray-900">Payments &amp; Delivery</h1><p className="text-sm text-gray-500">Configure checkout options, wallet instructions, and delivery fees.</p></div><ShopSettingsForm initialValues={settings} /></main>;
}
