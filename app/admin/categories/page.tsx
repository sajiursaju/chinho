import Link from "next/link";

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Organize your store’s clothing into groups such as Men, Women, and
            Accessories.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add category
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">All categories</h2>
        </div>

        <div className="p-8 text-center">
          <h3 className="font-semibold text-gray-900">No categories yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Add categories to organize products in your clothing store.
          </p>
        </div>
      </section>
    </main>
  );
}