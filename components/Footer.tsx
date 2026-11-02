
import Link from "next/link";

const footerLinks = [
  {
    title: "Get to Know Us",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Our Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Sell with Us",
    links: [
      { label: "Sell Products", href: "/sell" },
      { label: "Affiliate Program", href: "/affiliate" },
      { label: "Become a Partner", href: "/partners" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Your Orders", href: "/orders" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#131921] text-gray-300">
      {/* Back to top */}
      <a
        href="#top"
        className="block bg-[#232f3e] py-4 text-center text-sm font-semibold text-white transition hover:bg-[#37475a]"
      >
        Back to top ↑
      </a>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="inline-block text-3xl font-extrabold tracking-tight text-white transition hover:opacity-80"
          >
            My<span className="text-orange-400">Store</span>.
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-7 text-gray-400">
            Your trusted destination for quality products, great prices,
            and a shopping experience you will love.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-400 px-5 py-3 text-sm font-bold text-gray-950 shadow-md transition duration-300 hover:-translate-y-1 hover:bg-orange-300"
          >
            Explore Products <span>→</span>
          </Link>
        </div>

        {/* Navigation */}
        {footerLinks.map((section) => (
          <div key={section.title}>
            <h3 className="mb-5 text-base font-bold text-white">
              {section.title}
            </h3>

            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition duration-200 hover:text-orange-400 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500">
            © {year} MyStore. All rights reserved.
          </p>

          <nav className="flex flex-wrap justify-center gap-5 text-xs text-gray-400">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link href="/cookies" className="transition hover:text-white">
              Cookie Settings
            </Link>
          </nav>

          <Link
            href="/contact"
            className="rounded-full border border-gray-600 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:border-orange-400 hover:text-orange-400"
          >
            Need Help? Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
