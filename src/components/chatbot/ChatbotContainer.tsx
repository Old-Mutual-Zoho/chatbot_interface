// import { useState } from "react";
// import ChatHeader from "./ChatHeader";
// import FadeWrapper from "./FadeWrapper";
// import HomeScreen from "./screens/HomeScreen";
// import ProductScreen from "./screens/ProductScreen";
// import ChatScreen from "./screens/ChatScreen";

// export default function ChatbotContainer({ onClose }) {
//   const [screen, setScreen] = useState<"home" | "products" | "chat">("home");
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

//   return (
//     <div className="w-[460px] h-[700px] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
//       {/* HEADER */}
//       <ChatHeader
//         title={
//           screen === "home"
//             ? "Old Mutual"
//             : screen === "products"
//             ? selectedCategory!
//             : "Conversation"
//         }
//         subtitle={screen === "home" ? "Hey! How can we help you today" : undefined}
//         onBack={screen !== "home" ? () => setScreen("home") : undefined}
//         onClose={onClose}
//       />

//       {/* SCREENS */}
//       <div className="relative flex-1">
//         {/* HOME */}
//         <FadeWrapper isVisible={screen === "home"}>
//           <HomeScreen
//             onStartChat={() => setScreen("chat")}
//             onSelectCategory={(cat) => {
//               setSelectedCategory(cat);
//               setScreen("products");
//             }}
//           />
//         </FadeWrapper>

//         {/* PRODUCT LIST */}
//         <FadeWrapper isVisible={screen === "products"}>
//           <ProductScreen
//             category={selectedCategory}
//             onSelectProduct={() => setScreen("chat")}
//           />
//         </FadeWrapper>

//         {/* CHAT */}
//         <FadeWrapper isVisible={screen === "chat"}>
//           <ChatScreen />
//         </FadeWrapper>
//       </div>
//     </div>
//   );
// }





import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoChevronForward } from "react-icons/io5";
import { IoHome, IoChatbubbles } from "react-icons/io5";

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
      <div className="rounded-b-[32px] p-6 pb-10 text-white"
        style={{
          background: "linear-gradient(135deg, #1B8F45 0%, #32C86E 100%)"
        }}
      >
        {/* Logo */}
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <img
            src="/oldmutual-logo.svg"
            className="w-7 h-7"
            alt="Old Mutual"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold leading-tight">Old Mutual</h1>
        <p className="text-base opacity-90">Hey! How can we help you today</p>
      </div>


      {/* ---------------- CHAT NOW BUTTON ---------------- */}
      <div className="-mt-8 px-4">
        <button
          onClick={onStartChat}
          className="w-full bg-white rounded-xl shadow-md flex items-center justify-between px-4 py-3"
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
      <div className="mt-6 px-4 pb-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">

          {/* Grid of 3 cards */}
          <div className="grid grid-cols-3 gap-3">

            {/* PERSONAL */}
            <button
              onClick={() => onSelectCategory("Personal")}
              className="flex flex-col items-center bg-green-50 rounded-xl p-3 shadow-sm"
            >
              <div className="w-full h-16 bg-green-200 rounded-lg mb-2 overflow-hidden">
                <img
                  src="/placeholder-personal.jpg"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-gray-800">Personal</p>
              <span className="mt-1 text-xs text-white bg-primary px-3 py-1 rounded-full">
                Chat Now
              </span>
            </button>

            {/* BUSINESS */}
            <button
              onClick={() => onSelectCategory("Business")}
              className="flex flex-col items-center bg-green-50 rounded-xl p-3 shadow-sm"
            >
              <div className="w-full h-16 bg-green-200 rounded-lg mb-2 overflow-hidden">
                <img
                  src="/placeholder-business.jpg"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-gray-800">Business</p>
              <span className="mt-1 text-xs text-white bg-primary px-3 py-1 rounded-full">
                Chat Now
              </span>
            </button>

            {/* SAVINGS */}
            <button
              onClick={() => onSelectCategory("Savings & Investment")}
              className="flex flex-col items-center bg-green-50 rounded-xl p-3 shadow-sm"
            >
              <div className="w-full h-16 bg-green-200 rounded-lg mb-2 overflow-hidden">
                <img
                  src="/placeholder-savings.jpg"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-gray-800 text-center leading-tight">
                savings & Investment
              </p>
              <span className="mt-1 text-xs text-white bg-primary px-3 py-1 rounded-full">
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






// import { useState } from "react";
// import { productTree } from "../chatbot/productTree";
// import type { ProductNode } from "../chatbot/productTree";
// import ChatHeader from "./ChatHeader";
// import FadeWrapper from "./FadeWrapper";
// import HomeScreen from "./screens/HomeScreen";
// import ProductScreen from "./screens/ProductScreen";
// import ChatScreen from "./screens/ChatScreen";

// export default function ChatbotContainer({ onClose }: { onClose: () => void }) {
//   const [screen, setScreen] = useState<"home" | "products" | "chat">("home");
//   const [selectedNode, setSelectedNode] = useState<ProductNode | null>(null);

//   return (
//     <div className="w-[460px] h-[700px] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">

//       {/* Show header on all screens except home */}
//       {screen !== "home" && (
//         <ChatHeader
//           title={screen === "products" ? selectedNode?.label ?? "" : "Conversation"}
//           onBack={() => setScreen("home")}
//           onClose={onClose}
//         />
//       )}

//       <div className="relative flex-1">

//         {/* HOME */}
//         <FadeWrapper isVisible={screen === "home"}>
//           <HomeScreen
//             businessUnits={productTree}
//             onSelectUnit={(node) => {
//               setSelectedNode(node);
//               setScreen("products");
//             }}
//             goToConversation={() => setScreen("chat")}
//           />
//         </FadeWrapper>

//         {/* PRODUCTS */}
//         <FadeWrapper isVisible={screen === "products"}>
//           {selectedNode && (
//             <ProductScreen
//               node={selectedNode}
//               onSelect={(child) => {
//                 setSelectedNode(child);

//                 // if this is last node (no children)
//                 if (!child.children || child.children.length === 0) {
//                   setScreen("chat");
//                 }
//               }}
//               onBack={() => setScreen("home")}
//             />
//           )}
//         </FadeWrapper>

//         {/* CHAT */}
//         <FadeWrapper isVisible={screen === "chat"}>
//           <ChatScreen />
//         </FadeWrapper>
//       </div>
//     </div>
//   );
// }
