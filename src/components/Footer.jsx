// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function Footer({
  className = "",
  whatsAppNumber = "+234 805 471 7837",
  fixed = true,
}) {
  const digits = whatsAppNumber.replace(/[^\d]/g, "");
  const position = fixed ? " " : "mt-auto";

  return (
    <footer
      className={`${position} w-full border-t border-neutral-800 bg-black/95 supports-[backdrop-filter]:bg-black/80 backdrop-blur ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">techjojo</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        {/* Techy   nav */}
        <nav className="flex flex-wrap items-center gap-4">
          <Link
            to="/GamingLaptops"
            className="font-orbitron uppercase tracking-wider hover:text-violet-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.65)] transition"
          >
            Gaming Laptop
          </Link>

          <Link
            to="/Businesslaptop"
            className="font-orbitron hover:text-emerald-300 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.55)] transition"
          >
            Business Laptop
          </Link>

          <Link
            to="/desktop"
            className="font-orbitron uppercase tracking-wide hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.55)] transition"
          >
            Desktop
          </Link>

          <Link
            to="/Monitor"
            className="font-orbitron uppercase tracking-wider hover:text-amber-300 hover:drop-shadow-[0_0_8px_rgba(252,211,77,0.55)] transition"
          >
            Monitor
          </Link>

          <Link
            to="/GamingAccessories"
            className="font-orbitron hover:text-fuchsia-300 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.55)] transition"
          >
            Gaming accessories
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noreferrer"
            title={`WhatsApp: ${whatsAppNumber}`}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-neutral-900"
          >
            WhatsApp
          </a>

          <a
            href="https://www.josephbawo.tech/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Visit Joseph Bawo's website"
            className="group inline-flex items-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-900/40 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-neutral-900 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
          >
            <span className="opacity-80 group-hover:opacity-100">Made by</span>
            <span className="font-semibold bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
              Joseph Bawo
            </span>
            <ExternalLink className="h-3.5 w-3.5 opacity-50 group-hover:opacity-90" />
          </a>
        </div>
      </div>
    </footer>
  );
}
