import { pool } from "@/lib/db";
import { isValidCategoryPair } from "@/config/categories";

export type ProductInput = {
  name: string;
  price: number;
  category: string;
  subcategory: string;
  description: string | null;
  image: string | null;
  image_2: string | null;
  image_3: string | null;
};

// Pictures must be "/uploads/a.jpg" or "https://...". "//x.com" is blocked.
const IMAGE_RULE = /^(\/(?!\/)|https?:\/\/)/;

// Checks the submitted product and returns clean values, or an error message.
export function parseProductInput(
  body: any
): { data: ProductInput } | { error: string } {
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  // An empty price is rejected. Without this check, Number("") would become 0.
  const priceText =
    typeof body?.price === "string" || typeof body?.price === "number"
      ? String(body.price).trim()
      : "";
  const price = priceText === "" ? NaN : Number(priceText);

  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const subcategory = typeof body?.subcategory === "string" ? body.subcategory.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";

  if (!name || name.length > 150)
    return { error: "Name is required (max 150 characters)" };
  if (!Number.isFinite(price) || price < 0 || price > 9999999)
    return { error: "Enter a valid price" };
  if (!isValidCategoryPair(category, subcategory))
    return { error: "Choose a valid category and subcategory" };
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
      subcategory,
      description: description || null,
      image: pictures[0],
      image_2: pictures[1],
      image_3: pictures[2],
    },
  };
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
    "INSERT INTO products (name, price, category, subcategory, description, image, image_2, image_3) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [d.name, d.price, d.category, d.subcategory, d.description, d.image, d.image_2, d.image_3]
  );
  return result.insertId;
}

export async function updateProduct(id: number, d: ProductInput): Promise<boolean> {
  const [result]: any = await pool.query(
    "UPDATE products SET name = ?, price = ?, category = ?, subcategory = ?, description = ?, image = ?, image_2 = ?, image_3 = ? WHERE id = ?",
    [d.name, d.price, d.category, d.subcategory, d.description, d.image, d.image_2, d.image_3, id]
  );
  return result.affectedRows > 0;
}

// Throws ER_ROW_IS_REFERENCED_2 when the product is already inside a customer order.
export async function deleteProduct(id: number): Promise<boolean> {
  const [result]: any = await pool.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
