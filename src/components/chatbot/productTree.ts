export interface ProductNode {
  id: string;
  label: string;
  children?: ProductNode[];
}

export const productTree: ProductNode[] = [
  {
    id: "personal",
    label: "Personal",
    children: [
      { id: "health", label: "Health Insurance" },
      { id: "life", label: "Life Insurance" },
      {
        id: "insure",
        label: "Insure",
        children: [
          { id: "motor-private", label: "Motor Private" },
          { id: "motor-comesa", label: "Motor Comesa" },
        ],
      },
    ],
  },
  {
    id: "business",
    label: "Business",
    children: [
      { id: "corporate-health", label: "Corporate Health" },
      { id: "group-life", label: "Group Life" },
    ],
  },
  {
    id: "savings",
    label: "Savings & Investment",
    children: [
      { id: "unit-trusts", label: "Unit Trusts" },
      { id: "wealth-builder", label: "Wealth Builder" },
    ],
  },
];
