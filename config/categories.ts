// The single source of truth for the store's categories.
// The header and mobile menus, search, the sidebar, the product pages, and the
// admin add/edit form all read from this file.
// The slug values are saved in the database and used in URLs, so don't rename
// them once products exist. Labels can be changed freely.

export type SubCategory = {
  slug: string;
  label: string;
};

export type MainCategory = {
  slug: string;
  label: string;
  children: readonly SubCategory[];
};

export const MAIN_CATEGORIES: readonly MainCategory[] = [
  {
    slug: "men",
    label: "Men",
    children: [
      { slug: "shirts", label: "Shirts" },
      { slug: "polos", label: "Polos" },
      { slug: "tees", label: "Tees" },
      { slug: "panjabi", label: "Panjabi" },
      { slug: "bottoms", label: "Bottoms" },
      { slug: "outerwear", label: "Outerwear" },
      { slug: "accessories", label: "Accessories" },
    ],
  },
  {
    slug: "women",
    label: "Women",
    children: [
      { slug: "sharee", label: "Sharee" },
      { slug: "3-piece", label: "3-Piece" },
      { slug: "tops", label: "Tops" },
      { slug: "bottoms", label: "Bottoms" },
      { slug: "dresses", label: "Dresses" },
      { slug: "outerwear", label: "Outerwear" },
      { slug: "accessories", label: "Accessories" },
    ],
  },
];

// Finds a main category by slug, or returns undefined if it isn't in the list.
export function getMainCategory(slug: string | null | undefined): MainCategory | undefined {
  return MAIN_CATEGORIES.find((c) => c.slug === slug);
}

// Finds a subcategory inside a main category.
// "bottoms" and "outerwear" exist under both Men and Women, so the main category is always needed.
export function getSubCategory(
  mainSlug: string | null | undefined,
  subSlug: string | null | undefined
): SubCategory | undefined {
  return getMainCategory(mainSlug)?.children.find((s) => s.slug === subSlug);
}

// True only when the category and subcategory pair is in the list above.
// The admin API uses this to reject anything else, even if the form is changed.
export function isValidCategoryPair(mainSlug: unknown, subSlug: unknown): boolean {
  return (
    typeof mainSlug === "string" &&
    typeof subSlug === "string" &&
    getSubCategory(mainSlug, subSlug) !== undefined
  );
}
