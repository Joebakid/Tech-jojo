// src/pages/Laptops.jsx
import ProductGrid from "../components/ProductGrid";

export default function Laptops() {
  return (
    <ProductGrid
      title="Desktop"
      pageSize={8}
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vRbJAPJ_vCpSy2BECqmClWuCuxViYz_ms9r_BinNogvCpxDGvV8MStrMU72UqATCZgRLMnBo-GhJE-c/pub?gid=0&single=true&output=csv"
      whatsAppNumber="+234 805 471 7837"
    />
  );
}
