export const PRODUCT_CATEGORIES = {
  Life: [
    "Personal Accident",
    "Serenicare",
    "Professional Liability",
    "Family Life Protection",
    "Travel Sure Plus",
    "Domestic Package",
    "Motor Private Insurance",
    "Motor COMESA Insurance",
  ],

  // General Insurance products are displayed via BUSINESS_SUBCATEGORIES below.
  "General Insurance": [],

  "Savings & Investment": [
    // Savings & Investment
    "SOMESA Education Plan",
    "Sure Deal Savings Plan",
    "Dollar Unit Trust Fund",
    "Private Wealth Management",

    // Investment Products
    "Money Market Fund",
    "Umbrella Trust Fund",
    "Balanced Fund",
  ],
} as const;

export type CategoryName = keyof typeof PRODUCT_CATEGORIES;

export type BusinessSubcategoryId = "solutions" | "group-benefits" | "general-insurance";

export const BUSINESS_SUBCATEGORIES: Record<
  BusinessSubcategoryId,
  { label: string; products: readonly string[] }
> = {
  solutions: {
    label: "Solutions",
    products: [
      "Investment & Advisory",
      "Office Compact",
      "SME Medical Cover",
      "SME Life Pack",
    ],
  },
  "group-benefits": {
    label: "Group Benefits",
    products: [
      "Group Life Cover",
      "Credit Life Cover",
      "Combined Solutions",
      "Group Last Expense",
      "Group Personal Accident",
      "Umbrella Pension Scheme",
      "Group Medical (Standard)",
    ],
  },
  "general-insurance": {
    label: "General Insurance",
    products: [
      "Burglary",
      "Crop Insurance",
      "All Risks Cover",
      "Money Insurance",
      "Fidelity Guarantee",
      "Livestock Insurance",
      "Public Liability",
      "Carriers Liability",
      "Motor Commercial",
      "Goods in Transit",
      "Industrial All Risks",
      "Product Liability",
      "Bankers Blanket Bond",
      "Business Interruption",
      "Fire & Special Perils",
      "Directors & Officers Liability",
      "Marine (Open Cover, Hull, Cargo)",
    ],
  },
} as const;
