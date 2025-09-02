import data from "../data/laptops.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return  <ProductGrid
        title="Laptop"
        pageSize={8}
        sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vTSI5V5vvhWGvaQZ7gixMGuLppQ3eWbG47Jtzy_QXNWKIiuFUr4YelYtRpzbDFMsGsiF3a1Q1j25cn5/pub?gid=0&single=true&output=csv"
        whatsAppNumber="+234 805 471 7837"
      />;
}
