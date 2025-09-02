import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

// ===== Helpers =====
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
    <div
      className={
        "rounded-2xl border bg-white shadow-sm " +
        "dark:bg-neutral-900 dark:border-neutral-800 " +
        className
      }
    >
      {children}
    </div>
  );
}

/** Image with spinner + error fallback */
function ImgWithLoader({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-neutral-800">
        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-neutral-800">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-neutral-700 dark:border-t-neutral-300" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
      />
    </div>
  );
}

// ===== CSV loader hook (still minimal splitter) =====
function useProductsFromSheet(sheetCsvUrl) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(!!sheetCsvUrl);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sheetCsvUrl) return;
    let cancelled = false;

    const parseCSV = (csv) => {
      const rows = csv.trim().split(/\r?\n/);
      if (rows.length === 0) return [];
      const headers = rows[0].split(",").map((h) => h.trim());
      const out = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        const cols = rows[i].split(",").map((c) => c.trim());
        const obj = {};
        headers.forEach((h, idx) => (obj[h] = cols[idx] ?? ""));
        if (obj.price) obj.price = Number(obj.price);
        if (typeof obj.tags === "string" && obj.tags.length) {
          obj.tags = obj.tags
            .split(/[|,]/)
            .map((t) => t.trim())
            .filter(Boolean);
        } else obj.tags = [];
        out.push(obj);
      }
      return out;
    };

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(sheetCsvUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const text = await res.text();
        if (!cancelled) setProducts(parseCSV(text));
      } catch (e) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sheetCsvUrl]);

  return { products, loading, error };
}

// ===== WhatsApp helpers (includes optional CSV columns) =====
function productToWhatsAppText(p) {
  const lines = [
    "Hi! I'm interested in this product:",
    `• Name: ${p.name || "—"}`,
    p.brand ? `• Brand: ${p.brand}` : null,
    p.display ? `• Display: ${p.display}` : null,
    p.cpu ? `• CPU: ${p.cpu}` : null,
    p.ram ? `• RAM: ${p.ram}` : null,
    p.storage ? `• Storage: ${p.storage}` : null,
    p.gpu ? `• Graphics: ${p.gpu}` : null,
    p.keyboard ? `• Keyboard: ${p.keyboard}` : null,
    p.security ? `• Security: ${p.security}` : null,
    p.condition ? `• Condition: ${p.condition}` : null,
    p.delivery ? `• Delivery: ${p.delivery}` : null,
    p.bundle ? `• Bundle: ${p.bundle}` : null,
    p.price != null ? `• Price: ${formatNaira(p.price)}` : null,
  ].filter(Boolean);
  return encodeURIComponent(lines.join("\n"));
}
function waLinkForProduct(p, phoneDigitsOnly) {
  return `https://wa.me/${phoneDigitsOnly}?text=${productToWhatsAppText(p)}`;
}

