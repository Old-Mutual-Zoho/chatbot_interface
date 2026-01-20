import React from "react";

interface BusinessUnitScreenProps {
  onClose: () => void;
}

const BusinessUnitScreen: React.FC<BusinessUnitScreenProps> = ({ onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat panel */}
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-t-2xl rounded-b-lg shadow-xl w-[350px] h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center p-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
            <span className="text-green-700 font-bold text-2xl">OM</span>
          </div>
          <div className="text-white text-2xl font-bold">Old Mutual</div>
          <div className="text-white text-sm mt-1 mb-2 text-center">
            Hey! How can we help you today
          </div>
          <button className="flex items-center bg-white rounded-lg px-4 py-2 mt-2 shadow text-green-700 font-medium">
            Chat with us now
          </button>
        </div>

        {/* Chat options */}
        <div className="flex justify-around px-4 py-3 bg-white">
          {["Personal", "Business", "Saving & Investment"].map((type) => (
            <div key={type} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-1 overflow-hidden"></div>
              <div className="text-xs font-semibold text-center">{type}</div>
              <button className="text-green-600 text-xs mt-1">Chat Now</button>
            </div>
          ))}
        </div>

        {/* Navigation & close */}
        <div className="flex justify-between items-center px-6 py-2 bg-white rounded-b-lg border-t relative mt-auto">
          <div className="flex flex-col items-center text-green-600">
            <span className="material-icons">home</span>
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <span className="material-icons">chat_bubble_outline</span>
            <span className="text-xs">Conversation</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-5 right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessUnitScreen;
