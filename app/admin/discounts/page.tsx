import { requireAdmin } from "@/lib/adminProducts";

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

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
          <p className="text-sm text-gray-500">
            Manage special offers, seasonal pricing, and promo campaigns.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-900">No active discounts</p>
        <p className="mt-2 text-sm text-gray-600">
          Create a coupon or promotional offer to start driving more sales.
        </p>
      </section>
    </main>
  );
}
