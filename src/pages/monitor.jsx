import data from "../data/tablets.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid title="Monitors" items={data} pageSize={8} />;
}
