import { useState } from "react";
import ChatHeader from "./ChatHeader";
import FadeWrapper from "./FadeWrapper";
import HomeScreen from "../../screens/HomeScreen";
import { ChatScreen } from "./screens";
import ProductScreen from "../../screens/ProductScreen";
import QuoteFormScreen from "../../screens/QuoteFormScreen";
import { findProductNodeById, type TopCategoryId } from "./productTree";

export default function ChatbotContainer({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<"home" | "chat" | "products" | "quote">("home");
    const handleShowQuoteForm = () => setScreen("quote");
  const [selectedCategoryId, setSelectedCategoryId] = useState<TopCategoryId | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const selectedCategoryLabel = selectedCategoryId
    ? findProductNodeById(selectedCategoryId)?.label ?? "Products"
    : "Products";

  // Helper to reset chat state
  const resetChat = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="w-[430px] h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border-4 border-primary/20">

      {/* Header (hidden on home and chat) */}
      {screen !== "home" && screen !== "chat" && (
        <ChatHeader
          title={selectedCategoryLabel}
          onBack={() => setScreen("home")}
          onClose={onClose}
        />
      )}

      {/* Screens */}
      <div className="flex-1 relative">

        {/* HOME */}
        <FadeWrapper isVisible={screen === "home"}>
          <HomeScreen
            onStartChat={() => {
              resetChat();
              setScreen("chat");
            }}
            onGoToConversation={() => {
              resetChat();
              setScreen("chat");
            }}
            onSelectCategory={(categoryId) => {
              setSelectedCategoryId(categoryId);
              setScreen("products");
            }}
          />
        </FadeWrapper>

        {/* CHAT */}
          <FadeWrapper isVisible={screen === "chat"}>
            <ChatScreen
              onBackClick={() => {
                resetChat();
                setScreen("home");
              }}
              onCloseClick={onClose}
              selectedProduct={selectedProduct}
              onShowQuoteForm={handleShowQuoteForm}
            />
          </FadeWrapper>
        {/* QUOTE FORM */}
        <FadeWrapper isVisible={screen === "quote"}>
          <QuoteFormScreen />
        </FadeWrapper>

        {/* PRODUCTS */}
        <FadeWrapper isVisible={screen === "products"}>
          {selectedCategoryId ? (
            <ProductScreen
              categoryId={selectedCategoryId}
              onBack={() => setScreen("home")}
              onSendProduct={(product) => {
                setSelectedProduct(product);
                setScreen("chat");
              }}
            />
          ) : (
            <div className="p-6 text-center text-gray-600">Select a category to view products.</div>
          )}
        </FadeWrapper>

      </div>
    </div>
  );
}
