import data from "../data/tablets.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid title="tablets" items={data} pageSize={8} />;
}
