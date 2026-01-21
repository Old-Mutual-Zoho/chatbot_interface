import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoChevronForward } from "react-icons/io5";
import { IoHome, IoChatbubbles } from "react-icons/io5";
import logo from "../../assets/Logo.png";
import product1 from "../../assets/product.png";
import product2 from "../../assets/product2.png";
import product3 from "../../assets/product3.png";


interface HomeScreenProps {
  onStartChat: () => void;
  onSelectCategory: (category: string) => void;
}

export default function HomeScreen({
  onStartChat,
  onSelectCategory,
}: HomeScreenProps) {
  return (
    <div className="flex flex-col h-full w-full bg-white">

      {/* ---------------- HEADER ---------------- */}
      <div className="rounded-b-[32px] h-70 p-6 pb-10 text-white"
        style={{
          background: "linear-gradient(135deg, #27924e 0%, #32C86E 100%)"
        }}
      >
        {/* Logo */}
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-7">
          <img
            src={logo}
            className="w-full h-full"
            alt="Old Mutual"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold leading-tight mb-2">Old Mutual</h1>
        <p className="text-base opacity-90 mb-3">Hey! How can we help you today</p>
      </div>


      {/* ---------------- CHAT NOW BUTTON ---------------- */}
      <div className="-mt-8 px-4">
        <button
          onClick={onStartChat}
          className="w-full bg-white rounded-xl shadow-md flex items-center justify-between px-4 py-3 pt-5 pb-5 cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center">
              <IoChatbubbleEllipsesOutline size={20} className="text-primary" />
            </div>
            <span className="font-medium text-gray-700 text-base">
              Chat with us now
            </span>
          </div>
          <IoChevronForward className="text-gray-500" size={22} />
        </button>
      </div>


      {/* ---------------- CATEGORY CARDS ---------------- */}
      <div className="mt-6 px-4 pb-4 mb-7 mt-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">

          {/* Grid of 3 cards */}
          <div className="grid grid-cols-3 gap-3">

            {/* PERSONAL */}
            <button
              onClick={() => onSelectCategory("Personal")}
              className="flex flex-col items-center bg-green-50 rounded-xl p-3 shadow-sm"
            >
              <div className="w-16 h-16 bg-green-200 rounded-full mb-2 overflow-hidden">
                <img
                  src={product1}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold pt-1 pb-1 text-gray-800">Personal</p>
              <span className="mt-1 text-xs text-white bg-primary px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

            {/* BUSINESS */}
            <button
              onClick={() => onSelectCategory("Business")}
              className="flex flex-col items-center bg-green-50 rounded-xl p-3 shadow-sm"
            >
              <div className="w-16 h-16 bg-green-200 rounded-full mb-2 overflow-hidden">
                <img
                  src={product2}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold pt-1 pb-1 text-gray-800">Business</p>
              <span className="mt-1 text-xs text-white bg-primary px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

            {/* SAVINGS */}
            <button
              onClick={() => onSelectCategory("Savings & Investment")}
              className="flex flex-col items-center bg-green-50 rounded-xl p-3 shadow-sm"
            >
              <div className="w-16 h-16 bg-green-200 rounded-full mb-2 overflow-hidden">
                <img
                  src={product3}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold pt-1 pb-1 text-gray-800 text-center leading-tight">
                savings & Investment
              </p>
              <span className="mt-1 text-xs text-white bg-primary px-3 py-1 rounded-md">
                Chat Now
              </span>
            </button>

          </div>
        </div>
      </div>


      {/* ---------------- NAVIGATION BAR ---------------- */}
      <div className="mt-auto bg-white border-t border-gray-200 px-10 py-4 flex items-center justify-between">

        <div className="flex flex-col items-center text-primary">
          <IoHome size={26} />
          <span className="text-sm mt-1">Home</span>
        </div>

        <div className="flex flex-col items-center text-gray-500">
          <IoChatbubbles size={26} />
          <span className="text-sm mt-1">Conversation</span>
        </div>

      </div>

    </div>
  );
}










