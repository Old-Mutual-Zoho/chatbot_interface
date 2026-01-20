import React, { useState, useEffect } from "react";
import { FaCommentDots } from "react-icons/fa";
import BusinessUnitScreen from "./BusinessUnitScreen";
import backgroundImage from "../../assets/image3.webp";


const HomeScreen: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showHelper, setShowHelper] = useState(true);

  const handleChatOpen = () => {
    setIsChatOpen(true);
    setShowHelper(false); // hide helper when chat opens
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setShowHelper(true); // show helper again when chat closes
  };

  // Auto-hide helper after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHelper(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Main content */}
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-4 bg-white/70 rounded-lg">
          <h1 className="text-3xl font-bold mb-4 text-black">
            Welcome to Old Mutual
          </h1>
          <p className="text-lg text-black">How can we help you today?</p>
        </div>
      </div>

      {/* Floating chat button + helper */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 flex items-center z-50">
          {/* Helper bubble */}
          {showHelper && (
            <div
              className="
                bg-green-600
                text-white
                px-4
                py-2
                rounded-lg
                shadow-lg
                mr-6
                transform
                transition-transform
                duration-500
                -translate-x-4
                hover:translate-x-0
              "
            >
              Need help? Ask us anything — we’re here instantly!
            </div>
          )}

          {/* Chat button */}
          <button
            onClick={handleChatOpen}
            className="
              bg-green-600
              rounded-full
              p-1
              shadow-lg
              cursor-pointer
              flex
              items-center
              justify-center
              transition-transform
              hover:scale-105
            "
            aria-label="Open Chat"
          >
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
              <FaCommentDots className="text-green-600 w-6 h-6" />
            </div>
          </button>
        </div>
      )}

      {/* Chat modal */}
      {isChatOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <BusinessUnitScreen onClose={handleChatClose} />
          {/* Close overlay */}
          <button
            onClick={handleChatClose}
            className="fixed inset-0 w-full h-full cursor-default"
          />
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
