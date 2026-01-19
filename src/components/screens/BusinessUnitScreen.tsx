import React from "react";


const BusinessUnitScreen: React.FC = () => {
  return (
    
      <div className="fixed inset-0 flex items-center justify-center z-20">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-t-2xl rounded-b-lg shadow-xl w-[350px]">
          {/* Header */}
          <div className="flex flex-col items-center p-4">
            {/* Logo */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
              {/* Replace with <img src={logo} /> if you have a logo */}
              <span className="text-green-700 font-bold text-2xl">OM</span>
            </div>
            <div className="text-white text-2xl font-bold">Old Mutual</div>
            <div className="text-white text-sm mt-1 mb-2">Hey! How can we help you today</div>
            {/* Chat with us now */}
            <button className="flex items-center bg-white rounded-lg px-4 py-2 mt-2 shadow text-green-700 font-medium">
              <span className="material-icons mr-2">chat</span>
              Chat with us now
              <span className="material-icons ml-2">chevron_right</span>
            </button>
          </div>
          {/* Chat options */}
          <div className="flex justify-around px-4 py-3 bg-white">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-1 overflow-hidden">
                {/* <img src="..." alt="Personal" /> */}
              </div>
              <div className="text-xs font-semibold">Personal</div>
              <button className="text-green-600 text-xs mt-1">Chat Now</button>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-1 overflow-hidden">
                {/* <img src="..." alt="Business" /> */}
              </div>
              <div className="text-xs font-semibold">Business</div>
              <button className="text-green-600 text-xs mt-1">Chat Now</button>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-1 overflow-hidden">
                {/* <img src="..." alt="Savings" /> */}
              </div>
              <div className="text-xs font-semibold text-center">Saving &<br />Investment</div>
              <button className="text-green-600 text-xs mt-1">Chat Now</button>
            </div>
          </div>
          {/* Navigation bar */}
          <div className="flex justify-between items-center px-6 py-2 bg-white rounded-b-lg border-t">
            <div className="flex flex-col items-center text-green-600">
              <span className="material-icons">home</span>
              <span className="text-xs">Home</span>
            </div>
            <div className="flex flex-col items-center text-gray-400">
              <span className="material-icons">chat_bubble_outline</span>
              <span className="text-xs">Conversation</span>
            </div>
            <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg -mt-8">
              ×
            </button>
          </div>
        </div>
      </div>
   
  );
};

export default BusinessUnitScreen;
