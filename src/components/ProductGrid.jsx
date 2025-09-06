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

/** forgiving normalization for search and matching */
function normalize(v) {
  return String(v ?? "")
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

// ===== CSV loader hook (returns headers + rows) =====
function useProductsFromSheet(sheetCsvUrl) {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(!!sheetCsvUrl);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sheetCsvUrl) return;
    let cancelled = false;

    // Simple CSV parser (assumes no quoted commas)
    const parseCSV = (csv) => {
      const lines = csv.trim().split(/\r?\n/);
      if (lines.length === 0) return { headers: [], rows: [] };
      const headers = lines[0].split(",").map((h) => h.trim());
      const out = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line?.trim()) continue;
        const cols = line.split(",").map((c) => c.trim());
        const obj = {};
        headers.forEach((h, idx) => (obj[h] = cols[idx] ?? ""));
        // small conveniences
        if ("price" in obj && obj.price !== "") {
          const n = Number(obj.price);
          obj.price = Number.isFinite(n) ? n : obj.price;
        }
        if (typeof obj.tags === "string" && obj.tags.length) {
          obj.tags = obj.tags
            .split(/[|,]/)
            .map((t) => t.trim())
            .filter(Boolean);
        }
        out.push(obj);
      }
      return { headers, rows: out };
    };

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(sheetCsvUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const text = await res.text();
        if (cancelled) return;
        const parsed = parseCSV(text);
        setHeaders(parsed.headers);
        setRows(parsed.rows);
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

  return { headers, rows, loading, error };
}

// ===== WhatsApp helpers (dynamic from headers) =====
function productToWhatsAppText(p, headers) {
  const lines = ["Hi! I'm interested in this product:"];
  headers.forEach((h) => {
    const v = p[h];
    const out =
      v == null || v === ""
        ? "-"
        : Array.isArray(v)
        ? v.join(", ")
        : h.toLowerCase() === "price" && typeof v === "number"
        ? formatNaira(v)
        : String(v);
    lines.push(`• ${h}: ${out}`);
  });
  return encodeURIComponent(lines.join("\n"));
}
function waLinkForProduct(p, phoneDigitsOnly, headers) {
  return `https://wa.me/${phoneDigitsOnly}?text=${productToWhatsAppText(
    p,
    headers
  )}`;
}

