import {
  IoChevronForward,
  IoHome,
  IoChatbubbles,
  IoCallOutline,
} from "react-icons/io5";
import { BsChatRightText } from "react-icons/bs";
import { SiWhatsapp } from "react-icons/si";
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
  const callNumber = "0800132700";
  const whatsappNumber = "256707434218";
  void onChatWithAgent;

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-[var(--color-primary-light)] overflow-hidden">
      {/* Header */}
      <div
        className="relative shrink-0 rounded-b-4xl px-5 sm:px-6 pb-7 sm:pb-9 pt-4 sm:pt-5 text-white bg-gradient-to-br from-primary to-primary/80"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
          <a
            href={`tel:${callNumber}`}
            aria-label="Call us"
            className="h-11 px-3 rounded-full bg-white/15 hover:bg-white/25 transition-[box-shadow,background-color,border-color] duration-200 flex items-center justify-center gap-2 border border-white/40 hover:border-white/70 cursor-pointer whitespace-nowrap shadow-[0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.55),0_0_22px_rgba(255,255,255,0.55),0_0_50px_rgba(255,255,255,0.30)]"
          >
            <IoCallOutline size={18} className="text-white" />
            <span className="text-white text-sm font-semibold">Call us</span>
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="h-11 px-3 rounded-full bg-white/15 hover:bg-white/25 transition-[box-shadow,background-color,border-color] duration-200 flex items-center justify-center gap-2 border border-white/40 hover:border-white/70 cursor-pointer whitespace-nowrap shadow-[0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.55),0_0_22px_rgba(255,255,255,0.55),0_0_50px_rgba(255,255,255,0.30)]"
          >
            <SiWhatsapp size={18} className="text-white" />
            <span className="text-white text-sm font-semibold">WhatsApp</span>
          </a>
        </div>

        {/* Logo */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center mb-6 sm:mb-8">
          <img src={OMlogo} className="w-full h-full" />
        </div>

        <h1 className="text-[clamp(2.3rem,7vw,2rem)] leading-none mb-2 mt-15">OM-Intelligence</h1>
        <p className="text-[20px] opacity-95 font-semibold">
          Welcome ! How may i serve you today ? {" "}
          <span className="inline-block text-[1.2em] leading-none align-[-0.12em]">😊</span>
        </p>
      </div>

      {/* CHAT NOW */}
      <div className="shrink-0 mt-3 sm:mt-[18px] px-4">
        <button
          onClick={onStartChat}
          className="w-full rounded-[1rem] border-4 border-gray-100 ring-2 ring-white/80 bg-gradient-to-b from-white via-gray-50 to-white focus:from-[color-mix(in_srgb,var(--color-primary-light)_28%,white)] focus:via-[color-mix(in_srgb,var(--color-primary-light)_28%,white)] focus:to-[color-mix(in_srgb,var(--color-primary-light)_28%,white)] active:from-[color-mix(in_srgb,var(--color-primary-light)_38%,white)] active:via-[color-mix(in_srgb,var(--color-primary-light)_38%,white)] active:to-[color-mix(in_srgb,var(--color-primary-light)_38%,white)] focus:border-primary/30 active:border-primary/45 shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex justify-between items-center px-5 py-5 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition will-change-transform motion-safe:[animation:om-float_3.2s_ease-in-out_infinite] motion-reduce:animate-none outline-none focus:outline-none hover:ring-4 hover:ring-primary/35 focus:ring-4 focus:ring-primary/45 active:ring-4 active:ring-primary/60 focus:shadow-[0_4px_16px_rgba(0,0,0,0.10)] active:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shrink-0">
              <BsChatRightText
                size={22}
                className="text-white"
              />
            </div>
            <span className="text-black text-[clamp(1.2rem,4vw,1.6rem)] sm:text-xl font-semibold leading-none">
              Chat with us now{" "}
              <span className="inline-block text-[1.7em] leading-none align-[-0.12em]">😁</span>
            </span>
          </div>
          <IoChevronForward size={22} className="text-black" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 min-h-0 mt-3 sm:mt-4 px-4 pb-2">
        <div className="rounded-2xl border mt-1 border-gray-200 p-2.5 sm:p-3 shadow-[0_2px_12px_rgba(0,0,0,0.07)] bg-white motion-safe:[animation:fadeIn_0.3s_ease-out,om-float_3.2s_ease-in-out_infinite] motion-reduce:animate-none">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Life category */}
            <button
              onClick={() => onSelectCategory("Life Assurance")}
              className="flex flex-col items-center cursor-pointer bg-[#dff4e8] rounded-2xl px-2 py-3 sm:p-3 transition-[box-shadow,transform] outline-none focus:outline-none hover:ring-4 hover:ring-primary/35 focus:ring-4 focus:ring-primary/45 active:ring-4 active:ring-primary/60 hover:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] focus:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:shadow-[0_0_0_2px_var(--primary),0_0_28px_var(--primary),0_0_80px_var(--primary)]"
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

            {/* GI category */}
            <button
              onClick={() => onSelectCategory("General Insurance")}
              className="flex flex-col items-center cursor-pointer bg-[#dff4e8] rounded-2xl px-2 py-3 sm:p-3 transition-[box-shadow,transform] outline-none focus:outline-none hover:ring-4 hover:ring-primary/35 focus:ring-4 focus:ring-primary/45 active:ring-4 active:ring-primary/60 hover:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] focus:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:shadow-[0_0_0_2px_var(--primary),0_0_28px_var(--primary),0_0_80px_var(--primary)]"
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
              onClick={() => onSelectCategory("Savings & Investment")}
              className="flex flex-col items-center cursor-pointer bg-[#dff4e8] rounded-2xl px-2 py-3 sm:p-3 transition-[box-shadow,transform] outline-none focus:outline-none hover:ring-4 hover:ring-primary/35 focus:ring-4 focus:ring-primary/45 active:ring-4 active:ring-primary/60 hover:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] focus:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:shadow-[0_0_0_2px_var(--primary),0_0_28px_var(--primary),0_0_80px_var(--primary)]"
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
