// src/components/ProductGrid.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, ChevronDown } from "lucide-react";
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

/** Normalize strings for forgiving matching (case/punctuation insensitive) */
function normalize(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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

/** Centered modal for image preview */
function ImagePreview({ src, alt, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // prevent body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="relative max-h-[85vh] max-w-[92vw]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 rounded-full bg-white p-1 shadow dark:bg-neutral-900"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={src}
          alt={alt || "Preview"}
          className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
        />
      </div>
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
  pageSize = 3,
  sheetCsvUrl,
  whatsAppNumber = "2348054717837",
}) {
  const { products: sheetItems, loading, error } =
    useProductsFromSheet(sheetCsvUrl);

  // image preview modal state
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewAlt, setPreviewAlt] = useState("");
  const closePreview = () => {
    setPreviewSrc("");
    setPreviewAlt("");
  };

  // ref for scrolling to the top of the product section
  const topRef = useRef(null);

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

  // spec filters (compact)
  const [filters, setFilters] = useState({
    display: "",
    cpu: "",
    ram: "",
    storage: "",
    gpu: "",
    keyboard: "",
    condition: "",
    delivery: "",
    bundle: "",
  });

  // filters collapsible (default collapsed to save space)
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    try {
      // If on very small screens, keep collapsed; on larger, you can open if you prefer:
      if (window.matchMedia && !window.matchMedia("(max-width: 640px)").matches) {
        // leave as default collapsed = false? keep collapsed for minimal footprint
      }
    } catch {}
  }, []);

  const onSpecChange = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const clearSpecs = () =>
    setFilters({
      display: "",
      cpu: "",
      ram: "",
      storage: "",
      gpu: "",
      keyboard: "",
      condition: "",
      delivery: "",
      bundle: "",
    });

  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter((v) => String(v).trim().length > 0).length,
    [filters]
  );

  useEffect(() => {
    // Reset to first page when filters/search change
    setPage(1);
  }, [q, filters]);

  const filtered = useMemo(() => {
    const needle = normalize(q);
    return sourceItems.filter((p) => {
      // broad search includes specs too
      const searchMatch =
        !needle ||
        [
          p.name,
          p.brand,
          p.category,
          p.display,
          p.cpu,
          p.ram,
          p.storage,
          p.gpu,
          p.keyboard,
          p.condition,
          p.delivery,
          p.bundle,
          Array.isArray(p.tags) ? p.tags.join(" ") : "",
        ]
          .map(normalize)
          .join(" ")
          .includes(needle);

      // spec filters (all filled fields must match)
      const specsMatch = Object.entries(filters).every(([key, val]) => {
        const qv = normalize(val);
        if (!qv) return true;
        return normalize(p[key]).includes(qv);
      });

      return searchMatch && specsMatch;
    });
  }, [sourceItems, q, filters]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, pages);
  const start = (pageSafe - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  function scrollToTopOfProducts() {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goto(p) {
    const next = Math.min(Math.max(1, p), pages);
    setPage(next);
    scrollToTopOfProducts();
  }

  function onSearchChange(e) {
    setQ(e.target.value);
  }

  // ---- Numbered pagination window (with ellipses) ----
  const pageItems = useMemo(() => {
    const items = [];
    const siblings = 1;
    const boundaries = 1;

    if (pages <= 1) return [1];

    const startPage = Math.max(
      boundaries + 1,
      Math.min(pageSafe - siblings, pages - boundaries - siblings * 2)
    );
    const endPage = Math.min(
      pages - boundaries,
      Math.max(pageSafe + siblings, boundaries + siblings * 2 + 1)
    );

    for (let i = 1; i <= Math.min(boundaries, pages); i++) items.push(i);
    if (startPage > boundaries + 1) items.push("…");
    for (let i = startPage; i <= endPage; i++) items.push(i);
    if (endPage < pages - boundaries) items.push("…");
    for (
      let i = Math.max(pages - boundaries + 1, boundaries + 1);
      i <= pages;
      i++
    )
      if (i >= 1) items.push(i);

    return items.filter(
      (v, i, arr) =>
        v === "…" || (typeof v === "number" && v >= 1 && v <= pages && arr.indexOf(v) === i)
    );
  }, [pages, pageSafe]);

  const from = total ? start + 1 : 0;
  const to = start + current.length;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      {/* Image Preview Modal */}
      {previewSrc && (
        <ImagePreview src={previewSrc} alt={previewAlt} onClose={closePreview} />
      )}

      {/* scroll-mt helps if you later use in-page links / sticky headers */}
      <section ref={topRef} className="mx-auto max-w-6xl px-4 py-10 scroll-mt-24">
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
              {/* {sheetCsvUrl ? "Live products from Google Sheets." : "Static list."} */}
              Browse through our catalogue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 sm:w-80">
              <input
                value={q}
                onChange={onSearchChange}
                placeholder='Search name, brand, category, or spec e.g. 14" HD, 4GB RAM…'
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

        {/* Spec Filters (compact + collapsible) */}
        <Card className="mb-4 p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
              title={filtersOpen ? "Hide filters" : "Show filters"}
            >
              <span className="font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>

            <button
              onClick={clearSpecs}
              className="text-xs rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
              title="Reset all spec filters"
            >
              Reset
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <SpecInput
                label="Display"
                value={filters.display}
                onChange={(v) => onSpecChange("display", v)}
                placeholder='e.g. 14" HD'
              />
              <SpecInput
                label="CPU"
                value={filters.cpu}
                onChange={(v) => onSpecChange("cpu", v)}
                placeholder="e.g. Intel Celeron N2840"
              />
              <SpecInput
                label="RAM"
                value={filters.ram}
                onChange={(v) => onSpecChange("ram", v)}
                placeholder="e.g. 4GB"
              />
              <SpecInput
                label="Storage"
                value={filters.storage}
                onChange={(v) => onSpecChange("storage", v)}
                placeholder="e.g. 250GB HDD"
              />
              <SpecInput
                label="Graphics"
                value={filters.gpu}
                onChange={(v) => onSpecChange("gpu", v)}
                placeholder="e.g. Intel HD Graphics"
              />
              <SpecInput
                label="Keyboard"
                value={filters.keyboard}
                onChange={(v) => onSpecChange("keyboard", v)}
                placeholder="e.g. Non-backlit"
              />
              <SpecInput
                label="Condition"
                value={filters.condition}
                onChange={(v) => onSpecChange("condition", v)}
                placeholder="e.g. Grade A Foreign Used"
              />
              <SpecInput
                label="Delivery"
                value={filters.delivery}
                onChange={(v) => onSpecChange("delivery", v)}
                placeholder="e.g. Free Nationwide Delivery"
              />
              <SpecInput
                label="Bundle"
                value={filters.bundle}
                onChange={(v) => onSpecChange("bundle", v)}
                placeholder="e.g. Laptop"
              />
            </div>
          )}
        </Card>

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
                <div className="w-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (!p.img) return;
                      setPreviewSrc(p.img);
                      setPreviewAlt(p.name);
                    }}
                    className="block w-full cursor-zoom-in"
                    title="Click to preview"
                  >
                    <ImgWithLoader src={p.img} alt={p.name} />
                  </button>
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
                    {p.display && <div>🖥️ Display: {p.display}</div>}
                    {p.cpu && <div>💻 CPU: {p.cpu}</div>}
                    {p.ram && <div>🧠 RAM: {p.ram}</div>}
                    {p.storage && <div>💾 Storage: {p.storage}</div>}
                    {p.gpu && <div>🎮 Graphics: {p.gpu}</div>}
                    {p.keyboard && <div>⌨️ Keyboard: {p.keyboard}</div>}
                    {p.security && <div>Security: {p.security}</div>}
                    {p.condition && <div>📦 Condition: {p.condition}</div>}
                    {p.delivery && <div>🚚 Delivery: {p.delivery}</div>}
                    {p.bundle && <div>🎁 Bundle: {p.bundle}</div>}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">
                      💸 Price: {p.price != null ? formatNaira(p.price) : "—"}
                    </span>
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

        {/* Numbered pagination */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing <b>{from}</b>–<b>{to}</b> of <b>{total}</b> item{total === 1 ? "" : "s"}
          </div>

          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => goto(pageSafe - 1)}
              disabled={pageSafe === 1}
              className="rounded-lg border px-2.5 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              title="Previous"
            >
              ‹
            </button>

            {pageItems.map((it, idx) =>
              it === "…" ? (
                <span
                  key={`dots-${idx}`}
                  className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={it}
                  onClick={() => goto(it)}
                  aria-current={it === pageSafe ? "page" : undefined}
                  className={
                    "rounded-lg border px-3 py-1.5 text-xs transition " +
                    (it === pageSafe
                      ? "bg-gray-900 text-white border-gray-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100"
                      : "hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800")
                  }
                >
                  {it}
                </button>
              )
            )}

            <button
              onClick={() => goto(pageSafe + 1)}
              disabled={pageSafe === pages}
              className="rounded-lg border px-2.5 py-1.5 text-xs disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              title="Next"
            >
              ›
            </button>
          </nav>
        </div>
      </section>
    </main>
  );
}

/** Small input component for spec filters (compact) */
function SpecInput({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-1 text-[11px]">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border bg-white px-3 py-1.5 text-xs outline-none ring-0 transition focus:border-gray-400 placeholder:text-gray-400 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-neutral-500"
      />
    </label>
  );
}
