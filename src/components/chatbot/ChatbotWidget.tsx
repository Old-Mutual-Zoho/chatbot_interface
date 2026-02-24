import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ChatbotContainer from "./ChatbotContainer";
import { IoClose } from "react-icons/io5";
import Logo from "../../assets/Logo.png";

export default function ChatbotWidget() {
  // Floating launcher that toggles the full chatbot panel.
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const PORTAL_ID = "om-chatbot-portal";
    const existing = document.getElementById(PORTAL_ID) as HTMLElement | null;
    if (existing) {
      setPortalNode(existing);
      return;
    }

    const node = document.createElement("div");
    node.id = PORTAL_ID;
    node.setAttribute("data-om-chatbot-root", "true");
    // Mount under body as requested (portal prevents clipping by parent containers).
    document.body.appendChild(node);
    setPortalNode(node);

    return () => {
      node.remove();
    };
  }, []);

  // Teaser appears shortly after load to invite the user in.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTeaser(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Keep teaser and panel mutually exclusive.
  useEffect(() => {
    if (open) setShowTeaser(false);
  }, [open]);

  // Keep teaser and panel mutually exclusive.
  const handleToggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      setShowTeaser(!next);
      return next;
    });
  };

  if (!portalNode) return null;

  return createPortal(
    <>
      {/* Floating Button + Teaser */}
      <div className={`om-launcher om-launcher--intro relative ${open ? "om-launcher--open" : ""}`}>
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
            className={`cursor-pointer bg-primary text-white w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-[3px] p-0 ${
              open ? "border-white" : "border-primary"
            }`}
          >
            {open ? (
              <IoClose size={32} />
            ) : (
              <img
                src={Logo}
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
        <>
          <button
            type="button"
            aria-label="Close chatbot"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9998] bg-black/30"
          />
          <div className="fixed top-4 bottom-4 right-4 z-[9999] om-panel-enter pointer-events-auto flex items-end">
            <div className="w-[95vw] h-[80vh] max-h-full mb-16 md:w-[400px] md:h-[680px] md:max-h-full overflow-hidden rounded-3xl shadow-xl border border-primary/20 bg-white">
              <ChatbotContainer onClose={() => setOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>,
    portalNode,
  );
}