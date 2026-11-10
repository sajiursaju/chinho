import { requireAdmin } from "@/lib/adminProducts";
import { getHomepageSlides } from "@/lib/homepageSlides";
import HomepageSlidesForm from "@/components/admin/HomepageSlidesForm";

export const dynamic = "force-dynamic";

export default async function AdminSlidesPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  try {
    const slides = await getHomepageSlides(true);

    return (
      <main className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Homepage Slides
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage the homepage hero carousel images, text, buttons, and order.
          </p>
        </div>

        <HomepageSlidesForm initialSlides={slides} />
      </main>
    );
  } catch (error) {
    console.error("Could not open homepage slides:", error);

    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Slides</h1>
        <p role="alert" className="mt-3 text-red-700">
          Could not load homepage slides. Check the database connection.
        </p>
      </main>
    );
  }
}