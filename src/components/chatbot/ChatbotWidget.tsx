import { useState } from "react";
import ChatbotContainer from "./ChatbotContainer";
import { IoChatbubbleEllipses, IoClose } from "react-icons/io5";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 cursor-pointer right-6 bg-[#2DBE5F] hover:bg-[#27a853] transition-colors text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-50"
      >
        <div
          onClick={() => setOpen(!open)}
          className="fixed bottom-6 right-6 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg cursor-pointer z-50"
        >
          {open ? <IoClose size={32} /> : <IoChatbubbleEllipses size={32} />}
          
        </div>
      </button>

      {/* Chatbot Panel (opens above the floating icon) */}
      {open && (
        <div className="fixed bottom-[160px] right-6 z-40">
          <ChatbotContainer onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
