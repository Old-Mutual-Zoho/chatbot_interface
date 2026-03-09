import { useEffect, useRef, useState } from "react";
import {
  IoChevronForward,
  IoHome,
  IoChatbubbles,
  IoHeadset,
  IoHelpCircleOutline,
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
  const callNumber = "+256700000000";
  const whatsappNumber = "256700000000";

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
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div
        className="relative rounded-3xl px-6 pb-10 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white bg-gradient-to-br from-primary to-primary/80"
      >
        <div ref={helpMenuRef} className="absolute top-5 right-5 z-20">
          <button
            type="button"
            aria-label="Open help contacts"
            aria-expanded={isHelpOpen}
            onClick={() => setIsHelpOpen((prev) => !prev)}
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center border border-white/40"
          >
            <IoHelpCircleOutline size={24} className="text-white" />
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
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-18">
          <img src={OMlogo} className="w-full h-full" />
        </div>

        <h1 className="text-6xl mb-2">Old Mutual</h1>
        <p className="text-xl opacity-90 mb-5">Hey! How can we help you today</p>
      </div>

      {/* CHAT NOW */}
      <div className="-mt-8 px-4">
        <button
          onClick={onStartChat}
          className="w-full bg-white rounded-2xl shadow-md flex justify-between items-center px-4 py-3 pt-5 pb-5 cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <BsChatRightText
                size={22}
                className="text-white"
              />
            </div>
            <span className="text-black text-xl font-medium">Chat with us now</span>
          </div>
          <IoChevronForward size={22} className="text-black" />
        </button>
      </div>

      {/* Cards */}
      <div className="mt-6 px-4 pb-4">
        <div className="rounded-2xl border mt-3 border-gray-200 p-4 shadow-lg bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Personal category */}
            <button
              onClick={() => onSelectCategory("personal")}
              className="flex flex-col items-center cursor-pointer bg-green-100 rounded-xl p-3 shadow-xs"
            >
              <img
                src={product1}
                className="w-13 h-13 rounded-full object-cover mb-2"
              />
              <p className="text-sm font-bold pt-1 pb-1 text-gray-800 text-center leading-tight min-h-10 flex items-center justify-center">
                Life Insurance
              </p>
              <span className="mt-1 text-xs bg-primary text-white px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

            {/* Business category */}
            <button
              onClick={() => onSelectCategory("business")}
              className="flex flex-col items-center cursor-pointer bg-green-100 rounded-xl p-3 shadow-xs"
            >
              <img
                src={product2}
                className="w-13 h-13 rounded-full object-cover mb-2"
              />
              <p className="text-sm font-bold pt-1 pb-1 text-gray-800 text-center leading-tight min-h-10 flex items-center justify-center">
                General Insurance
              </p>
              <span className="mt-1 text-xs bg-primary text-white px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

            {/* Savings & Investment category */}
            <button
              onClick={() => onSelectCategory("savings")}
              className="flex flex-col items-center cursor-pointer bg-green-100 rounded-xl p-3 shadow-xs"
            >
              <img
                src={product3}
                className="w-13 h-13 rounded-full object-cover mb-2"
              />
              <p className="text-sm font-bold pt-1 pb-1 text-gray-800 text-center leading-tight min-h-10 flex items-center justify-center">
                Savings & Investment
              </p>
              <span className="mt-1 text-xs bg-primary text-white px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="mt-auto bg-gray-50 border-t border-gray-200 px-10 py-4 pl-15 pr-15 flex justify-between items-center">
        <div className="flex flex-col items-center text-primary cursor-pointer" aria-current="page">
          <IoHome size={26} />
          <span className="text-sm mt-1">Home</span>
          <div className="mt-1 h-1 w-10 rounded-full bg-primary" />
        </div>

        <button
          onClick={onChatWithAgent}
          className="flex flex-col items-center text-primary cursor-pointer"
        >
          <IoHeadset size={26} />
          <span className="text-sm mt-1">Chat with Agent</span>
          <div className="mt-1 h-1 w-10 rounded-full bg-transparent" />
        </button>

        <button
          onClick={onGoToConversation}
          className="flex flex-col items-center text-primary cursor-pointer"
        >
          <IoChatbubbles size={26} />
          <span className="text-sm mt-1">Conversation</span>
          <div className="mt-1 h-1 w-10 rounded-full bg-transparent" />
        </button>
      </div>
    </div>
  );
}
