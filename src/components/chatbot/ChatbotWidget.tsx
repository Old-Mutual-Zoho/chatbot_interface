import { useEffect, useState } from "react";
import ChatbotContainer from "./ChatbotContainer";
import { IoClose } from "react-icons/io5";
import bot from "../../assets/bot.png";

export default function ChatbotWidget() {
  // Floating launcher that toggles the full chatbot panel.
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);

  // Teaser appears shortly after load to invite the user in.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTeaser(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Keep teaser and panel mutually exclusive.
  const handleToggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      setShowTeaser(false);
    } else {
      setShowTeaser(true);
    }
  };

  return (
    <>
      {/* Floating Button + Teaser */}
      <div className="om-launcher om-launcher--intro relative">
        <div className={`flex items-center gap-3 ${open ? "" : "om-float"}`}>
          {/* Teaser bubble */}
          {showTeaser && !open && (
            <div className="group relative max-w-xs bg-white rounded-xl shadow-lg px-4 py-3 text-xs sm:text-sm text-gray-800 leading-snug select-none cursor-pointer om-panel-enter">
              <button
                type="button"
                aria-label="Close online message"
                onClick={(e) => {
                  // Don’t toggle the widget when dismissing the teaser.
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow"
              >
                ×
              </button>
              <div className="font-semibold text-gray-900">We&apos;re Online!</div>
              <div className="text-gray-600">How may I help you today?</div>
              {/* Tail */}
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 shadow-md" />
            </div>
          )}

          <button
            onClick={handleToggleOpen}
            className={`cursor-pointer bg-primary text-white w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-[3px] p-0 ${
              open ? "border-white" : "border-primary"
            }`}
          >
            {open ? (
              <IoClose size={36} />
            ) : (
              <img
                src={bot}
                alt="AI assistant"
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
          </button>
        </div>
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