import { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  BUSINESS_SUBCATEGORIES,
  PRODUCT_CATEGORIES,
  type BusinessSubcategoryId,
  type CategoryName,
} from "../components/chatbot/data/products";
import {
  findProductNodeById,
  productTree,
  type TopCategoryId,
} from "../components/chatbot/productTree";

interface ProductScreenProps {
  categoryId: TopCategoryId;
  onBack: () => void;
  onClose: () => void;
  onSendProduct?: (product: string) => void;
}

// Keep the display names centralized so the UI copy stays consistent.
const CATEGORY_ID_TO_NAME: Record<TopCategoryId, CategoryName> = {
  personal: "Personal",
  business: "Business",
  savings: "Savings & Investment",
};

export default function ProductScreen({ categoryId, onBack, onClose, onSendProduct }: ProductScreenProps) {
  // Look up the current top-level node (used for labels/navigation).
  const categoryNode = findProductNodeById(categoryId, productTree);
  const categoryName = CATEGORY_ID_TO_NAME[categoryId];

  // Business has an extra drill-down step (subcategory -> product).
  const [selectedBusinessSubcategory, setSelectedBusinessSubcategory] =
    useState<BusinessSubcategoryId | null>(null);

  // We store the selected button label since the chat payload is text.
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const headerLabel = useMemo(() => {
    // When drilling into Business, show the subcategory label as the header.
    if (categoryId === "business" && selectedBusinessSubcategory) {
      return BUSINESS_SUBCATEGORIES[selectedBusinessSubcategory].label;
    }

    // Fallback order: node label (if found) -> hardcoded category name.
    return categoryNode?.label ?? categoryName;
  }, [categoryId, categoryNode?.label, categoryName, selectedBusinessSubcategory]);

  const items = useMemo(() => {
    // Personal/Savings: the list is a straight category -> products mapping.
    if (categoryId !== "business") {
      return PRODUCT_CATEGORIES[categoryName];
    }

    // Business: first show subcategories, then show products for the chosen subcategory.
    if (!selectedBusinessSubcategory) {
      return Object.keys(BUSINESS_SUBCATEGORIES) as BusinessSubcategoryId[];
    }

    return BUSINESS_SUBCATEGORIES[selectedBusinessSubcategory].products;
  }, [categoryId, categoryName, selectedBusinessSubcategory]);

  // Convenience flag so rendering logic reads a bit cleaner.
  const isBusinessSubcategoryList = categoryId === "business" && !selectedBusinessSubcategory;

  return (
    <div className="flex flex-col w-full h-full bg-white">

      {/* Header: navigation and close */}
      <div className="h-14 bg-primary text-white flex items-center px-4">
        <button
          onClick={() => {
            // Inside Business: back takes you up one level (products -> subcategories).
            if (categoryId === "business" && selectedBusinessSubcategory) {
              setSelectedBusinessSubcategory(null);
              setSelectedProduct(null);
              return;
            }

            // Otherwise, delegate navigation to the parent screen.
            onBack();
          }}
          className="mr-3 text-xl cursor-pointer"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">{headerLabel}</h2>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          className="text-xl cursor-pointer"
          aria-label="Close"
        >
          <IoClose />
        </button>
      </div>

      {/* Product/subcategory selection */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-3">
            {isBusinessSubcategoryList ? "Select a subcategory." : "Select a product to continue."}
          </div>
          <div className="flex flex-wrap items-start justify-start gap-x-3 gap-y-2">
            {items.map((item) => {
              // For Business subcategories we convert the ID into a label for display.
              const label =
                isBusinessSubcategoryList
                  ? BUSINESS_SUBCATEGORIES[item as BusinessSubcategoryId].label
                  : (item as string);
              const isSelected = selectedProduct === label;

              return (
                <button
                  key={isBusinessSubcategoryList ? (item as string) : label}
                  type="button"
                  onClick={() => {
                    // Step 1 (Business only): selecting a subcategory swaps the list.
                    if (isBusinessSubcategoryList) {
                      setSelectedBusinessSubcategory(item as BusinessSubcategoryId);
                      setSelectedProduct(null);
                      return;
                    }

                    // Step 2: toggle product selection and optionally notify the chat flow.
                    setSelectedProduct((current) => {
                      const newValue = current === label ? null : label;
                      // Only send when a product is actively selected (not when deselecting).
                      if (onSendProduct && newValue) {
                        onSendProduct(newValue);
                      }
                      return newValue;
                    });
                  }}
                  title={label}
                  style={
                    isSelected
                      ? { backgroundColor: "var(--color-primary-dark)", color: "#FFFFFF" }
                      : undefined
                  }
                  className={
                    isSelected
                      ? "inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium border transition max-w-full truncate cursor-pointer"
                      : "inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium bg-white text-primary border border-primary/40 hover:bg-primary/10 hover:border-primary transition max-w-full truncate cursor-pointer"
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
