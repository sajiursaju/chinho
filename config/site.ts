export type Category = {
  label: string;
  value: string;
  children?: Category[];
};

// Old names, kept so existing imports keep working
export type SubCategory = Category;
export type ProductCategory = Category;

export const siteConfig = {
  name: "Chinho",
  announcement: "Free delivery on orders over ৳2,000 · 7-day easy exchange",
};

// One tree used everywhere: header menu, mobile menu, search, shop filter,
// admin product form. Up to 3 levels. Every `value` must be unique, and once
// products use a value, don't rename it (labels are safe to change).
export const productCategories: Category[] = [
  {
    label: "Women's & Girls' Fashion",
    value: "womens-fashion",
    children: [
      {
        label: "Clothing",
        value: "women-clothing",
        children: [
          { label: "Dresses", value: "womens-dresses" },
          { label: "Tops & Tees", value: "womens-tops" },
          { label: "Lingerie Sets", value: "women-lingerie-sets" },
          { label: "Kaftans", value: "women-kaftans" },
          { label: "Shrugs", value: "women-shrugs" },
          { label: "Shalwar Kameez & Ethnic", value: "women-shalwar-kameez" },
          { label: "Unstitched Fabric", value: "women-unstitched-fabric" },
          { label: "Blouses", value: "women-blouses" },
        ],
      },
      { label: "Girls' Wear", value: "girls-wear" },
    ],
  },
  {
    label: "Men's & Boys' Fashion",
    value: "mens-fashion",
    children: [
      {
        label: "Clothing",
        value: "men-clothing",
        children: [
          { label: "Shirts", value: "mens-shirts" },
          { label: "Pants & Jeans", value: "mens-pants" },
          { label: "T-Shirts & Polos", value: "men-tshirts-polos" },
          { label: "Panjabi & Kurta", value: "men-panjabi-kurta" },
        ],
      },
      { label: "Boys' Wear", value: "boys-wear" },
    ],
  },
  {
    label: "Baby Clothing",
    value: "baby-clothing",
  },
];

// Every valid slug at every level, used for validation
function collectValues(list: Category[]): string[] {
  return list.flatMap((c) => [c.value, ...collectValues(c.children ?? [])]);
}
export const allCategoryValues: string[] = collectValues(productCategories);

// Link tree for older code that reads `categories`
export type NavLink = { label: string; href: string; children?: NavLink[] };

function toLinks(list: Category[]): NavLink[] {
  return list.map((c) => ({
    label: c.label,
    href: `/products?category=${c.value}`,
    children: c.children?.length ? toLinks(c.children) : undefined,
  }));
}

export const categories: NavLink[] = [
  { label: "All Products", href: "/products" },
  ...toLinks(productCategories),
];

// Search bar dropdown: top-level categories only
export const searchCategories = [
  { label: "All", value: "" },
  ...productCategories.map((c) => ({ label: c.label, value: c.value })),
];

export const quickLinks = [
  { label: "Home", href: "/" },
  { label: "My Cart", href: "/cart" },
  { label: "My Orders", href: "/orders" },
  { label: "My Account", href: "/account" },
];

export const heroSlides = [
  {
    title: "New Men's Collection",
    subtitle: "Shirts, panjabi and more for every occasion",
    cta: "Shop now",
    href: "/products?category=mens-fashion",
    gradient: "from-indigo-600 to-violet-500",
    image: "",
  },
  {
    title: "New Fashion Arrivals",
    subtitle: "Fresh styles for every season",
    cta: "Explore",
    href: "/products?category=womens-fashion",
    gradient: "from-rose-500 to-orange-400",
    image: "",
  },
  {
    title: "Free Delivery Over ৳2,000",
    subtitle: "Plus 7-day easy exchange",
    cta: "Start shopping",
    href: "/products",
    gradient: "from-emerald-600 to-teal-500",
    image: "",
  },
];