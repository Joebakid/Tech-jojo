import data from "../data/phones.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid title="Business Laptop"  sheetCsvUrl='https://docs.google.com/spreadsheets/d/e/2PACX-1vQxW6gngjCF1L1wNTUdW-Bq9lTE5PBLAPVvQQKjvjFoiqvA9wDuqrPfFhcNTdImuF1V9-2g_ZDGzJEl/pub?output=csv' pageSize={8} />;
}
