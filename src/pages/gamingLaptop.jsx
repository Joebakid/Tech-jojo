import data from "../data/laptops.json";
import ProductGrid from "../components/ProductGrid";
 

export default function Desktops() {
  return ( <ProductGrid
        title="gaming laptops"
        pageSize={8}
        sheetCsvUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vTYg3-LbibWCpecanR1TGzoNWUOnLAgbDVU1H_I0KsuXxoO444jKUt1P2LTYrxc_WkapaAMj6ozIgQ8/pub?output=csv"
        whatsAppNumber="+234 805 471 7837"
      />)
}
