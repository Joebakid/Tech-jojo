import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import GamingLaptops from "./pages/gamingLaptop"
import Monitor from "./pages/monitor"
import BusinessLaptop from "./pages/businesslaptop"
import PageNotFound from "./pages/pageNotFound"
import Desktop from "./pages/desktop"
import GamingAccessories from "./pages/gamingAccesories"
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
              <Route path="/Businesslaptop" element={<BusinessLaptop />} />
              <Route path="/desktop" element={<Desktop />} />
              <Route path="/Monitor" element={<Monitor />} />
              <Route path="/GamingAccessories" element={<GamingAccessories />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
          <Footer whatsAppNumber="+234 805 471 7837" />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
