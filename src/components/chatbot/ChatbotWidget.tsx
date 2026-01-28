import { useEffect, useRef, useState } from "react";
import ChatbotContainer from "./ChatbotContainer";
import popSound from "../../assets/pop.mp3";
import { IoClose } from "react-icons/io5";
import AiProfileImage from "../../assets/ai-profile.jpeg";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);

  // Show the "We're Online" teaser 4s after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTeaser(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Ref for pop sound
  const popAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync teaser visibility with widget open/close state
  const handleToggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      // Opening chat: hide teaser
      setShowTeaser(false);
      // Play pop sound when chat opens
      if (popAudioRef.current) {
        popAudioRef.current.currentTime = 0;
        popAudioRef.current.play();
      }
    } else {
      // Closing chat: bring teaser back (with animation)
      setShowTeaser(true);
    }
  };

  return (
    <>
      {/* Audio element for pop sound */}
      <audio ref={popAudioRef} src={popSound} preload="auto" />
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
                src={AiProfileImage}
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