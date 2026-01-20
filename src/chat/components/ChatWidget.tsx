import { useState } from "react";
import { ChatWindow } from "./ChatWindow";

export interface ChatWidgetProps {
  defaultOpen?: boolean;
  defaultView?: "chat" | "landing";
}

export function ChatWidget({
  defaultOpen = false,
  defaultView = "chat",
}: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={[
        "mia-widget animate-om-widget-land-in motion-reduce:animate-none",
        "max-[650px]:right-2",
        "max-[650px]:bottom-[calc(56px+env(safe-area-inset-bottom,0px))]",
      ].join(" ")}
    >
      {open ? (
        <div
          className={[
            "mia-panel transform-gpu animate-widget-slide-up motion-reduce:animate-none",
            "supports-[height:100dvh]:h-[min(560px,calc(100dvh-96px))]",
            "supports-[height:100dvh]:max-h-[calc(100dvh-96px)]",
            "max-[480px]:w-[calc(100vw-24px)] max-[480px]:max-w-[calc(100vw-24px)]",
            "max-[480px]:h-[min(640px,calc(100vh-24px))] max-[480px]:max-h-[calc(100vh-24px)]",
            "max-[480px]:supports-[height:100dvh]:h-[min(640px,calc(100dvh-24px))]",
            "max-[480px]:supports-[height:100dvh]:max-h-[calc(100dvh-24px)]",
            "max-[480px]:rounded-[16px]",
          ].join(" ")}
        >
          <div className="mia-panel__header">
            <div className="mia-panel__title">MIA</div>
            <button
              type="button"
              className="mia-panel__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="mia-panel__body">
            <ChatWindow initialView={defaultView} hideHeader />
          </div>
        </div>
      ) : (
        <div className="mia-launcher">
          <span aria-hidden="true" className="mia-launcher__halo" />
          <button
            type="button"
            className="mia-launcher__button transform-gpu animate-om-launcher motion-reduce:animate-none"
            onClick={() => setOpen(true)}
            aria-label="Open chat"
          >
            <div
              className="mia-launcher__avatar shrink-0"
              aria-hidden="true"
              title="MIA"
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 12.2c2.6 0 4.7-2.1 4.7-4.7S14.6 2.8 12 2.8 7.3 4.9 7.3 7.5 9.4 12.2 12 12.2Z"
                  fill="#0b7a3a"
                  fillOpacity="0.85"
                />
                <path
                  d="M4.5 20.2c0-3.6 3.4-6.3 7.5-6.3s7.5 2.7 7.5 6.3"
                  stroke="#0b7a3a"
                  strokeOpacity="0.85"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="text-[1.15rem] font-bold text-white leading-tight">
                Hi, I'm MIA.
              </div>
              <div className="text-[0.95rem] text-white/90 leading-tight">
                Need help? You can chat with me.
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
