import { Link } from "react-router-dom";
import { ArrowRight, Laptop, Smartphone, Cable, Tablet } from "lucide-react";

// --- Minimal Card shim (no external imports/aliases) ---
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}
function CardHeader({ children, className = "" }) {
  return <div className={`px-5 pt-5 ${className}`}>{children}</div>;
}
function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
function CardContent({ children, className = "" }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}
// --------------------------------------------------------

const tiles = [
  {
    to: "/laptops",
    title: "Laptops",
    subtitle: "Ultrabooks • Gaming • Workstations",
    Icon: Laptop,
    accent: "from-blue-500/20 to-blue-500/0",
  },
  {
    to: "/phones",
    title: "Phones",
    subtitle: "Android • iPhone • Accessories",
    Icon: Smartphone,
    accent: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    to: "/desktop",
    title: "desktop",
    subtitle: "USB-C • Lightning • HDMI",
    Icon: Cable,
    accent: "from-amber-500/20 to-amber-500/0",
  },
  {
    to: "/tablets",
    title: "Tablets",
    subtitle: "iPad • Android • Stylus",
    Icon: Tablet,
    accent: "from-purple-500/20 to-purple-500/0",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gadgets</h1>
          <p className="text-sm text-gray-500">
            Pick a category to browse products.
          </p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tiles.map(({ to, title, subtitle, Icon, accent }) => (
            <Link key={to} to={to} className="group">
              <Card className="relative h-48 overflow-hidden transition hover:shadow-lg">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`}
                />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-gray-50">
                      <Icon className="h-5 w-5" />
                    </span>
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-24 items-end justify-between">
                  <p className="max-w-[75%] text-sm text-gray-500">
                    {subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-gray-600 transition group-hover:translate-x-1">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
