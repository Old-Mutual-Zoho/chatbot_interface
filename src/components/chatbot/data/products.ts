export const PRODUCT_CATEGORIES = {
  Personal: [
    "Personal Accident",
    "Serenicare",
    "Professional Liability",
    "Family Life Protection",
    "Travel Sure Plus",
    "Domestic Package",
    "Motor Private Insurance",
    "Motor COMESA Insurance",
  ],

  Business: [
    // Solutions
    "Investment & Advisory",
    "Office Compact",
    "SME Medical Cover",
    "SME Life Pack",

    // Group Benefits
    "Group Life Cover",
    "Group Medical (Standard)",
    "Group Personal Accident",
    "Credit Life Cover",
    "Combined Solutions",
    "Umbrella Pension Scheme",
    "Group Last Expense",

    // General Insurance
    "Fidelity Guarantee",
    "Bankers Blanket Bond",
    "Livestock Insurance",
    "Public Liability",
    "Crop Insurance",
    "Carriers Liability",
    "Directors & Officers Liability",
    "Motor Commercial",
    "Marine (Open Cover, Hull, Cargo)",
    "Goods in Transit",
    "Industrial All Risks",
    "All Risks Cover",
    "Burglary",
    "Business Interruption",
    "Fire & Special Perils",
    "Money Insurance",
    "Product Liability",
  ],

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
