import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import GamingLaptops from "./pages/laptops"
import Tablets from "./pages/tablets"
import Phones from "./pages/phones"
import PageNotFound from "./pages/pageNotFound"
import Desktop from "./pages/desktop"
import ScrollToTop from "./components/ScrollToTop"
import { ThemeProvider } from "./context/ThemeContext"
import Footer from "./components/Footer"

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="h-screen flex flex-col">
          <main className="flex-grow overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gaminglaptops" element={<GamingLaptops />} />
              <Route path="/phones" element={<Phones />} />
              <Route path="/desktop" element={<Desktop />} />
              <Route path="/tablets" element={<Tablets />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
          <Footer whatsAppNumber="+234 805 471 7837" />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
