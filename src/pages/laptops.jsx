import data from "../data/laptops.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return  <ProductGrid
        title="Laptop"
        pageSize={8}
        sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vQwBvq3q6REo0pRC8uj20lGYzTQuAqKTQ_A_I-fuPCsKi_SJsV1TBbcl0RjO3y3ztvYwUyDhxDM7drJ/pub?gid=1182108333&single=true&output=csv"
        whatsAppNumber="+234 805 471 7837"
      />;
}
