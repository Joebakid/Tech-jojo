import data from "../data/tablets.json";
import ProductGrid from "../components/ProductGrid";

export default function Desktops() {
  return <ProductGrid   title="monitors" sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5ft5ucwP62CICVLAdQ3mhbd_d-kVAADV-0smlETAwSyvo_4C4N8WF78P0ygmXd4QTLU8XmlTfFXUn/pub?output=csv" items={data} pageSize={8} />;
}
