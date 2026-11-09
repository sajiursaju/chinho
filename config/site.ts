// config/site.ts

export const siteConfig = {
  name: "chinho",
  slogan: "We don't design clothes... We design dreams 🌼🏵️",
  description:
    "chinho: men's and women's clothing with free delivery over ৳2,000 and 7-day easy exchange.",
  title: "chinho | We don't design clothes... We design dreams",
  announcement: "Free delivery on orders over ৳2,000 · 7-day easy exchange",
};

// Category links are not kept here. They come from config/categories.ts.
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
    href: "/products?category=men",
    gradient: "from-indigo-600 to-violet-500",
    image: "",
  },
  {
    title: "New Fashion Arrivals",
    subtitle: "Fresh styles for every season",
    cta: "Explore",
    href: "/products?category=women",
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