import { pool } from "@/lib/db";
import { allCategoryValues, productCategories } from "@/config/site";

export type ProductInput = {
  name: string;
  price: number;
  category: string;
  description: string | null;
  image: string | null;
  image_2: string | null;
  image_3: string | null;
};

// Pictures must be "/images/a.jpg" or "https://..." ("//x.com" is blocked)
const IMAGE_RULE = /^(\/(?!\/)|https?:\/\/)/;

export function parseProductInput(
  body: any
): { data: ProductInput } | { error: string } {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const price = Number(body?.price);
  const category = typeof body?.category === "string" ? body.category : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";

  if (!name || name.length > 150)
    return { error: "Name is required (max 150 characters)" };
  if (!Number.isFinite(price) || price < 0 || price > 9999999)
    return { error: "Enter a valid price" };
  if (!allCategoryValues.includes(category))
    return { error: "Choose a valid category" };
  if (description.length > 5000)
    return { error: "Description is too long (max 5000 characters)" };

  const pictures: (string | null)[] = [];
  for (const key of ["image", "image_2", "image_3"]) {
    const raw = typeof body?.[key] === "string" ? body[key].trim() : "";
    if (!raw) {
      pictures.push(null);
      continue;
    }
    if (raw.length > 255 || !IMAGE_RULE.test(raw))
      return { error: "Pictures must start with / or https://" };
    pictures.push(raw);
  }

  return {
    data: {
      name,
      price: Math.round(price * 100) / 100,
      category,
      description: description || null,
      image: pictures[0],
      image_2: pictures[1],
      image_3: pictures[2],
    },
  };
}

export async function listProducts(): Promise<Record<string, any>[]> {
  const [rows]: any = await pool.query("SELECT * FROM products ORDER BY id DESC");
  return rows;
}

export async function getProduct(id: number): Promise<Record<string, any> | null> {
  const [rows]: any = await pool.query(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function createProduct(d: ProductInput): Promise<number> {
  const [result]: any = await pool.query(
    "INSERT INTO products (name, price, category, description, image, image_2, image_3) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [d.name, d.price, d.category, d.description, d.image, d.image_2, d.image_3]
  );
  return result.insertId;
}

export async function updateProduct(id: number, d: ProductInput): Promise<boolean> {
  const [result]: any = await pool.query(
    "UPDATE products SET name = ?, price = ?, category = ?, description = ?, image = ?, image_2 = ?, image_3 = ? WHERE id = ?",
    [d.name, d.price, d.category, d.description, d.image, d.image_2, d.image_3, id]
  );
  return result.affectedRows > 0;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const [result]: any = await pool.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export function imageSrc(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/")) return v;
  return `/${v}`;
}

export function categoryLabel(slug: string): string {
  for (const c of productCategories) {
    if (c.value === slug) return c.label;
    const child = c.children?.find((s) => s.value === slug);
    if (child) return child.label;
  }
  return slug || "No category";
}