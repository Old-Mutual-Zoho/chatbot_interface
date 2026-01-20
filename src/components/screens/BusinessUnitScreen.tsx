import React, { useState } from "react";
import circleImage from "../../assets/image3.webp";
import logo from "../../assets/logo.jfif";
import UnitChatScreen from "./UnitChatScreen";

interface BusinessUnitScreenProps {
  onClose: () => void;
}

const BusinessUnitScreen: React.FC<BusinessUnitScreenProps> = ({ onClose }) => {
  const [activeCard, setActiveCard] = useState<string>("personal");
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const options = [
    { id: "personal", title: "Personal", description: "Chat Now" },
    { id: "business", title: "Business", description: "Chat Now" },
    { id: "saving", title: "Investment", description: "Chat Now" },
  ];

  // If a unit has been selected, show the unit chat screen instead
  if (selectedUnit) {
    return (
      <UnitChatScreen
        unit={selectedUnit}
        onBack={() => setSelectedUnit(null)}
      />
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <div className="bg-white rounded-tl-[32px] rounded-tr-[32px] rounded-bl-2xl rounded-br-2xl shadow-lg w-[380px] h-[560px] flex flex-col overflow-hidden relative">

        {/* Header */}
        <div className="h-[220px] relative rounded-b-[40px] bg-gradient-to-r from-green-800 via-green-500 to-green-400">
          
          <div className="absolute top-5 left-5 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
            <img
              src={logo}
              alt="Logo"
              className="w-[80%] h-[80%] object-contain"
            />
          </div>

          <div className="flex flex-col pt-20 pl-6">
            <div className="text-white font-bold text-2xl mb-1.5">
              Old Mutual
            </div>
            <div className="text-white/95 text-sm">
              Hey! How can we help you today
            </div>
          </div>
        </div>

        {/* Center Chat Button */}
        <div className="absolute top-[180px] left-1/2 -translate-x-1/2 z-10">
          <button className="flex items-center gap-1 bg-white rounded-md px-2.5 py-1.5 shadow-md text-green-600 font-semibold text-xs border-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="#16a34a"
              viewBox="0 0 16 16"
            >
              <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10l4 4V4a2 2 0 0 0-2-2H2z" />
            </svg>
            Chat with us now
          </button>
        </div>

        {/* Cards */}
        <div className="flex-1 bg-white p-4 mt-4">
          <div className="flex flex-row justify-between gap-2">
            {options.map((option) => {
              const isActive = activeCard === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => {
                    setActiveCard(option.id);
                    setSelectedUnit(option.id);
                  }}
                  className={`flex-1 min-w-0 flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${isActive ? "border-green-600 bg-green-600 shadow-lg scale-105" : "border-green-200 bg-green-200 shadow-md scale-100"}
                  border`}
                >
                  <div
                    className="w-16 h-16 rounded-full shadow-sm border-2 border-white bg-cover bg-center mb-2"
                    style={{
                      backgroundImage: `url(${circleImage})`,
                    }}
                  />

                  <div
                    className={`font-semibold text-sm mb-2 text-center whitespace-nowrap ${
                      isActive ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {option.title}
                  </div>

                  <button
                    style={{
                      backgroundColor: isActive ? "#ffffff" : "#16a34a",
                      color: isActive ? "#16a34a" : "#ffffff",
                      fontSize: "10px",
                      padding: "4px 8px"
                    }}
                    className="font-semibold rounded cursor-pointer shadow-sm outline-none border-none"
                  >
                    {option.description}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Menu */}
        <div className="bg-gray-50 rounded-t-[32px] border-t border-gray-200 p-4 mt-2 relative">
          <div className="flex justify-center items-center gap-35">

            <div className="flex flex-col items-center text-green-600 cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center rounded-full transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="text-[10px] mt-1.5 font-medium">Home</span>
            </div>

            <div className="flex flex-col items-center text-gray-600 cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center rounded-full transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-[10px] mt-1.5 font-medium">Conversation</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: "#16a34a",
              color: "#ffffff"
            }}
            className="absolute bottom-0 right-2 w-10 h-10 rounded-full flex justify-center items-center text-2xl font-bold shadow-lg cursor-pointer border-none"
          >
            ×
          </button>
        </div>

      </div>
    </div>
  );
};

export default BusinessUnitScreen;
