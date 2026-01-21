import {
  IoChatbubbleEllipsesOutline,
  IoChevronForward,
  IoHome,
  IoChatbubbles,
} from "react-icons/io5";
import logo from "../assets/Logo.png";
import product1 from "../assets/product.png";
import product2 from "../assets/product2.png";
import product3 from "../assets/product3.png";

export default function HomeScreen({
  onStartChat,
  onGoToConversation,
}: {
  onStartChat: () => void;
  onGoToConversation: () => void;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div
        className="rounded-3xl p-6 pb-10 text-white"
        style={{
          background: "linear-gradient(135deg, #31A75F 0%, #54B44F 100%)",
        }}
      >
        {/* Logo */}
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-18">
          <img src={logo} className="w-full h-full" />
        </div>

        <h1 className="text-5xl font-bold mb-2">Old Mutual</h1>
        <p className="text-xl opacity-90 mb-5">Hey! How can we help you today</p>
      </div>

      {/* CHAT NOW */}
      <div className="-mt-8 px-4">
        <button
          onClick={onStartChat}
          className="w-full bg-white rounded-xl shadow-md flex justify-between items-center px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <IoChatbubbleEllipsesOutline
                size={20}
                className="text-primaryGreen"
              />
            </div>
            <span className="text-gray-700 font-medium">Chat with us now</span>
          </div>
          <IoChevronForward size={22} className="text-gray-500" />
        </button>
      </div>

      {/* Cards */}
      <div className="mt-6 px-4 pb-4">
        <div className="rounded-2xl border border-gray-200 p-4 shadow-sm bg-white">
          <div className="grid grid-cols-3 gap-3">
            {/* PERSONAL */}
            <button className="flex flex-col items-center cursor-pointer bg-green-100 rounded-xl p-3 shadow-xs">
              <img
                src={product1}
                className="w-13 h-13 rounded-full object-cover mb-2"
              />
              <p className="text-sm font-semibold pt-1 pb-1 text-gray-800">
                Personal
              </p>
              <span className="mt-1 text-xs bg-primary text-white px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

            {/* BUSINESS */}
            <button className="flex flex-col items-center cursor-pointer bg-green-100 rounded-xl p-3 shadow-xs">
              <img
                src={product2}
                className="w-13 h-13 rounded-full object-cover mb-2"
              />
              <p className="text-sm font-semibold pt-1 pb-1 text-gray-800">
                Business
              </p>
              <span className="mt-1 text-xs bg-primary text-white px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

            {/* SAVINGS */}
            <button className="flex flex-col items-center cursor-pointer bg-green-100 rounded-xl p-3 shadow-xs">
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
      <div className="mt-auto bg-white border-t px-10 py-4 flex justify-between items-center">
        <div className="flex flex-col items-center text-primaryGreen">
          <IoHome size={26} />
          <span className="text-sm mt-1">Home</span>
        </div>

        <button
          onClick={onGoToConversation}
          className="flex flex-col items-center text-gray-500"
        >
          <IoChatbubbles size={26} />
          <span className="text-sm mt-1">Conversation</span>
        </button>
      </div>
    </div>
  );
}
