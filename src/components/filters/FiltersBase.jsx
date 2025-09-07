// src/components/filters/FiltersBase.jsx
import { useState } from "react";
import SpecSelect from "./SpecSelect";

function caseFindHeader(headers, candidates) {
  const lowers = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const i = lowers.indexOf(String(c).toLowerCase());
    if (i !== -1) return headers[i];
  }
  return null;
}

/**
 * keys: Array<string|{ key: string, label?: string, aliases?: string[] }>
 */
export default function FiltersBase({
  title = "Filters",
  headers,
  facets,
  filters,
  onChange,
  clear,
  keys,
}) {
  const [open, setOpen] = useState(true);
  const activeCount = Object.entries(filters).filter(([k, v]) => v && (facets?.[k] || []).length).length;

  return (
    <div className="rounded-2xl border bg-white shadow-sm dark:bg-neutral-900 dark:border-neutral-800 mb-4 p-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          <span className="font-semibold">{title}</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
              {activeCount}
            </span>
          )}
          <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <button
          onClick={clear}
          className="text-xs rounded-md border px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
          title="Reset all filters"
        >
          Reset
        </button>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(keys || []).map((entry) => {
            const cfg = typeof entry === "string" ? { key: entry } : entry;
            const { key, label, aliases = [] } = cfg;
            const actual = caseFindHeader(headers, [key, ...aliases]);
            const options = actual ? facets?.[actual] || [] : [];
            const value = actual ? filters?.[actual] || "" : "";

            return (
              <SpecSelect
                key={key}
                label={label || key}
                value={value}
                options={options}
                onChange={(v) => actual && onChange(actual, v)}
                disabled={!actual || options.length === 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
