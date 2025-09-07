// src/pages/Desktops.jsx
import ProductGrid from "../components/ProductGrid";
import DesktopFilters from "../components/filters/DesktopFilters";

export default function Desktops() {
  return (
    <ProductGrid
      title="Desktops"
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vT7RwRTOVgcoRrMtp6WhEzQDgjtO3aOX2HkzRl7rJm5zb6JIX0K1LPIsB8t-ASRKUUyc7Rp5W9G6iOf/pub?gid=475590999&single=true&output=csv"
      pageSize={8}
      whatsAppNumber="+234 805 471 7837"
      renderFilters={DesktopFilters}
    />
  );
}
