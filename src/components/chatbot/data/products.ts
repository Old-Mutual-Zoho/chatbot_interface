export const PRODUCT_CATEGORIES = {
  "Life Insurance": [
    // Group Benefits
    "Group Life Cover",
    "Credit Life Cover",
    "Combined Solutions",
    "Group Last Expense",
    "Group Personal Accident",
    "Umbrella Pension Scheme",
    "Group Medical (Standard)",

    //Life Insurance
    "SOMESA Education Plan",
    "Sure Deal Savings Plan", 
  ],

  "General Insurance": [
    // Products previously under the "General Insurance" subcategory
    "Personal Accident",
    "Serenicare",
    "Travel Sure Plus",
    "Motor Private Insurance",
    "Motor Third Party",
    "Professional Liability",
    "Family Life Protection",
    "Domestic Package",
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

    // Products previously under the "Solutions" subcategory
    "Investment & Advisory",
    "Office Compact",
    "SME Medical Cover",
    "SME Life Pack",
  ],

  "Savings & Investment": [
    // Savings & Investment   
    "Dollar Unit Trust Fund",
    "Private Wealth Management",

    // Investment Products
    "Money Market Fund",
    "Umbrella Trust Fund(UGX)",
    "Umbrella Trust Fund(USD)",
    "Balanced Fund",
  ],
} as const;

export type CategoryName = keyof typeof PRODUCT_CATEGORIES;
