export const PRODUCT_CATEGORIES = {
  "Life Insurance": [
    // Life Insurance (non-Group Benefits)
  "SOMESA Education Plan",
  "Sure Deal Savings Plan",    
  ],

  // General Insurance products are displayed via GENERAL_INSURANCE_SUBCATEGORIES below.
  "General Insurance": [],

  "Savings & Investment": [
    // Investments & Savings
    "Securities Trading",
    "Private Wealth Management",
  ],
} as const;

export type CategoryName = keyof typeof PRODUCT_CATEGORIES;

export type GeneralInsuranceSubcategoryId =
  | "personal-insurance"
  | "motor-insurance"
  | "sme-business-protection"
  | "liability-insurance"
  | "agriculture-insurance"
  | "corporate-specialized-risks";

export const GENERAL_INSURANCE_SUBCATEGORIES: Record<
  GeneralInsuranceSubcategoryId,
  { label: string; products: readonly string[] }
> = {
  "personal-insurance": {
    label: "Personal/Family Insurance",
    products: [
      "Personal Accident",
      "Serenicare",
      "Travel Sure Plus",
      "Family Life Protection",
      "Domestic Package",
      "All Risks Cover",
    ],
  },
  "motor-insurance": {
    label: "Motor Insurance",
    products: [
      "Motor Private Insurance",
      "Motor 3rd Party",
      "Motor Commercial",
      "Motor COMESA Insurance",
    ],
  },
  "sme-business-protection": {
    label: "SME & Business Protection",
    products: [
      "Office Compact",
      "Burglary",
      "Money Insurance",
      "Fidelity Guarantee",
      "Goods in Transit",
      "Business Interruption",
      "Fire & Special Perils",
    ],
  },
  "liability-insurance": {
    label: "Liability Insurance",
    products: [
      "Professional Liability",
      "Public Liability",
      "Product Liability",
      "Directors & Officers Liability",
      "Carriers Liability",
    ],
  },
  "agriculture-insurance": {
    label: "Agriculture Insurance",
    products: [
      "Crop Insurance",
      "Livestock Insurance",
    ],
  },
  "corporate-specialized-risks": {
    label: "Corporate & Specialized Risks",
    products: [
      "Industrial All Risks",
      "Bankers Blanket Bond",
      "Marine (Open Cover, Hull, Cargo)",
    ],
  },
} as const;

export type PersonalSubcategoryId = "group-benefits";

export const PERSONAL_SUBCATEGORIES: Record<
  PersonalSubcategoryId,
  { label: string; products: readonly string[] }
> = {
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
} as const;

export type SavingsSubcategoryId = "unit-trusts";

export const SAVINGS_SUBCATEGORIES: Record<
  SavingsSubcategoryId,
  { label: string; products: readonly string[] }
> = {
  "unit-trusts": {
    label: "Unit Trusts",
    products: [
      "Umbrella Unit Trust, UGX",
      "Umbrella Unit Trust, USD",
      "Money Market Fund",
      "Balanced Fund",
    ],
  },
} as const;
