// src/components/filters/SpecSelect.jsx
export default function SpecSelect({ label, value, options, onChange, disabled = false }) {
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
        {(options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
