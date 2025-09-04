import data from "../data/phones.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid title="Business Laptoop"  sheetCsvUrl='https://docs.google.com/spreadsheets/d/e/2PACX-1vSgt4FSA1zIyaDH3iCdhfLo8Uj9Yo_IhmRTX6O5KDVOmYghLtItxYt8zNxtjvuegLk65_gW7DhSilRh/pub?gid=840270659&single=true&output=csv' pageSize={8} />;
}
