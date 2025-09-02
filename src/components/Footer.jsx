// src/components/Footer.jsx
import { Link } from "react-router-dom";

// Footer follows the global theme (from ThemeProvider).
// No toggle here — the page's <ThemeToggle /> controls dark/light for the whole app.
export default function Footer({
  className = "",
  whatsAppNumber = "+234 805 471 7837",
}) {
  const digits = whatsAppNumber.replace(/[^\d]/g, "");

  return (
    <footer
      className={`border-t dark:border-neutral-800 ${className} bg-black`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            techjojo
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/laptops" className="hover:underline">
            Laptops
          </Link>
          <Link to="/phones" className="hover:underline">
            Phones
          </Link>
          <Link to="/tablets" className="hover:underline">
            Tablets
          </Link>
          <Link to="/desktop" className="hover:underline">
            Desktop
          </Link>
        </nav>

        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noreferrer"
          title={`WhatsApp: ${whatsAppNumber}`}
          className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 transition dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
        >
          WhatsApp
        </a>
      </div>
    </footer>
  );
}
