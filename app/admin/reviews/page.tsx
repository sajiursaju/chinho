import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  let total = 0;
  let avgRating = 0;

  try {
    const [rows]: any = await pool.query(
      "SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS avg_rating FROM reviews"
    );
    total = Number(rows[0]?.total ?? 0);
    avgRating = Number(rows[0]?.avg_rating ?? 0);
  } catch {
    total = 0;
    avgRating = 0;
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500">
          Track store feedback and customer satisfaction.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total reviews</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{total}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Average rating</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {avgRating.toFixed(1)}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          No review data is currently available.
        </p>
      </section>
    </main>
  );
}