// ===== Main component =====
export default function ProductGrid({
  title = "Products",
  items = [],
  pageSize = 3,
  sheetCsvUrl,
  whatsAppNumber = "2348054717837",
}) {
  const { headers: csvHeaders, rows: csvRows, loading, error } =
    useProductsFromSheet(sheetCsvUrl);

  // Which dataset is active?
  const usingCsv = !!sheetCsvUrl;
  const activeRows = usingCsv ? csvRows : items;

  // Build the header list:
  // - If CSV provided, use CSV header order exactly
  // - Else derive from first item keys (stable enough)
  const headers = useMemo(() => {
    if (usingCsv) return csvHeaders || [];
    if (!activeRows || !activeRows.length) return [];
    return Object.keys(activeRows[0]);
  }, [usingCsv, csvHeaders, activeRows]);

  // UI state (declare before use)
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewAlt, setPreviewAlt] = useState("");
  const closePreview = () => {
    setPreviewSrc("");
    setPreviewAlt("");
  };

  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1); // page declared before any effect that calls setPage
  const pageSizeSafe = Math.max(1, pageSize);

  // ref for scrolling to the top of the product section
  const topRef = useRef(null);

  // Normalize each row: ensure every header exists, fill missing with "-"
  // Also compute helper fields for UI (image, name, brand)
  const sourceItems = useMemo(() => {
    const result = (activeRows || []).map((row) => {
      const o = {};
      headers.forEach((h) => {
        let val = row[h];
        if (h.toLowerCase() === "price") {
          if (val === undefined || val === "") {
            o[h] = "-";
          } else {
            const n = Number(val);
            o[h] = Number.isFinite(n) ? n : String(val);
          }
        } else if (h.toLowerCase() === "tags") {
          if (Array.isArray(row[h])) o[h] = row[h];
          else if (typeof row[h] === "string" && row[h].trim()) {
            o[h] = row[h].split(/[|,]/).map((t) => t.trim()).filter(Boolean);
          } else {
            o[h] = "-";
          }
        } else {
          o[h] = val === undefined || val === "" ? "-" : val;
        }
      });
      // helpers
      const nameKey = headers.find((h) => h.toLowerCase() === "name") || null;
      const brandKey = headers.find((h) => h.toLowerCase() === "brand") || null;
      const imgKey =
        headers.find((h) => h.toLowerCase() === "img") ||
        headers.find((h) => h.toLowerCase() === "image") ||
        headers.find((h) => h.toLowerCase() === "imageurl") ||
        headers.find((h) => h.toLowerCase() === "image_url") ||
        null;

      o.__id = String(row.id ?? row.ID ?? crypto.randomUUID());
      o.__name = nameKey ? String(o[nameKey]) : "-";
      o.__brand = brandKey ? String(o[brandKey]) : "-";
      o.__img = imgKey ? String(o[imgKey]) : "-";
      return o;
    });
    return result;
  }, [activeRows, headers]);

  // Build facets DYNAMICALLY from headers
  // (We skip 'img' because it's a URL; everything else is allowed)
  const facets = useMemo(() => {
    const out = {};
    const skip = new Set(["img", "image", "imageurl", "image_url"]);
    const keys = headers.filter((h) => !skip.has(h.toLowerCase()));

    const maps = Object.fromEntries(keys.map((k) => [k, new Map()]));
    for (const row of sourceItems) {
      for (const k of keys) {
        let v = row[k];
        if (Array.isArray(v)) v = v.join(", "); // arrays -> string
        if (v === "-" || v == null || v === "") continue;
        const norm = normalize(String(v));
        const label = String(v);
        const hit = maps[k].get(norm);
        if (hit) hit.count += 1;
        else maps[k].set(norm, { label, count: 1 });
      }
    }

    for (const k of keys) {
      const arr = Array.from(maps[k].values())
        .sort((a, b) => {
          const la = String(a.label);
          const lb = String(b.label);
          return b.count - a.count || la.localeCompare(lb);
        })
        .map((v) => String(v.label));
      out[k] = arr.length > 1 ? arr : []; // show dropdown only if > 1 choice
    }
    return out;
  }, [headers, sourceItems]);

  // Filters state mirrors headers (skip 'img')
  const [filters, setFilters] = useState({});
  useEffect(() => {
    const skip = new Set(["img", "image", "imageurl", "image_url"]);
    setFilters((prev) => {
      const next = {};
      headers.forEach((h) => {
        if (!skip.has(h.toLowerCase())) next[h] = prev[h] ?? "";
      });
      return next;
    });
  }, [headers]);

  const onSpecChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const clearSpecs = () =>
    setFilters(Object.fromEntries(Object.keys(filters).map((k) => [k, ""])));

  const activeFiltersCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v && facets[k]?.length).length,
    [filters, facets]
  );

  // Reset page when search/filters change
  useEffect(() => {
    setPage(1);
  }, [q, filters]);

  // search + filter
  const filtered = useMemo(() => {
    const needle = normalize(q);
    return sourceItems.filter((row) => {
      // search across all headers
      const hay = headers
        .map((h) => {
          const v = row[h];
          return Array.isArray(v) ? v.join(" ") : v === "-" ? "" : String(v);
        })
        .map(normalize)
        .join(" ");
      const searchMatch = !needle || hay.includes(needle);

      // filters (exact match, case-insensitive)
      const specsMatch = Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        if (!facets[key]?.length) return true;
        let v = row[key];
        if (Array.isArray(v)) v = v.join(", ");
        return normalize(String(v)) === normalize(String(val));
      });

      return searchMatch && specsMatch;
    });
  }, [sourceItems, headers, q, filters, facets]);

  // pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSizeSafe));
  const pageSafe = Math.min(page, pages);
  const start = (pageSafe - 1) * pageSizeSafe;
  const current = filtered.slice(start, start + pageSizeSafe);

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

  // numbered pagination window (with ellipses)
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
    for (let i = Math.max(pages - boundaries + 1, boundaries + 1); i <= pages; i++)
      if (i >= 1) items.push(i);

    return items.filter(
      (v, i, arr) =>
        v === "…" ||
        (typeof v === "number" && v >= 1 && v <= pages && arr.indexOf(v) === i)
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
              Browse through our catalogue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 sm:w-80">
              <input
                value={q}
                onChange={onSearchChange}
                placeholder='Search by any header e.g. "144Hz", "8GB", "Dell"…'
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

        {/* Filters from CSV headers */}
        <Card className="mb-4 p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <span className="font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              onClick={clearSpecs}
              className="text-xs rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
              title="Reset all filters"
            >
              Reset
            </button>
          </div>

          {filtersOpen && headers.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {headers
                .filter((h) => !["img", "image", "imageurl", "image_url"].includes(h.toLowerCase()))
                .map((key) =>
                  facets[key] && facets[key].length > 0 ? (
                    <SpecSelect
                      key={key}
                      label={key}
                      value={filters[key] || ""}
                      options={facets[key]}
                      onChange={(v) => onSpecChange(key, v)}
                    />
                  ) : (
                    <SpecSelect
                      key={key}
                      label={key}
                      value=""
                      options={[]}
                      onChange={() => {}}
                      disabled
                    />
                  )
                )}
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
              <Card
                key={p.__id}
                className="overflow-hidden transition hover:shadow-lg flex flex-col h-full"
              >
                <div className="w-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (!p.__img || p.__img === "-") return;
                      setPreviewSrc(p.__img);
                      setPreviewAlt(p.__name);
                    }}
                    className="block w-full cursor-zoom-in"
                    title="Click to preview"
                  >
                    <ImgWithLoader src={p.__img !== "-" ? p.__img : ""} alt={p.__name} />
                  </button>
                </div>

                <div className="flex flex-col p-4 space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="line-clamp-1 text-base font-semibold">{p.__name || "-"}</h3>
                    {p.__brand && p.__brand !== "-" && (
                      <span className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 dark:border-neutral-700">
                        {p.__brand}
                      </span>
                    )}
                  </div>

                  {/* Dynamic spec list: EXACT headers → {header}: {data} */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 flex-1">
                    {headers
                      .filter((h) => h.toLowerCase() !== "img")
                      .map((h) => {
                        const v = p[h];
                        const out =
                          v == null || v === "-"
                            ? "-"
                            : Array.isArray(v)
                            ? v.join(", ")
                            : h.toLowerCase() === "price" && typeof v === "number"
                            ? formatNaira(v)
                            : String(v);
                        return (
                          <div key={h}>
                            {h}: {out}
                          </div>
                        );
                      })}
                  </div>

                  <div className="mt-auto">
                    <a
                      href={waLinkForProduct(p, whatsAppNumber.replace(/[^\d]/g, ""), headers)}
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

/** Select component for spec filters (auto options from CSV headers) */
function SpecSelect({ label, value, options, onChange, disabled = false }) {
  return (
    <label className="flex flex-col gap-1 text-[11px]">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border bg-white px-3 py-1.5 text-xs outline-none ring-0 transition disabled:opacity-50 focus:border-gray-400 dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100 dark:focus:border-neutral-500"
      >
        <option value="">Any</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
