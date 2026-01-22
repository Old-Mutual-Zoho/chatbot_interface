import { useState } from "react";
import ChatbotContainer from "./ChatbotContainer";
import { IoChatbubbleEllipses, IoClose } from "react-icons/io5";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div className="om-launcher om-launcher--intro">
        <button
          onClick={() => setOpen(!open)}
          className={`cursor-pointer bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white ${
            open ? "" : "om-float"
          }`}
        >
          {open ? <IoClose size={36} /> : <IoChatbubbleEllipses size={36} />}
        </button>
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-[110px] right-6 z-40 om-panel-enter">
          <ChatbotContainer onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
