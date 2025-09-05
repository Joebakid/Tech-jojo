// src/pages/Laptops.jsx
import ProductGrid from "../components/ProductGrid";
 

export default function Laptops() {
  return (
    <>
      
    <ProductGrid
      title="desktops"
      pageSize={8}
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vSPuCdo6sGWyH86QZWQLNZLA7Ybd4x_KoxBLLpo0qdZjAlgkvuunJaP8hp_ELQHy5sT_4BG61C0SrIu/pub?output=csv"
      whatsAppNumber="+234 805 471 7837"
    />
    </>
  );
}
