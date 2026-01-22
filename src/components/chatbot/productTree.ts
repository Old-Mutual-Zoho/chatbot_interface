export interface ProductNode {
  id: string;
  label: string;
  children?: ProductNode[];
}

export type TopCategoryId = "personal" | "business" | "savings";

export function findProductNodeById(
  id: string,
  nodes: ProductNode[] = productTree,
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
