// config/categories.ts
// Single source of truth for categories. Data and helpers only, no JSX.

export type SubCategory = {
  label: string; // text shown to the shopper
  slug: string;  // must match the value stored in the products table
};

export type MainCategory = {
  label: string;
  slug: string;
  children: SubCategory[];
};

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    label: "Men",
    slug: "men",
    children: [
      { label: "Shirts", slug: "shirts" },
      { label: "Polos", slug: "polos" },
      { label: "Tees", slug: "tees" },
      { label: "Panjabi", slug: "panjabi" },
      { label: "Bottoms", slug: "bottoms" },
      { label: "Outerwear", slug: "outerwear" },
      { label: "Accessories", slug: "accessories" },
    ],
  },
  {
    label: "Women",
    slug: "women",
    children: [
      { label: "Sharee", slug: "sharee" },
      { label: "3-Piece", slug: "3-piece" },
      { label: "Tops", slug: "tops" },
      { label: "Bottoms", slug: "bottoms" },
      { label: "Dresses", slug: "dresses" },
      { label: "Outerwear", slug: "outerwear" },
      { label: "Accessories", slug: "accessories" },
    ],
  },
];

// Finds a main category by slug. Returns undefined if missing, empty (null) or unknown.
// null is allowed because MySQL columns can be empty and arrive as null.
export function getMainCategory(
  slug?: string | null
): MainCategory | undefined {
  if (!slug) return undefined;
  return MAIN_CATEGORIES.find((c) => c.slug === slug);
}

// Finds a subcategory inside a main category. Returns undefined if either slug is empty (null) or unknown.
export function getSubCategory(
  mainSlug?: string | null,
  subSlug?: string | null
): SubCategory | undefined {
  if (!mainSlug || !subSlug) return undefined;
  return getMainCategory(mainSlug)?.children.find((s) => s.slug === subSlug);
}

// Checks that the category exists and the subcategory belongs to it.
export function isValidCategoryPair(
  mainSlug: string,
  subSlug: string
): boolean {
  const main = getMainCategory(mainSlug);
  if (!main || !subSlug) return false;

  return main.children.some((subcategory) => subcategory.slug === subSlug);
}