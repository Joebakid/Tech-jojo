import data from "../data/phones.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid title="Phones" items={data} pageSize={8} />;
}
