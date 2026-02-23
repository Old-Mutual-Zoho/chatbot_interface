export interface ProductNode {
  // A short id we use in code.
  id: string;
  // The name the user sees.
  label: string;
  // Child items (if any).
  children?: ProductNode[];
}

// Main categories shown in the product list.
export type TopCategoryId = "personal" | "business" | "savings";

// Find a node in the tree by id.
export function findProductNodeById(
  id: string,
  nodes: ProductNode[],
): ProductNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findProductNodeById(id, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

// The product tree used by the UI.
export const productTree: ProductNode[] = [
  {
    id: "personal",
    label: "Life Insurance",
    children: [
      { id: "health", label: "Health Insurance" },
      { id: "life", label: "Life Insurance" },
      {
        id: "insure",
        label: "Insure",
        children: [
          { id: "motor-private", label: "Motor Private Insurance" },
          { id: "motor-comesa", label: "Motor Comesa" },
        ],
      },
    ],
  },
  {
    id: "business",
    label: "General Insurance",
    children: [
      {
        id: "solutions",
        label: "Solutions",
      },
      {
        id: "group-benefits",
        label: "Group Benefits",
      },
      {
        id: "general-insurance",
        label: "General Insurance",
      },
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
