// src/components/Footer.jsx
import { Link } from "react-router-dom"

export default function Footer({
  className = "",
  whatsAppNumber = "+234 805 471 7837",
  fixed = false, // set to true to always pin to bottom of viewport
}) {
  const digits = whatsAppNumber.replace(/[^\d]/g, "")
  const position = fixed ? "fixed bottom-0 left-0 right-0 z-40" : "mt-auto"

  return (
    <footer
      className={`${position} w-full border-t border-neutral-800 bg-black/95 supports-[backdrop-filter]:bg-black/80 backdrop-blur ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">techjojo</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          
          <Link to="/GamingLaptops" className="hover:underline">
            Gaming Laptop
          </Link>
          <Link to="/Businesslaptop" className="hover:underline">
            Business Laptop
          </Link>
           <Link to="/desktop" className="hover:underline">
            Desktop
          </Link>
          <Link to="/Monitor" className="hover:underline">
           Monitor
          </Link>
         
          <Link to="/GamingAccessories" className="hover:underline">
            Gaming Accessories
          </Link>
        </nav>

        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noreferrer"
          title={`WhatsApp: ${whatsAppNumber}`}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-neutral-900"
        >
          WhatsApp
        </a>
      </div>
    </footer>
  )
}

 