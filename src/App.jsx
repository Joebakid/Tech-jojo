import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Laptops from "./pages/laptops";
import Tablets from "./pages/tablets";
import Phones from "./pages/phones";
import PageNotFound from "./pages/pageNotFound";
import Desktop from "./pages/desktop";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop /> {/* <- ensures each page starts at top */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/laptops" element={<Laptops />} />
        <Route path="/phones" element={<Phones />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/tablets" element={<Tablets />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
