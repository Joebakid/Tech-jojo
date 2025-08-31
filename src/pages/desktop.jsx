import data from "../data/desktop.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid title="Desktops" items={data} pageSize={8} />;
}
