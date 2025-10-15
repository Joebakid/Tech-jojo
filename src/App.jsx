
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/home";
import GamingLaptops from "./pages/gamingLaptop";
import Monitor from "./pages/monitor";
import BusinessLaptop from "./pages/businesslaptop";
import PageNotFound from "./pages/pageNotFound";
import Desktop from "./pages/desktop";
import Macbooks from "./pages/macbook";
import GamingAccessories from "./pages/gamingAccesories";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./context/ThemeContext";
import Footer from "./components/Footer";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Analytics />
        <ScrollToTop />
        {/* Let the whole page scroll; footer sits at bottom when short */}
        <div className="min-h-screen flex flex-col">  {/* was h-screen */}
          <main className="flex-1">                  {/* removed id + overflow-auto */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gaminglaptops" element={<GamingLaptops />} />
              <Route path="/businesslaptops" element={<BusinessLaptop />} />
              <Route path="/desktops" element={<Desktop />} />
              <Route path="/macbooks" element={<Macbooks />} />
              <Route path="/monitors" element={<Monitor />} />
              <Route path="/gamingaccessories" element={<GamingAccessories />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>

          {/* Footer is after main, so it’s at the bottom but NOT fixed */}
          <Footer whatsAppNumber="+234 805 471 7837" />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
