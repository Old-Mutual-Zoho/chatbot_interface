import React from "react";

interface UnitChatScreenProps {
  unit: string;
  onBack: () => void;
}

const UnitChatScreen: React.FC<UnitChatScreenProps> = ({ unit, onBack }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <div className="bg-white rounded-2xl shadow-lg w-[380px] h-[560px] flex flex-col overflow-hidden relative">

        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-xl font-bold"
          >
            ←
          </button>

          <h2 className="font-bold text-lg capitalize">
            {unit} Support
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4">
          {unit === "personal" && (
            <div>
              <h3 className="font-semibold mb-2">Personal Services</h3>
              <p className="text-sm text-gray-600">
                Ask questions about savings, loans, insurance and personal finance.
              </p>
            </div>
          )}

          {unit === "business" && (
            <div>
              <h3 className="font-semibold mb-2">Business Services</h3>
              <p className="text-sm text-gray-600">
                Get help with business accounts, payments and corporate solutions.
              </p>
            </div>
          )}

          {unit === "saving" && (
            <div>
              <h3 className="font-semibold mb-2">Investment Services</h3>
              <p className="text-sm text-gray-600">
                Information about investment plans and wealth management.
              </p>
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="p-3 border-t border-gray-200 flex gap-2">
          <input
            placeholder={`Ask about ${unit}...`}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
          />

          <button className="bg-green-600 text-white px-4 rounded-lg">
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default UnitChatScreen;
