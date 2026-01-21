import type { ProductNode } from "../chatbot/productTree";

interface ProductListProps {
  items: ProductNode[];
  onSelect: (node: ProductNode) => void;
  onBack?: () => void;
}

export default function ProductList({ items, onSelect, onBack }: ProductListProps) {
  return (
    <div className="p-4 flex flex-col gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="text-primaryGreen font-medium mb-2"
        >
          ← Back
        </button>
      )}

      {items.map((node) => (
        <button
          key={node.id}
          onClick={() => onSelect(node)}
          className="w-full text-left bg-white shadow-sm px-4 py-3 rounded-lg border hover:bg-gray-50 transition"
        >
          {node.label}
        </button>
      ))}
    </div>
  );
}