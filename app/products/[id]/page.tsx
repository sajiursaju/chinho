import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getMainCategory, getSubCategory } from "@/config/categories";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";

// Always read the latest product from the database, so price and stock changes show immediately.
export const dynamic = "force-dynamic";

// Makes "images/a.jpg" work from any URL by turning it into "/images/a.jpg".
function imageSrc(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/")) return v;
  return `/${v}`;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) notFound();

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [productId]
  );
  const p = rows[0];
  if (!p) notFound();

  // Up to 3 pictures. Empty ones are skipped.
  const images = [p.image ?? p.image_url ?? p.img, p.image_2, p.image_3]
    .map(imageSrc)
    .filter((src): src is string => src !== null);

  const price = Number(p.price);

  // Look up the names from config/categories.ts, so they match the sidebar.
  // Old rows with no subcategory simply skip that part.
  const main = getMainCategory(p.category);
  const sub = getSubCategory(p.category, p.subcategory);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb: Products / Men / Shirts / Product name */}
      <nav className="mb-6 flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
        <Link href="/products" className="hover:text-gray-900">
          Products
        </Link>

        {main && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${main.slug}`}
              className="hover:text-gray-900"
            >
              {main.label}
            </Link>
          </>
        )}

        {main && sub && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${main.slug}&subcategory=${sub.slug}`}
              className="hover:text-gray-900"
            >
              {sub.label}
            </Link>
          </>
        )}

        <span>/</span>
        <span className="text-gray-900">{p.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Pictures */}
        <ProductGallery images={images} name={p.name} />

        {/* Details */}
        <div>
          {main && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
              {main.label}
              {sub ? ` · ${sub.label}` : ""}
            </p>
          )}

          <h1 className="text-3xl font-bold text-gray-900">{p.name}</h1>

          <p className="mt-4 text-3xl font-bold text-gray-900">
            ৳{price.toFixed(2)}
          </p>

          {p.description && (
            <p className="mt-6 whitespace-pre-line text-gray-600">
              {p.description}
            </p>
          )}

          <div className="mt-8">
            <AddToCartButton product={{ id: p.id, name: p.name, price }} />
          </div>
        </div>
      </div>
    </main>
  );
}