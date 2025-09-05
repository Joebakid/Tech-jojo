import data from "../data/gaming.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return  <ProductGrid
        title="gaming accesories"
        pageSize={8}
     sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vSsLafTJKrbBBRbcyq2w6J8TEQvMI3ZjqeSXshV-RZeD0tBPsWBC8oP_Clz59e9PMNAzYdjcnDWu_-x/pub?output=csv"
      />;
}
