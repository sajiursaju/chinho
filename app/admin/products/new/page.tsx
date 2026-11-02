import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminProducts";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return (
    <main className="px-4 py-8 md:px-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Add product</h2>
        <ProductForm />
      </div>
    </main>
  );
}