import {
  IoChevronForward,
  IoHome,
  IoChatbubbles,
} from "react-icons/io5";
import { BsChatRightText } from "react-icons/bs";
import OMlogo from "../assets/OMLogo.png";
import product1 from "../assets/product.png";
import product2 from "../assets/product2.png";
import product3 from "../assets/product3.png";
import type { TopCategoryId } from "../components/chatbot/productTree";

export default function HomeScreen({
  onStartChat,
  onGoToConversation,
  onSelectCategory,
}: {
  onStartChat: () => void;
  onGoToConversation: () => void;
  onSelectCategory: (categoryId: TopCategoryId) => void;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div
        className="rounded-3xl p-6 pb-10 text-white bg-gradient-to-br from-primary to-primary/80"
      >
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
        <div className="rounded-2xl border mt-3 border-gray-200 p-4 shadow-sm bg-white">
          <div className="grid grid-cols-3 gap-3">
            {/* Personal category */}
            <button
              onClick={() => onSelectCategory("personal")}
              className="flex flex-col items-center cursor-pointer bg-green-100 rounded-xl p-3 shadow-xs"
            >
              <img
                src={product1}
                className="w-13 h-13 rounded-full object-cover mb-2"
              />
              <p className="text-sm font-semibold pt-1 pb-1 text-gray-800">
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
              <p className="text-sm font-semibold pt-1 pb-1 text-gray-800">
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
              <p className="text-xs font-semibold text-center leading-tight">
                {" "}
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
