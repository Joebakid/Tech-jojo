import data from "../data/laptops.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid title="Laptops" items={data} pageSize={8} />;
}
