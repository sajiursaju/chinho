import Link from "next/link";

export default function NewCategoryPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <Link
          href="/admin/categories"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to categories
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Add category
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a category for organizing your store’s products.
        </p>
      </div>

      <form className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Category name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="For example, Women"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe this category"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Save category
          </button>

          <Link
            href="/admin/categories"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}