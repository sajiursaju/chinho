import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings } from "@/lib/shopSettings";
import ShopSettingsForm from "@/components/admin/ShopSettingsForm";

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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage payments, delivery charges, and checkout options.</p>
      </div>

      <ShopSettingsForm
        initialValues={{
          freeShippingThreshold: settings.freeShippingThreshold,
          dhakaDeliveryCharge: settings.dhakaDeliveryCharge,
          outsideDhakaDeliveryCharge: settings.outsideDhakaDeliveryCharge,
          enableCod: settings.enableCod,
          enableBkash: settings.enableBkash,
          enableNagad: settings.enableNagad,
          codInstruction: settings.codInstruction,
          bkashNumber: settings.bkashNumber,
          bkashInstruction: settings.bkashInstruction,
          nagadNumber: settings.nagadNumber,
          nagadInstruction: settings.nagadInstruction,
        }}
      />
    </main>
  );
}
