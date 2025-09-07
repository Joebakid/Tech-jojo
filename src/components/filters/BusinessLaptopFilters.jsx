// src/components/filters/BusinessLaptopFilters.jsx
import FiltersBase from "./FiltersBase";

export default function BusinessLaptopFilters(props) {
  const keys = [
    { key: "brand", label: "Brand" },
    // { key: "price", label: "Price" },
    { key: "display", label: "Display", aliases: ["screen", "screen size"] },
    { key: "cpu", label: "CPU", aliases: ["processor"] },
    { key: "ram", label: "RAM", aliases: ["memory"] },
    { key: "storage", label: "Storage", aliases: ["ssd", "hdd", "drive"] },
    { key: "gpu", label: "GPU", aliases: ["graphics"] },
    { key: "keyboard", label: "Keyboard", aliases: ["backlit"] },
    {
      key: "security",
      label: "Security",
      aliases: ["fingerprint", "tpm", "smart card"],
    },
    { key: "condition", label: "Condition" },
    { key: "delivery", label: "Delivery" },
    { key: "bundle", label: "Bundle" },
    { key: "category", label: "Category" },
    { key: "tags", label: "Tags" },
  ];
  return (
    <FiltersBase title="Filters — Business Laptops" keys={keys} {...props} />
  );
}
