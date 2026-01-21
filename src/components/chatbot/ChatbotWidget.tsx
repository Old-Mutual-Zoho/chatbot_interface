import { useState } from "react";
import ChatbotContainer from "./ChatbotContainer";
import { IoChatbubbleEllipses, IoClose } from "react-icons/io5";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-primaryGreen text-white w-16 h-16 
                   rounded-full flex items-center justify-center shadow-xl z-50"
      >
        {open ? <IoClose size={32} /> : <IoChatbubbleEllipses size={32} />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-[110px] right-6 z-40">
          <ChatbotContainer onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
