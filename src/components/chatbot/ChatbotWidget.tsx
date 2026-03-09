import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChatbotContainer from "./ChatbotContainer";
import { IoClose } from "react-icons/io5";
import Logo from "../../assets/Logo.png";

export default function ChatbotWidget({
  teaser = true,
}: {
  teaser?: boolean;
}) {
  // Floating launcher that toggles the full chatbot panel.
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 800px)").matches;
  });

  const debug =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).has("omdebug") ||
      window.localStorage.getItem("omdebug") === "1");

  const PORTAL_ID = "om-chatbot-portal";
  const [portalNode] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    const existing = document.getElementById(PORTAL_ID) as HTMLElement | null;
    if (existing) return existing;

    const node = document.createElement("div");
    node.id = PORTAL_ID;
    node.setAttribute("data-om-chatbot-root", "true");
    node.setAttribute("data-om-chatbot-created", "true");
    // Append happens in an effect to make this resilient to StrictMode effect replay
    // and to cases where <body> isn't ready yet.
    return node;
  });

  useEffect(() => {
    if (!portalNode) return;
    // Ensure the portal node is attached. In dev StrictMode, effects can be
    // replayed and cleanups run even during initial load, so we re-attach if needed.
    if (!document.documentElement.contains(portalNode)) {
      if (document.body) document.body.appendChild(portalNode);
      else document.documentElement.appendChild(portalNode);
    }

    if (debug) {
      console.debug("[ChatbotWidget] portal attached", {
        inDom: document.documentElement.contains(portalNode),
        parent: portalNode.parentElement?.tagName,
      });
    }

    return () => {
      if (!portalNode) return;
      // In dev, don't remove the portal node; StrictMode can trigger cleanups
      // during initial load, which would make the widget disappear.
      if (import.meta.env.DEV) return;
      if (portalNode.getAttribute("data-om-chatbot-created") === "true") portalNode.remove();
    };
  }, [debug, portalNode]);

  useEffect(() => {
    if (!portalNode) return;
    portalNode.setAttribute("data-om-open", open ? "true" : "false");
    if (debug) {
      console.debug("[ChatbotWidget] state", {
        open,
        showTeaser,
        portalInDom: document.documentElement.contains(portalNode),
      });
    }
  }, [debug, open, portalNode, showTeaser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 800px)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }

    mediaQuery.addListener(handleMediaChange);
    return () => mediaQuery.removeListener(handleMediaChange);
  }, []);

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Teaser appears shortly after load to invite the user in.
  useEffect(() => {
    if (!teaser) return;
    const timer = setTimeout(() => {
      if (!openRef.current) setShowTeaser(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [teaser]);

  const handleClose = () => {
    setOpen(false);
    setShowTeaser(false);
  };

  const handleToggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      setShowTeaser(!next);
      return next;
    });
  };

  // Inline positioning so the launcher/panel still appear even if the host page
  // doesn't load our CSS (or overrides common utility classes).
  const launcherStyle: React.CSSProperties = {
    position: "fixed",
    right: "1rem",
    bottom: open
      ? "calc(0.25rem + env(safe-area-inset-bottom))"
      : "calc(1rem + env(safe-area-inset-bottom))",
    zIndex: 2147483647,
    display: "block",
    opacity: 1,
    visibility: "visible",
    pointerEvents: "auto",
  };

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 2147483646,
    background: "rgba(0,0,0,0.3)",
  };

  const panelAnchorStyle: React.CSSProperties = {
    position: "fixed",
    top: isMobileViewport ? "env(safe-area-inset-top)" : "calc(1rem + env(safe-area-inset-top))",
    bottom: isMobileViewport ? "env(safe-area-inset-bottom)" : "calc(5.75rem + env(safe-area-inset-bottom))",
    left: isMobileViewport ? "0" : "auto",
    right: isMobileViewport ? "0" : "calc(1rem + env(safe-area-inset-right))",
    zIndex: 2147483647,
    pointerEvents: "auto",
  };

  const launcherButtonStyle: React.CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: 9999,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: open ? "#ffffff" : "var(--color-primary, #00A651)",
    background: "var(--color-primary, #00A651)",
    color: "#ffffff",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
    cursor: "pointer",
  };

  const content = (
    <>
      {/* Floating Button + Teaser */}
      <div
        className={`om-launcher om-launcher--intro relative ${open ? "om-launcher--open" : ""}`}
        style={launcherStyle}
      >
        <div className={`flex items-center gap-3 ${open ? "" : "om-float"}`}>
            {/* Teaser bubble */}
            {teaser && showTeaser && !open && (
              <div className="group relative max-w-xs bg-white rounded-xl shadow-lg px-4 py-3 text-xs sm:text-sm text-gray-800 leading-snug select-none cursor-pointer om-panel-enter">
                <button
                  type="button"
                  aria-label="Close online message"
                  onClick={(e) => {
                    // Do not toggle the widget when dismissing the teaser.
                    e.stopPropagation();
                    setShowTeaser(false);
                  }}
                  className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow"
                >
                  x
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
              style={launcherButtonStyle}
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
            onClick={handleClose}
            className="fixed inset-0 z-[9998] bg-black/30"
            style={backdropStyle}
          />
          <div
            className="fixed top-[calc(1rem+env(safe-area-inset-top))] bottom-[calc(6rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-[9999] om-panel-enter pointer-events-auto"
            style={panelAnchorStyle}
          >
            <div
              className={
                isMobileViewport
                  ? "w-screen h-full max-h-full overflow-hidden rounded-none shadow-none border-0 bg-white"
                  : "w-[92vw] max-w-[480px] h-full max-h-full md:w-[500px] lg:w-[520px] overflow-hidden rounded-3xl shadow-xl border border-primary/20 bg-white"
              }
            >
              <ChatbotContainer onClose={handleClose} />
            </div>
          </div>
        </>
      )}
    </>
  );

  return portalNode ? createPortal(content, portalNode) : content;
}
