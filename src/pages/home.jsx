import { Link } from "react-router-dom"
import { ArrowRight, Laptop, Smartphone, Cable, Tablet , Gamepad2, TvIcon} from "lucide-react"
import ThemeToggle from "../components/ThemeToggle" // adjust path if needed

// --- Minimal Card shim (now theme-aware) ---
function Card({ children, className = "" }) {
  return (
    <div
      className={"rounded-2xl border bg-white shadow-sm " + "dark:bg-neutral-900 dark:border-neutral-800 " + className}
    >
      {children}
    </div>
  )
}
function CardHeader({ children, className = "" }) {
  return <div className={`px-5 pt-5 ${className}`}>{children}</div>
}
function CardTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
}
function CardContent({ children, className = "" }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>
}
// --------------------------------------------------------

const tiles = [
  {
    to: "/GamingLaptops",
    title: "gaming laptops",
    // Intel ° Nvidia ° RGB
    subtitle: "Intel • Nvidia • RGB",
    Icon: Laptop,
    accent: "from-blue-500/20 to-blue-500/0 dark:from-blue-400/10 dark:to-transparent",
  },
  {
    to: "/Businesslaptop",
    title: "business laptops",
    subtitle: "HP •  Dell • Lenovo",
    Icon: Smartphone,
    accent: "from-emerald-500/20 to-emerald-500/0 dark:from-emerald-400/10 dark:to-transparent",
  },
  {
    to: "/desktop",
    title: "desktops",
    subtitle: "Towers • All-in-Ones • Mini PCs",
    Icon: Cable,
    accent: "from-amber-500/20 to-amber-500/0 dark:from-amber-400/10 dark:to-transparent",
  },
  {
    to: "/Monitor",
    title: "monitors",
    // Samsung ° AoC ° High Refresh Rate
    subtitle: "Samsung • AoC • High Refresh Rate",
    Icon: TvIcon,
    accent: "from-purple-500/20 to-purple-500/0 dark:from-purple-400/10 dark:to-transparent",
  },
  {
    to: "/GamingAccessories",
    title: "gaming accesories",
    // Samsung ° AoC ° High Refresh Rate
    subtitle: "Joystick • Xbox controller • Gaming Mouse",
    Icon: Gamepad2,
    accent: "from-yellow-900/20 to-emerald-500/0 dark:from-green-100/10 dark:to-transparent",
  },
]

export default function Home() {
  return (
    <main className="bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <section className="mx-auto max-w-6xl px-4 py-10 min-h-screen">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">techjojo's</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pick a category to browse products.</p>
          </div>
          <ThemeToggle />
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tiles.map(({ to, title, subtitle, Icon, accent }) => (
            <Link key={to} to={to} className="group">
              <Card className="relative h-48 overflow-hidden transition hover:shadow-lg">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span
                      className={
                        "inline-flex h-10 w-10 items-center justify-center rounded-xl border " +
                        "bg-gray-50 dark:bg-neutral-800 " +
                        "border-gray-200 dark:border-neutral-700"
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-24 items-end justify-between">
                  <p className="max-w-[75%] text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs " +
                      "text-gray-600 dark:text-gray-300 " +
                      "border-gray-200 dark:border-neutral-700 " +
                      "transition group-hover:translate-x-1"
                    }
                  >
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
  )
}
