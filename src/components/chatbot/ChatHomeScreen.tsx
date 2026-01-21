import { ProductNode } from "./productTree";

interface ChatHomeProps {
  businessUnits: ProductNode[];
  onSelectUnit: (node: ProductNode) => void;
  goToConversation: () => void;
}

export default function ChatHomeScreen({
  businessUnits,
  onSelectUnit,
  goToConversation,
}: ChatHomeProps) {
  return (
    <div className="flex flex-col w-full h-full">

      {/* Header */}
      <div className="p-4 bg-primaryGreen text-white rounded-t-xl">
        <h2 className="text-xl font-bold">Old Mutual</h2>
        <p className="text-sm opacity-90">Hey! How can we help you today</p>
      </div>

      {/* Chat with us now button */}
      <div className="p-4">
        <button
          onClick={goToConversation}
          className="w-full bg-white border shadow-sm py-3 rounded-xl flex justify-between items-center px-4"
        >
          <span className="font-medium">Chat with us now</span>
          <span className="text-xl">›</span>
        </button>
      </div>

      {/* Business Unit Cards */}
      <div className="grid grid-cols-3 gap-3 px-4 pb-4">
        {businessUnits.map((unit) => (
          <button
            key={unit.id}
            onClick={() => onSelectUnit(unit)}
            className="bg-white shadow px-3 py-3 rounded-xl border text-sm font-medium hover:bg-gray-50"
          >
            {unit.label}
          </button>
        ))}
      </div>

    </div>
  );
}
