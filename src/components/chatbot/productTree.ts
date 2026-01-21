// export interface ProductNode {
//   id: string;
//   label: string;
//   children?: ProductNode[];
//   finalProduct?: boolean; // If true → jumps to Conversation screen
// }

// export const productTree: ProductNode[] = [
//   {
//     id: "personal",
//     label: "Personal",
//     children: [
//       {
//         id: "insure",
//         label: "Insure",
//         children: [
//           { id: "motor-private", label: "Motor Private", finalProduct: true },
//           { id: "motor-comesa", label: "Motor Comesa", finalProduct: true },
//           { id: "travel-insurance", label: "Travel Insurance", finalProduct: true },
//         ],
//       },
//       {
//         id: "save-invest",
//         label: "Save & Invest",
//         children: [
//           { id: "unit-trusts", label: "Unit Trusts", finalProduct: true },
//           { id: "education-plan", label: "Education Plan", finalProduct: true },
//         ],
//       },
//     ],
//   },

//   {
//     id: "business",
//     label: "Business",
//     children: [
//       {
//         id: "property",
//         label: "Property Insurance",
//         children: [
//           { id: "fire-insurance", label: "Fire Insurance", finalProduct: true },
//           { id: "burglary", label: "Burglary", finalProduct: true },
//         ],
//       },
//       {
//         id: "employee-benefits",
//         label: "Employee Benefits",
//         children: [
//           { id: "group-life", label: "Group Life", finalProduct: true },
//           { id: "group-medical", label: "Group Medical", finalProduct: true },
//         ],
//       },
//     ],
//   },

//   {
//     id: "savings",
//     label: "Savings & Investment",
//     children: [
//       {
//         id: "digital-solutions",
//         label: "Digital Solutions",
//         children: [
//           { id: "old-mutual-app", label: "Old Mutual App", finalProduct: true },
//         ],
//       },
//     ],
//   },
// ];





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
