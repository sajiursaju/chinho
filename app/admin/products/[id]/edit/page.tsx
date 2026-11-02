import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminProducts";
import { getProduct } from "@/lib/productAdmin";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) notFound();

  const p = await getProduct(productId);
  if (!p) notFound();

  return (
    <main className="px-4 py-8 md:px-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Edit product</h2>
        <ProductForm
          productId={p.id}
          initial={{
            name: p.name ?? "",
            price: String(p.price ?? ""),
            category: p.category ?? "",
            description: p.description ?? "",
            image: p.image ?? p.image_url ?? p.img ?? "",
            image_2: p.image_2 ?? "",
            image_3: p.image_3 ?? "",
          }}
        />
      </div>
    </main>
  );
}