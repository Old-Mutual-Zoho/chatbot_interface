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
        className="fixed bottom-6 right-6 bg-primaryGreen hover:bg-[#27a853] 
                   transition-colors text-white w-16 h-16 rounded-full shadow-xl 
                   flex items-center justify-center z-50"
      >
        {open ? <IoClose size={32} /> : <IoChatbubbleEllipses size={32} />}
      </button>

      {/* Chatbot Panel */}
      {open && (
        <div className="fixed bottom-[110px] right-6 z-40">
          <ChatbotContainer onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
