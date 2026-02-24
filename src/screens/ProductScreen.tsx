import { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  GENERAL_INSURANCE_SUBCATEGORIES,
  PERSONAL_SUBCATEGORIES,
  SAVINGS_SUBCATEGORIES,
  PRODUCT_CATEGORIES,
  type CategoryName,
  type GeneralInsuranceSubcategoryId,
  type PersonalSubcategoryId,
  type SavingsSubcategoryId,
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
  personal: "Life Insurance",
  business: "General Insurance",
  savings: "Savings & Investment",
};

export default function ProductScreen({ categoryId, onBack, onClose, onSendProduct }: ProductScreenProps) {
  // Look up the current top-level node (used for labels/navigation).
  const categoryNode = findProductNodeById(categoryId, productTree);
  const categoryName = CATEGORY_ID_TO_NAME[categoryId];

  // Life Insurance has an optional drill-down (Group Benefits).
  const [selectedPersonalSubcategory, setSelectedPersonalSubcategory] =
    useState<PersonalSubcategoryId | null>(null);

  // General Insurance uses a drill-down by subcategory.
  const [selectedGeneralInsuranceSubcategory, setSelectedGeneralInsuranceSubcategory] =
    useState<GeneralInsuranceSubcategoryId | null>(null);

  // Savings & Investment has an optional drill-down (Unit Trusts).
  const [selectedSavingsSubcategory, setSelectedSavingsSubcategory] =
    useState<SavingsSubcategoryId | null>(null);

  // We store the selected button label since the chat payload is text.
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const headerLabel = useMemo(() => {
    if (categoryId === "personal" && selectedPersonalSubcategory) {
      return PERSONAL_SUBCATEGORIES[selectedPersonalSubcategory].label;
    }

    if (categoryId === "savings" && selectedSavingsSubcategory) {
      return SAVINGS_SUBCATEGORIES[selectedSavingsSubcategory].label;
    }

    if (categoryId === "business" && selectedGeneralInsuranceSubcategory) {
      return GENERAL_INSURANCE_SUBCATEGORIES[selectedGeneralInsuranceSubcategory].label;
    }

    // Fallback order: node label (if found) -> hardcoded category name.
    return categoryNode?.label ?? categoryName;
  }, [
    categoryId,
    categoryNode?.label,
    categoryName,
    selectedPersonalSubcategory,
    selectedGeneralInsuranceSubcategory,
    selectedSavingsSubcategory,
  ]);

  const items = useMemo(() => {
    if (categoryId === "business") {
      if (!selectedGeneralInsuranceSubcategory) {
        return Object.keys(GENERAL_INSURANCE_SUBCATEGORIES) as GeneralInsuranceSubcategoryId[];
      }
      return GENERAL_INSURANCE_SUBCATEGORIES[selectedGeneralInsuranceSubcategory].products;
    }

    if (categoryId === "savings" && selectedSavingsSubcategory) {
      return SAVINGS_SUBCATEGORIES[selectedSavingsSubcategory].products;
    }

    if (categoryId === "personal" && selectedPersonalSubcategory) {
      return PERSONAL_SUBCATEGORIES[selectedPersonalSubcategory].products;
    }
    return PRODUCT_CATEGORIES[categoryName];
  }, [
    categoryId,
    categoryName,
    selectedPersonalSubcategory,
    selectedGeneralInsuranceSubcategory,
    selectedSavingsSubcategory,
  ]);

  const isGeneralInsuranceSubcategoryList =
    categoryId === "business" && !selectedGeneralInsuranceSubcategory;

  return (
    <div className="flex flex-col w-full h-full bg-white">

      {/* Header: navigation and close */}
      <div className="h-14 shrink-0 bg-primary text-white flex items-center px-4">
        <button
          onClick={() => {
            // Inside General Insurance: back takes you up one level (products -> subcategories).
            if (categoryId === "business" && selectedGeneralInsuranceSubcategory) {
              setSelectedGeneralInsuranceSubcategory(null);
              setSelectedProduct(null);
              return;
            }

            // Inside Savings & Investment: back takes you up one level (products -> subcategory).
            if (categoryId === "savings" && selectedSavingsSubcategory) {
              setSelectedSavingsSubcategory(null);
              setSelectedProduct(null);
              return;
            }

            // Inside Life Insurance: back takes you up one level (products -> subcategory).
            if (categoryId === "personal" && selectedPersonalSubcategory) {
              setSelectedPersonalSubcategory(null);
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
            {isGeneralInsuranceSubcategoryList
              ? "Select a subcategory."
              : "Select a product to continue."}
          </div>
          <div className="flex flex-wrap items-start justify-start gap-x-3 gap-y-2">
            {categoryId === "personal" && !selectedPersonalSubcategory && (
              <button
                key="group-benefits"
                type="button"
                onClick={() => {
                  setSelectedPersonalSubcategory("group-benefits");
                  setSelectedProduct(null);
                }}
                title={PERSONAL_SUBCATEGORIES["group-benefits"].label}
                className="inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium bg-white text-primary border border-primary/40 hover:bg-primary/10 hover:border-primary transition max-w-full truncate cursor-pointer"
              >
                {PERSONAL_SUBCATEGORIES["group-benefits"].label}
              </button>
            )}

            {categoryId === "savings" && !selectedSavingsSubcategory && (
              <button
                key="unit-trusts"
                type="button"
                onClick={() => {
                  setSelectedSavingsSubcategory("unit-trusts");
                  setSelectedProduct(null);
                }}
                title={SAVINGS_SUBCATEGORIES["unit-trusts"].label}
                className="inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium bg-white text-primary border border-primary/40 hover:bg-primary/10 hover:border-primary transition max-w-full truncate cursor-pointer"
              >
                {SAVINGS_SUBCATEGORIES["unit-trusts"].label}
              </button>
            )}
            {items.map((item) => {
              const label = isGeneralInsuranceSubcategoryList
                ? GENERAL_INSURANCE_SUBCATEGORIES[item as GeneralInsuranceSubcategoryId].label
                : (item as string);
              const isSelected = selectedProduct === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    // General Insurance (step 1): selecting a subcategory swaps the list.
                    if (isGeneralInsuranceSubcategoryList) {
                      setSelectedGeneralInsuranceSubcategory(item as GeneralInsuranceSubcategoryId);
                      setSelectedProduct(null);
                      return;
                    }

                    // Toggle product selection and optionally notify the chat flow.
                    // Map 'Motor Private' to 'Motor Private Insurance' for backend compatibility
                    const mappedLabel =
                      label === "Motor Private"
                        ? "Motor Private Insurance"
                        : label === "Motor 3rd Party"
                          ? "Motor 3rd Party"
                          : label;
                    setSelectedProduct((current) => {
                      const newValue = current === mappedLabel ? null : mappedLabel;
                      return newValue;
                    });
                    // Only send when a product is actively selected (not when deselecting).
                    if (onSendProduct && selectedProduct !== mappedLabel) {
                      onSendProduct(mappedLabel);
                    }
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
