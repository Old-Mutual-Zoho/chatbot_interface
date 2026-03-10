import { useEffect, useRef, useState } from "react";
import {
  IoChevronForward,
  IoHome,
  IoChatbubbles,
  IoCallOutline,
} from "react-icons/io5";
import { BsChatRightText } from "react-icons/bs";
import { RiWhatsappLine } from "react-icons/ri";
import OMlogo from "../assets/OMLogo.png";
import product1 from "../assets/product.png";
import product2 from "../assets/product2.png";
import product3 from "../assets/product3.png";
import type { TopCategoryId } from "../components/chatbot/productTree";

export default function HomeScreen({
  onStartChat,
  onChatWithAgent,
  onGoToConversation,
  onSelectCategory,
}: {
  onStartChat: () => void;
  onChatWithAgent: () => void;
  onGoToConversation: () => void;
  onSelectCategory: (categoryId: TopCategoryId) => void;
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const callNumber = "+256707434218";
  const whatsappNumber = "256707434218";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };

    if (isHelpOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHelpOpen]);

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-[#f6f6f8] overflow-hidden">
      {/* Header */}
      <div
        className="relative shrink-0 rounded-b-4xl px-5 sm:px-6 pb-7 sm:pb-9 pt-4 sm:pt-5 text-white bg-gradient-to-br from-primary to-primary/80"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <div ref={helpMenuRef} className="absolute top-5 right-5 z-20">
          <button
            type="button"
            aria-label="Open help contacts"
            aria-expanded={isHelpOpen}
            onClick={() => setIsHelpOpen((prev) => !prev)}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center border border-white/40 cursor-pointer"
          >
            <span className="grid grid-cols-3 gap-[3px]">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index} className="w-[4px] h-[4px] rounded-full bg-white" />
              ))}
            </span>
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[85vw] bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 p-3">
              <p className="text-sm font-semibold mb-2">Need help?</p>

              <a
                href={`tel:${callNumber}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition"
              >
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <IoCallOutline size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Call us</p>
                  <p className="text-sm font-medium truncate">{callNumber}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition"
              >
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <RiWhatsappLine size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">WhatsApp</p>
                  <p className="text-sm font-medium truncate">Chat on WhatsApp</p>
                </div>
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsHelpOpen(false);
                  // Explicitly route to the existing human-agent escalation flow.
                  onChatWithAgent();
                }}
                className="w-full mt-1 rounded-lg bg-primary text-white text-sm font-semibold py-2 px-3 hover:bg-primary/90 transition"
              >
                Chat with Agent
              </button>
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center mb-6 sm:mb-8">
          <img src={OMlogo} className="w-full h-full" />
        </div>

        <h1 className="text-[clamp(2.3rem,7vw,2rem)] leading-none mb-2 mt-15">Old Mutual</h1>
        <p className="text-[clamp(1.1rem,3.5vw,.7rem)] opacity-95">Hey! How can we help you today</p>
      </div>

      {/* CHAT NOW */}
      <div className="shrink-0 mt-3 sm:mt-[18px] px-4">
        <button
          onClick={onStartChat}
          className="w-full bg-white rounded-[1rem] shadow-[0_10px_30px_rgba(0,0,0,0.10)] flex justify-between items-center px-4 py-3 cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shrink-0">
              <BsChatRightText
                size={22}
                className="text-white"
              />
            </div>
            <span className="text-black text-[clamp(1.2rem,4vw,1.6rem)] sm:text-xl font-semibold leading-none">Chat with us now</span>
          </div>
          <IoChevronForward size={22} className="text-black" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 min-h-0 mt-3 sm:mt-4 px-4 pb-2">
        <div className="rounded-2xl border mt-1 border-gray-200 p-2.5 sm:p-3 shadow-sm bg-white">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Personal category */}
            <button
              onClick={() => onSelectCategory("personal")}
              className="flex flex-col items-center cursor-pointer bg-[#dff4e8] rounded-2xl px-2 py-3 sm:p-3"
            >
              <img
                src={product1}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mb-2"
              />
              <p className="text-[11px] sm:text-sm font-bold pt-1 pb-1 text-gray-800 text-center leading-tight min-h-10 sm:min-h-12 flex items-center justify-center">
                Life Assurance
              </p>
              <span className="mt-1 text-[11px] sm:text-xs bg-primary text-white px-3 py-1.5 sm:py-2 rounded-md leading-none">
                Chat Now
              </span>
            </button>

            {/* Business category */}
            <button
              onClick={() => onSelectCategory("business")}
              className="flex flex-col items-center cursor-pointer bg-[#dff4e8] rounded-2xl px-2 py-3 sm:p-3"
            >
              <img
                src={product2}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mb-2"
              />
              <p className="text-[11px] sm:text-sm font-bold pt-1 pb-1 text-gray-800 text-center leading-tight min-h-10 sm:min-h-12 flex items-center justify-center">
                General Insurance
              </p>
              <span className="mt-1 text-[11px] sm:text-xs bg-primary text-white px-3 py-1.5 sm:py-2 rounded-md leading-none">
                Chat Now
              </span>
            </button>

            {/* Savings & Investment category */}
            <button
              onClick={() => onSelectCategory("savings")}
              className="flex flex-col items-center cursor-pointer bg-[#dff4e8] rounded-2xl px-2 py-3 sm:p-3"
            >
              <img
                src={product3}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mb-2"
              />
              <p className="text-[11px] sm:text-sm font-bold pt-1 pb-1 text-gray-800 text-center leading-tight min-h-10 sm:min-h-12 flex items-center justify-center">
                Savings & Investment
              </p>
              <span className="mt-1 text-[11px] sm:text-xs bg-primary text-white px-3 py-1.5 sm:py-2 rounded-md leading-none">
                Chat Now
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="shrink-0 mt-auto bg-gray-50 border-t border-gray-200 px-8 sm:px-10 py-3 sm:py-4 pl-12 sm:pl-15 pr-12 sm:pr-15 flex justify-between items-center">
        <div className="flex flex-col items-center text-primary cursor-pointer" aria-current="page">
          <IoHome size={26} />
          <span className="text-sm mt-1">Home</span>
        </div>

        <button
          onClick={onGoToConversation}
          className="flex flex-col items-center text-primary/45 cursor-pointer"
        >
          <IoChatbubbles size={26} />
          <span className="text-sm mt-1">Conversation</span>
        </button>
      </div>
    </div>
  );
}
