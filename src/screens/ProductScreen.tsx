import { useMemo, useState } from "react";
import { PRODUCT_CATEGORIES, type CategoryName } from "../components/chatbot/data/products";
import {
  findProductNodeById,
  type TopCategoryId,
} from "../components/chatbot/productTree";

interface ProductScreenProps {
  categoryId: TopCategoryId;
  onBack: () => void;
}

const CATEGORY_ID_TO_NAME: Record<TopCategoryId, CategoryName> = {
  personal: "Personal",
  business: "Business",
  savings: "Savings & Investment",
};

export default function ProductScreen({ categoryId, onBack }: ProductScreenProps) {
  const categoryNode = findProductNodeById(categoryId);
  const categoryName = CATEGORY_ID_TO_NAME[categoryId];
  const products = PRODUCT_CATEGORIES[categoryName];
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const headerLabel = useMemo(
    () => categoryNode?.label ?? categoryName,
    [categoryNode?.label, categoryName],
  );

  return (
    <div className="flex flex-col w-full h-full bg-white">

      {/* HEADER */}
      <div className="h-14 bg-primary text-white flex items-center px-4">
        <button onClick={onBack} className="mr-3 text-xl">←</button>
        <h2 className="text-lg font-semibold">{headerLabel}</h2>
      </div>

      {/* PRODUCTS */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-3">Select a product to continue.</div>
          <div className="flex flex-wrap items-start justify-start gap-x-3 gap-y-2">
            {products.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  setSelectedProduct((current) => (current === label ? null : label))
                }
                title={label}
                style={
                  selectedProduct === label
                    ? { backgroundColor: "var(--color-primary-dark)", color: "#FFFFFF" }
                    : undefined
                }
                className={
                  selectedProduct === label
                    ? "inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium border transition max-w-full truncate"
                    : "inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium bg-white text-primary border border-primary/40 hover:bg-primary/10 hover:border-primary transition max-w-full truncate"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
