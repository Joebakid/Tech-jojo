import { useMemo, useState } from "react";
import { Link } from "react-router-dom"; // for Home button

function formatNaira(n) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₦${(n ?? 0).toLocaleString()}`;
  }
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/** Image with a HAND-CODED spinner + error fallback (no imports) */
function ImgWithLoader({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-100">
        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-gray-100">
      {/* custom spinner overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
      />
    </div>
  );
}

export default function ProductGrid({
  title = "Products",
  items = [],
  pageSize = 8,
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((p) => {
      const inName = (p.name || "").toLowerCase().includes(needle);
      const inBrand = (p.brand || "").toLowerCase().includes(needle);
      const inCat = (p.category || "").toLowerCase().includes(needle);
      const inTags =
        Array.isArray(p.tags) &&
        p.tags.join(" ").toLowerCase().includes(needle);
      return inName || inBrand || inCat || inTags;
    });
  }, [items, q]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, pages);
  const start = (pageSafe - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  function goto(p) {
    setPage(Math.min(Math.max(1, p), pages));
  }

  function onSearchChange(e) {
    setQ(e.target.value);
    if (page !== 1) setPage(1);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100"
            >
              ← Home
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500">Search and browse by page.</p>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              value={q}
              onChange={onSearchChange}
              placeholder="Search name, brand, category…"
              className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-gray-400"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Clear
              </button>
            )}
          </div>
        </header>

        {current.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {current.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden transition hover:shadow-lg"
              >
                <ImgWithLoader src={p.img} alt={p.name} />
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="line-clamp-1 text-base font-semibold">
                      {p.name}
                    </h3>
                    {p.brand && (
                      <span className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] text-gray-600">
                        {p.brand}
                      </span>
                    )}
                  </div>

                  <div className="min-h-[2.5rem] text-xs text-gray-600">
                    {p.cpu && <div>CPU: {p.cpu}</div>}
                    {p.ram && <div>RAM: {p.ram}</div>}
                    {p.storage && <div>Storage: {p.storage}</div>}
                    {p.gpu && <div>GPU: {p.gpu}</div>}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold">
                      {p.price != null ? formatNaira(p.price) : "—"}
                    </span>
                    <button className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                      View
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing <b>{current.length}</b> of <b>{total}</b> item
            {total === 1 ? "" : "s"}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goto(1)}
              disabled={pageSafe === 1}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
            >
              « First
            </button>
            <button
              onClick={() => goto(pageSafe - 1)}
              disabled={pageSafe === 1}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
            >
              ‹ Prev
            </button>
            <span className="px-2 text-xs text-gray-700">
              Page <b>{pageSafe}</b> / <b>{pages}</b>
            </span>
            <button
              onClick={() => goto(pageSafe + 1)}
              disabled={pageSafe === pages}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
            >
              Next ›
            </button>
            <button
              onClick={() => goto(pages)}
              disabled={pageSafe === pages}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
            >
              Last »
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
