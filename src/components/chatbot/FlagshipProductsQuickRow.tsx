import React, { useCallback, useRef } from "react";

const FLAGSHIP_PRODUCTS = [
  "Somesa Plus",
  "Saving Plan",
  "Family Life Protection",
  "Group Last Expense",
  "Group Life Cover",
  "Credit Life Cover",
  "Umbrella Pension Scheme",
] as const;

const SECOND_ROW_PRODUCTS = [
  "Car Insurance",
  "Travel",
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;

    // If the user is trying to scroll vertically while hovering this row,
    // translate it into horizontal scroll so hidden products are reachable.
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.ctrlKey) {
      // Prevent the messages list from consuming the wheel event.
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  }, []);

  return (
    <div
      ref={scrollerRef}
      className="floating-product-bar om-show-scrollbar flex-col"
      aria-label="Quick products"
      onWheel={handleWheel}
    >
      <div className="flex gap-2 w-max">
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

      <div className="flex gap-2 w-max">
        {SECOND_ROW_PRODUCTS.map((productName) => (
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
    </div>
  );
});
