import { requireAdmin } from "@/lib/adminProducts";
import { getShopSettings } from "@/lib/shopSettings";
import StoreOfferForm from "@/components/admin/StoreOfferForm";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  const settings = await getShopSettings();

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Discounts &amp; Offers
        </h1>
        <p className="text-sm text-gray-600">
          Manage the announcement and sidebar offer text shown on the storefront.
        </p>
      </div>

      <StoreOfferForm
        initialValues={{
          announcementText: settings?.announcementText ?? "",
          storeOfferTitle: settings?.storeOfferTitle ?? "",
          storeOfferSubtitle: settings?.storeOfferSubtitle ?? "",
        }}
      />
    </main>
  );
}