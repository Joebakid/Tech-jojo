import data from "../data/gaming.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return  <ProductGrid
        title="gaming accesories"
        pageSize={8}
     items={data}
      />;
}
