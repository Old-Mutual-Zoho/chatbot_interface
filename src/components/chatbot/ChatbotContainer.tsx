import { useState } from "react";
import ChatHeader from "./ChatHeader";
import FadeWrapper from "./FadeWrapper";
import HomeScreen from "../../screens/HomeScreen";
import ChatScreen from "../../screens/ChatScreen";
import ProductScreen from "../../screens/ProductScreen";
import { findProductNodeById, type TopCategoryId } from "./productTree";

export default function ChatbotContainer({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<"home" | "chat" | "products">("home");
  const [selectedCategoryId, setSelectedCategoryId] = useState<TopCategoryId | null>(null);

  const selectedCategoryLabel = selectedCategoryId
    ? findProductNodeById(selectedCategoryId)?.label ?? "Products"
    : "Products";

  return (
    <div className="w-[430px] h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">

      {/* Header (hidden on home) */}
      {screen !== "home" && (
        <ChatHeader
          title={screen === "chat" ? "Conversation" : selectedCategoryLabel}
          onBack={() => setScreen("home")}
          onClose={onClose}
        />
      )}

      {/* Screens */}
      <div className="flex-1 relative">

        {/* HOME */}
        <FadeWrapper isVisible={screen === "home"}>
          <HomeScreen
            onStartChat={() => setScreen("chat")}
            onGoToConversation={() => setScreen("chat")}
            onSelectCategory={(categoryId) => {
              setSelectedCategoryId(categoryId);
              setScreen("products");
            }}
          />
        </FadeWrapper>

        {/* CHAT */}
        <FadeWrapper isVisible={screen === "chat"}>
          <ChatScreen />
        </FadeWrapper>

        {/* PRODUCTS */}
        <FadeWrapper isVisible={screen === "products"}>
          {selectedCategoryId ? (
            <ProductScreen
              categoryId={selectedCategoryId}
              onBack={() => setScreen("home")}
            />
          ) : (
            <div className="p-6 text-center text-gray-600">Select a category to view products.</div>
          )}
        </FadeWrapper>

      </div>
    </div>
  );
}
