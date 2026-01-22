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
        className="fixed bottom-6 cursor-pointer right-6 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-50"
      >
        {/* {open ? <IoClose size={32} /> : <IoChatbubbleEllipses size={32} />} */}

        {open ? <IoClose size={32} /> : <IoChatbubbleEllipses size={32} />}
      </button>

      {/* Chat Panel */}
      {open && (
          <ChatbotContainer onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
