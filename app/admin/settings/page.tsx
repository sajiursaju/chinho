import { requireAdmin } from "@/lib/adminProducts";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  const sections = [
    {
      title: "Store settings",
      description: "Control storefront details, shipping behavior, and default preferences.",
    },
    {
      title: "Appearance",
      description: "Set colors, branding, and layout options for the shopping experience.",
    },
    {
      title: "Security",
      description: "Update admin access, password policies, and protected routes.",
    },
  ];

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Configure storefront and admin preferences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{section.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
