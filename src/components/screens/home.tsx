import React from "react";
import { FaCommentDots } from "react-icons/fa";

const HomeScreen: React.FC = () => {
  const handleChatOpen = () => {
    console.log("Chat opened!");
  };

  return (
    <div className="min-h-screen">
      {/* Main content - centered */}
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-3xl font-bold mb-4 text-black">
            Welcome to Old Mutual
          </h1>
          <p className="text-lg text-black">How can we help you today?</p>
        </div>
      </div>

      {/* Floating chat button */}
      <button
        onClick={handleChatOpen}
        className="
          fixed
          bottom-6
          right-6
          bg-green-600   /* outer green circle */
          rounded-full
          p-1            /* padding to make border effect */
          shadow-lg
          cursor-pointer
          transition-transform
          hover:scale-105
          z-50
        "
        aria-label="Open Chat"
      >
        {/* Inner white circle */}
        <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
          <FaCommentDots className="text-green-600 w-6 h-6" />
        </div>
      </button>
    </div>
  );
};

export default HomeScreen;
