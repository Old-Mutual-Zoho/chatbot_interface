import { useState } from "react";
import ChatHeader from "./ChatHeader";
import FadeWrapper from "./FadeWrapper";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import ChatScreen from "./screens/ChatScreen";

export default function ChatbotContainer({ onClose }) {
  const [screen, setScreen] = useState<"home" | "products" | "chat">("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="w-[460px] h-[700px] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
      {/* HEADER */}
      {/* <ChatHeader
        title={
          screen === "home"
            ? "Old Mutual"
            : screen === "products"
            ? selectedCategory!
            : "Conversation"
        }
        subtitle={screen === "home" ? "Hey! How can we help you today" : undefined}
        onBack={screen !== "home" ? () => setScreen("home") : undefined}
        onClose={onClose}
      /> */}

      {/* SCREENS */}
      <div className="relative flex-1">
        {/* HOME */}
        <FadeWrapper isVisible={screen === "home"}>
          <HomeScreen
            onStartChat={() => setScreen("chat")}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setScreen("products");
            }}
          />
        </FadeWrapper>

        {/* PRODUCT LIST */}
        <FadeWrapper isVisible={screen === "products"}>
          <ProductScreen
            category={selectedCategory}
            onSelectProduct={() => setScreen("chat")}
          />
        </FadeWrapper>

        {/* CHAT */}
        <FadeWrapper isVisible={screen === "chat"}>
          <ChatScreen />
        </FadeWrapper>
      </div>
    </div>
  );
}
