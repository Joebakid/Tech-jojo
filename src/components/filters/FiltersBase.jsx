// src/components/filters/FiltersBase.jsx
import { useMemo, useState } from "react";
import SpecSelect from "./SpecSelect";

function caseFindHeader(headers, candidates) {
  const lowers = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const i = lowers.indexOf(String(c).toLowerCase());
    if (i !== -1) return headers[i];
  }
  return null;
}

// --- cleaning helpers -------------------------------------------------
const JUNK = new Set(["", "-", "—", "n/a", "na", "any", "null", "undefined"]);

function cleanOne(v) {
  if (v == null) return "";
  let s = String(v)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  s = s
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();
  return s;
}
function isMeaningful(s) {
  const k = String(s || "").toLowerCase();
  return !JUNK.has(k);
}
function uniqueCaseInsensitive(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const key = String(x).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(x);
    }
  }
  return out;
}

export default function FiltersBase({
  title = "Filters",
  headers = [],
  facets = {},
  filters = {},
  onChange = () => {},
  clear = () => {},
  keys = [],
}) {
  const [open, setOpen] = useState(true);

  // Map config key -> actual CSV header (respecting aliases)
  const actualHeaderByConfigKey = useMemo(() => {
    const map = {};
    keys.forEach((entry) => {
      const cfg = typeof entry === "string" ? { key: entry } : entry;
      const { key, aliases = [] } = cfg;
      const actual = caseFindHeader(headers, [key, ...aliases]);
      if (actual) map[key] = actual;
    });
    return map;
  }, [headers, keys]);

  // Build clean, deduped, sorted options per actual header
  const optionsByHeader = useMemo(() => {
    const out = {};
    Object.values(actualHeaderByConfigKey).forEach((actual) => {
      const raw = facets?.[actual] || [];
      const cleaned = uniqueCaseInsensitive(
        raw.map(cleanOne).filter(isMeaningful),
      ).sort((a, b) => a.localeCompare(b));
      out[actual] = cleaned;
    });
    return out;
  }, [facets, actualHeaderByConfigKey]);

  // Count of active filters (only those with options and non-empty values)
  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([k, v]) => {
      const cleaned = cleanOne(v);
      const hasOptions = (optionsByHeader[k] || []).length > 0;
      return cleaned && isMeaningful(cleaned) && hasOptions;
    }).length;
  }, [filters, optionsByHeader]);

  return (
    <div className="mb-4 rounded-2xl border bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
        >
          <span className="font-semibold">{title}</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-1.5 text-[10px] font-medium text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
              {activeCount}
            </span>
          )}
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <button
          onClick={clear}
          className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
          title="Reset all filters"
        >
          Reset
        </button>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {keys.map((entry) => {
            const cfg = typeof entry === "string" ? { key: entry } : entry;
            const { key, label } = cfg;

            const actual = actualHeaderByConfigKey[key]; // resolved header
            const options = actual ? optionsByHeader[actual] || [] : [];

            // keep current value only if still valid
            const rawValue = actual ? filters[actual] : "";
            const valueClean = cleanOne(rawValue);
            const value = options.includes(valueClean) ? valueClean : "";

            return (
              <SpecSelect
                key={key}
                label={label || key}
                value={value}
                options={options}
                onChange={(v) => actual && onChange(actual, cleanOne(v))}
                disabled={!actual || options.length === 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
