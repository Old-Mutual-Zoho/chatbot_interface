import type { ProductNode } from "../components/chatbot/productTree";

interface ProductScreenProps {
  node: ProductNode;
  onSelect: (child: ProductNode) => void;
  onBack: () => void;
}

export default function ProductScreen({ node, onSelect, onBack }: ProductScreenProps) {
  return (
    <div className="flex flex-col w-full h-full bg-white">

      {/* HEADER */}
      <div className="h-14 bg-primaryGreen text-white flex items-center px-4 rounded-t-xl">
        <button onClick={onBack} className="mr-3 text-xl">←</button>
        <h2 className="text-lg font-semibold">{node.label}</h2>
      </div>

      {/* CHILDREN */}
      <div className="flex-1 overflow-y-auto p-4">
        {node.children?.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className="w-full p-3 mb-2 rounded-lg border shadow-sm text-left"
          >
            {child.label}
          </button>
        ))}
      </div>
    </div>
  );
}
