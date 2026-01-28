import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import FadeWrapper from "./FadeWrapper";
import HomeScreen from "../../screens/HomeScreen";
import { ChatScreen } from "./screens";
import ProductScreen from "../../screens/ProductScreen";
import ConversationScreen, { type ConversationSnapshot } from "../../screens/ConversationScreen";
import QuoteFormScreen from "../../screens/QuoteFormScreen";
import { findProductNodeById, type TopCategoryId } from "./productTree";

export default function ChatbotContainer({ onClose }: { onClose: () => void }) {
  const STORAGE_KEY = "om_chatbot_conversations_v1";

  const loadConversations = (): ConversationSnapshot[] => {
    try {
      if (typeof window === "undefined") return [];
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as ConversationSnapshot[];
    } catch {
      return [];
    }
  };

  const [screen, setScreen] = useState<"home" | "chat" | "products" | "conversations" | "quote">("home");
  const handleShowQuoteForm = () => setScreen("quote");
  const [selectedCategoryId, setSelectedCategoryId] = useState<TopCategoryId | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [chatSessionKey, setChatSessionKey] = useState(0);
  const [conversations, setConversations] = useState<ConversationSnapshot[]>(() => loadConversations());
  const latestMessagesRef = useRef<ConversationSnapshot["messages"]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<ConversationSnapshot["messages"] | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // Ignore storage quota / private mode errors
    }
  }, [conversations]);

  const selectedCategoryLabel = selectedCategoryId
    ? findProductNodeById(selectedCategoryId)?.label ?? "Products"
    : "Products";

  // Helper to reset chat state
  const resetChat = () => {
    setSelectedProduct(null);
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setLoadedMessages(null);
    resetChat();
    setChatSessionKey((k) => k + 1);
    setScreen("chat");
  };

  const saveOrArchiveConversationIfAny = () => {
    const messages = latestMessagesRef.current;
    const hasUserText = messages.some(
      (m) => m.sender === "user" && m.type === "text" && typeof m.text === "string" && m.text.trim() !== "",
    );
    if (!hasUserText) return;

    // If we are currently viewing an existing conversation, update it in-place.
    if (activeConversationId) {
      const updatedAt = Date.now();
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, messages, updatedAt } : c)),
      );
      return;
    }

    const now = Date.now();
    const firstUserText = messages.find(
      (m) => m.sender === "user" && m.type === "text" && typeof m.text === "string" && m.text.trim() !== "",
    );

    const titleBase =
      selectedProduct?.trim() ||
      (firstUserText && firstUserText.type === "text" ? firstUserText.text?.trim() : undefined) ||
      "Conversation";

    const snapshot: ConversationSnapshot = {
      id: String(now),
      createdAt: now,
      updatedAt: now,
      title: titleBase.length > 40 ? `${titleBase.slice(0, 40)}…` : titleBase,
      selectedProduct,
      messages,
    };

    setConversations((prev) => [snapshot, ...prev]);
    latestMessagesRef.current = [];
  };

  const openConversation = (conversationId: string) => {
    const convo = conversations.find((c) => c.id === conversationId);
    if (!convo) return;

    setActiveConversationId(conversationId);
    setLoadedMessages(convo.messages);
    setSelectedProduct(convo.selectedProduct ?? null);
    setChatSessionKey((k) => k + 1);
    setScreen("chat");
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setLoadedMessages(null);
      resetChat();
      setChatSessionKey((k) => k + 1);
    }
  };

  return (
    <div className="w-[430px] h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border-4 border-primary/20">

      {/* Header (hidden on home, chat, and conversations) */}
      {screen === "products" && (
        <ChatHeader
          title={selectedCategoryLabel}
          onBack={() => setScreen("home")}
          onClose={onClose}
        />
      )}

      {screen === "quote" && (
        <ChatHeader title="Get My Quote" onBack={() => setScreen("chat")} onClose={onClose} />
      )}

      {/* Screens */}
      <div className="flex-1 relative">

        {/* HOME */}
        <FadeWrapper isVisible={screen === "home"}>
          <HomeScreen
            onStartChat={() => {
              startNewConversation();
            }}
            onGoToConversation={() => {
              setScreen("conversations");
            }}
            onSelectCategory={(categoryId) => {
              setSelectedCategoryId(categoryId);
              setScreen("products");
            }}
          />
        </FadeWrapper>

        {/* CONVERSATIONS */}
        <FadeWrapper isVisible={screen === "conversations"}>
          <ConversationScreen
            conversations={conversations}
            onBack={() => setScreen("home")}
            onStartNew={() => startNewConversation()}
            onOpenConversation={openConversation}
            onDeleteConversation={deleteConversation}
          />
        </FadeWrapper>

        {/* CHAT */}
        <FadeWrapper isVisible={screen === "chat"}>
          <ChatScreen
            key={chatSessionKey}
            onBackClick={() => {
              saveOrArchiveConversationIfAny();
              resetChat();
              setActiveConversationId(null);
              setLoadedMessages(null);
              setScreen("conversations");
            }}
            onCloseClick={() => {
              saveOrArchiveConversationIfAny();
              onClose();
            }}
            selectedProduct={selectedProduct}
            initialMessages={loadedMessages ?? undefined}
            onShowQuoteForm={handleShowQuoteForm}
            onMessagesChange={(messages) => {
              latestMessagesRef.current = messages;

              if (activeConversationId) {
                const updatedAt = Date.now();
                setConversations((prev) =>
                  prev.map((c) => (c.id === activeConversationId ? { ...c, messages, updatedAt } : c)),
                );
              }
            }}
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
                saveOrArchiveConversationIfAny();
                setActiveConversationId(null);
                setLoadedMessages(null);
                setSelectedProduct(product);
                setChatSessionKey((k) => k + 1);
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
