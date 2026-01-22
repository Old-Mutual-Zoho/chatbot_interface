export const PRODUCT_CATEGORIES = {
  Personal: [
    "Motor Comprehensive Insurance",
    "Travel Insurance",
    "Life Insurance",
  ],

  Business: [
    "SME Business Cover",
    "Group Life Insurance",
    "Property Insurance",
  ],

  "Savings & Investment": [
    "Unit Trust Investments",
    "Education Savings Plan",
    "Retirement Savings Plan",
  ],
} as const;

export type CategoryName = keyof typeof PRODUCT_CATEGORIES;
