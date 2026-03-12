import React from "react";

const FLAGSHIP_PRODUCTS = [
  "Somesa Plus",
  "Sure Deal",
  "Family Life Protection",
  "Group Last Expense",
  "Group Life Cover",
  "Credit Life Cover",
  "Umbrella Pension Scheme",
] as const;

const PRODUCT_BUTTON_CLASSNAME =
  "inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium bg-white text-primary border border-primary/40 hover:bg-primary/10 hover:border-primary transition max-w-full truncate cursor-pointer";

type FlagshipProductsQuickRowProps = {
  onSelect: (productName: string) => void;
  disabled?: boolean;
};

export const FlagshipProductsQuickRow = React.memo(function FlagshipProductsQuickRow({
  onSelect,
  disabled,
}: FlagshipProductsQuickRowProps) {
  return (
    <div className="floating-product-bar" aria-label="Flagship products">
      {FLAGSHIP_PRODUCTS.map((productName) => (
        <div key={productName} className="shrink-0">
          <button
            type="button"
            className={PRODUCT_BUTTON_CLASSNAME}
            onClick={() => onSelect(productName)}
            disabled={disabled}
          >
            {productName}
          </button>
        </div>
      ))}
    </div>
  );
});
