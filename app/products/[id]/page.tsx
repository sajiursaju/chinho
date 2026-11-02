import Link from "next/link";
import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import { productCategories } from "@/config/site";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

// Makes "images/a.jpg" work from any URL by turning it into "/images/a.jpg"
function imageSrc(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/")) return v;
  return `/${v}`;
}

function categoryLabel(slug: string): string | null {
  for (const c of productCategories) {
    if (c.value === slug) return c.label;
    const child = c.children?.find((s) => s.value === slug);
    if (child) return child.label;
  }
  return null;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) notFound();

  const [rows]: any = await pool.query(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [productId]
  );
  const p = rows[0];
  if (!p) notFound();

  // Up to 3 pictures, empty ones are skipped
  const images = [p.image ?? p.image_url ?? p.img, p.image_2, p.image_3]
    .map(imageSrc)
    .filter((src): src is string => src !== null);

  const price = Number(p.price);
  const category = p.category ? categoryLabel(p.category) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb -> /products */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/products" className="hover:text-gray-900">
          Products
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${p.category}`}
              className="hover:text-gray-900"
            >
              {category}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{p.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Pictures */}
        <ProductGallery images={images} name={p.name} />

        {/* Details */}
        <div>
          {category && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
              {category}
            </p>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{p.name}</h1>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            ${price.toFixed(2)}
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