// ===== Main component =====
export default function ProductGrid({
  title = "Products",
  items = [],
  pageSize = 8,
  sheetCsvUrl,
  whatsAppNumber = "2348054717837",
}) {
  const { products: sheetItems, loading, error } =
    useProductsFromSheet(sheetCsvUrl);

  // normalize CSV rows -> product shape (with optional columns)
  const sourceItems = (sheetItems && sheetItems.length ? sheetItems : items).map(
    (p) => ({
      id: p.id ?? crypto.randomUUID(),
      name: p.name ?? p.title ?? "",
      brand: p.brand ?? "",
      price:
        typeof p.price === "number" ? p.price : Number(p.price) || undefined,
      img: p.img ?? p.image ?? p.imageUrl ?? "",
      cpu: p.cpu ?? "",
      ram: p.ram ?? "",
      storage: p.storage ?? "",
      gpu: p.gpu ?? "",
      category: p.category ?? "",
      // optional columns from CSV (use safe fallbacks + synonyms)
      display: p.display ?? p.screen ?? "",
      keyboard: p.keyboard ?? "",
      security: p.security ?? "",
      condition: p.condition ?? "",
      delivery: p.delivery ?? p.deliver ?? "",
      bundle: p.bundle ?? p.extras ?? "",
      tags: Array.isArray(p.tags)
        ? p.tags
        : typeof p.tags === "string"
        ? p.tags.split(/[|,]/).map((t) => t.trim())
        : [],
    })
  );

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sourceItems;
    return sourceItems.filter((p) => {
      const inName = (p.name || "").toLowerCase().includes(needle);
      const inBrand = (p.brand || "").toLowerCase().includes(needle);
      const inCat = (p.category || "").toLowerCase().includes(needle);
      const inTags =
        Array.isArray(p.tags) &&
        p.tags.join(" ").toLowerCase().includes(needle);
      return inName || inBrand || inCat || inTags;
    });
  }, [sourceItems, q]);

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
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              ← Home
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sheetCsvUrl ? "Live products from Google Sheets." : "Static list."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 sm:w-80">
              <input
                value={q}
                onChange={onSearchChange}
                placeholder="Search name, brand, category…"
                className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-gray-400 placeholder:text-gray-400 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-neutral-500"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800"
                >
                  Clear
                </button>
              )}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {sheetCsvUrl && loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:bg-neutral-900 dark:border-neutral-800 dark:text-gray-300">
            Loading products…
          </div>
        ) : error ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-red-600 dark:bg-neutral-900 dark:border-neutral-800">
            Error: {error}
          </div>
        ) : current.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500 dark:bg-neutral-900 dark:border-neutral-800 dark:text-gray-300">
            No products found.
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {current.map((p) => (
        <Card key={p.id} className="overflow-hidden transition hover:shadow-lg flex flex-col h-full">
          <div className="w-full h-48 overflow-hidden">
            <ImgWithLoader src={p.img} alt={p.name} />
          </div>
          <div className="flex flex-col p-4 space-y-3 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold">{p.name}</h3>
              {p.brand && (
                <span className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 dark:border-neutral-700">
                  {p.brand}
                </span>
              )}
            </div>

            {/* Specs from CSV (all optional) */}
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 flex-1">
              {p.display && <div>🖥️Display: {p.display}</div>}
              {p.cpu && <div>💻CPU: {p.cpu}</div>}
              {p.ram && <div>🧠RAM: {p.ram}</div>}
              {p.storage && <div>💾Storage: {p.storage}</div>}
              {p.gpu && <div>🎮Graphics: {p.gpu}</div>}
              {p.keyboard && <div>⌨️Keyboard: {p.keyboard}</div>}
              {p.security && <div>Security: {p.security}</div>}
              {p.condition && <div>📦Condition: {p.condition}</div>}
              {p.delivery && <div>🚚Delivery: {p.delivery}</div>}
              {p.bundle && <div>🎁Bundle: {p.bundle}</div>}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">💸 Price: {p.price != null ? formatNaira(p.price) : "—"}</span>
            </div>

            <div className="mt-auto">
              <a
                href={waLinkForProduct(p, whatsAppNumber.replace(/[^\d]/g, ""))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
                title={`WhatsApp: ${whatsAppNumber}`}
              >
                Message
              </a>
            </div>
          </div>
        </Card>
      ))}
    </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing <b>{current.length}</b> of <b>{total}</b> item{total === 1 ? "" : "s"}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goto(1)}
              disabled={pageSafe === 1}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              « First
            </button>
            <button
              onClick={() => goto(pageSafe - 1)}
              disabled={pageSafe === 1}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              ‹ Prev
            </button>
            <span className="px-2 text-xs text-gray-700 dark:text-gray-300">
              Page <b>{pageSafe}</b> / <b>{pages}</b>
            </span>
            <button
              onClick={() => goto(pageSafe + 1)}
              disabled={pageSafe === pages}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Next ›
            </button>
            <button
              onClick={() => goto(pages)}
              disabled={pageSafe === pages}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Last »
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
