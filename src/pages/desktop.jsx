// src/pages/Laptops.jsx
import ProductGrid from "../components/ProductGrid";

export default function Laptops() {
  return (
    <ProductGrid
      title="Desktop"
      pageSize={8}
      sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdtheOlj7I5IVDC5X4oSZ2AIMRp5Q1zno8jr4GcA13_-0ImJt31mOtxdwx--daJUySuvKrwe0K8xNG/pub?gid=0&single=true&output=csv"
      whatsAppNumber="+234 805 471 7837"
    />
  );
}
