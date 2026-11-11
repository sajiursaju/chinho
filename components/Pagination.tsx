import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  /** current search params (without `page`) to preserve filters */
  searchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
};

function buildHref(
  basePath: string,
  searchParams: Props["searchParams"],
  page: number
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  page,
  totalPages,
  searchParams,
  basePath = "/",
}: Props) {
  if (totalPages <= 1) return null;

  // Show a window of pages around the current page
  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(totalPages, page + windowSize);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const linkCls =
    "px-3 py-2 rounded-md border text-sm hover:bg-gray-100 transition";
  const activeCls = "bg-black text-white border-black hover:bg-black";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-8 flex-wrap"
    >
      {page > 1 && (
        <Link
          href={buildHref(basePath, searchParams, page - 1)}
          className={linkCls}
          rel="prev"
        >
          ← Prev
        </Link>
      )}

      {start > 1 && (
        <>
          <Link href={buildHref(basePath, searchParams, 1)} className={linkCls}>
            1
          </Link>
          {start > 2 && <span className="px-2 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, searchParams, p)}
          aria-current={p === page ? "page" : undefined}
          className={`${linkCls} ${p === page ? activeCls : ""}`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
          <Link
            href={buildHref(basePath, searchParams, totalPages)}
            className={linkCls}
          >
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link
          href={buildHref(basePath, searchParams, page + 1)}
          className={linkCls}
          rel="next"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}