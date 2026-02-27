import { useEffect, useRef, useState } from "react";
import { createSession } from "../../services/api";
import axios from "axios";
import { type TopCategoryId } from "./productTree";
import type { ConversationSnapshot } from "../../screens/ConversationScreen";
import FadeWrapper from "./FadeWrapper";
import HomeScreen from "../../screens/HomeScreen";
import ConversationScreen from "../../screens/ConversationScreen";
import { ChatScreen } from "../../screens/ChatScreen";
import ProductScreen from "../../screens/ProductScreen";


import { AGENT_CONFIG } from '../../config/agentConfig';

export default function ChatbotContainer({ onClose }: { onClose: () => void }) {
  // Main wrapper for the chatbot screens.

  // Key used to save chats in localStorage.
  const STORAGE_KEY = "om_chatbot_conversations_v1";
  const loadConversations = (): ConversationSnapshot[] => {
    try {
      if (typeof window === "undefined") return [];
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      // If the saved data is broken, just start fresh.
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as ConversationSnapshot[];
    } catch {
      return [];
    }
  };

  // Simple local router for the widget.
  const [screen, setScreen] = useState<"home" | "chat" | "products" | "conversations">("home");
  const [selectedCategoryId, setSelectedCategoryId] = useState<TopCategoryId | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Used as a key to reset ChatScreen.
  const [chatSessionKey, setChatSessionKey] = useState(0);

  // Saved conversations.
  const [conversations, setConversations] = useState<ConversationSnapshot[]>(() => loadConversations());

  // Keep the latest messages so we can save them when leaving chat.
  const latestMessagesRef = useRef<ConversationSnapshot["messages"]>([]);
  const [latestMessages, setLatestMessages] = useState<ConversationSnapshot["messages"]>([]);

  // The conversation we are viewing (if any).
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Toggle the wide view.
  const [isExpanded, setIsExpanded] = useState(false);

  // Backend session ids.
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const getSessionErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) return "Failed to connect (missing/invalid API key)";
      if (status) return `Failed to connect (HTTP ${status})`;
      return "Failed to connect (network error)";
    }
    return "Failed to connect";
  };

  // Save conversations when they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // Ignore storage errors.
    }
  }, [conversations]);

  // Create a backend session when chat opens.
  useEffect(() => {
    if (screen === "chat" && !userId && !sessionId) {
      (async () => {
        try {
          const apiKey = import.meta.env.VITE_API_KEY;
          if (!apiKey) {
            setSessionError("Missing VITE_API_KEY (set it in .env and restart Vite)");
            return;
          }
          setSessionError(null);
          const { user_id, session_id } = await createSession("web-user-" + Math.random().toString(36).slice(2, 10));
          setUserId(user_id);
          setSessionId(session_id);
        } catch (e) {
          // Surface errors so we don't stay stuck in "Connecting..." with no clue.
          // The backend requires an API key in most environments.
          console.error("Failed to create session", e);
          setSessionError(getSessionErrorMessage(e));
        }
      })();
    }
  }, [screen, userId, sessionId]);

  const resetChat = () => {
    setSelectedProduct(null);
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    resetChat();
    setChatSessionKey((k) => k + 1);
    setScreen("chat");
  };

  const saveOrArchiveConversationIfAny = () => {
    const messages = latestMessagesRef.current;

    // Do not save empty chats.
    const hasUserText = messages.some(
      (m) => m.sender === "user" && m.type === "text" && typeof m.text === "string" && m.text.trim() !== "",
    );
    if (!hasUserText) return;

    // If we opened a saved chat, update it.
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
    setSelectedProduct(convo.selectedProduct ?? null);
    setChatSessionKey((k) => k + 1);
    setScreen("chat");
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      resetChat();
      setChatSessionKey((k) => k + 1);
    }
  };

  const [chatMode, setChatMode] = useState<'bot' | 'human'>('bot');

  return (
    <div
      className={
        [
          'flex flex-col w-full h-full bg-white overflow-visible min-h-0 pt-2',
        ].join(' ')
      }
    >
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
            onClose={() => {
              saveOrArchiveConversationIfAny();
              onClose();
            }}
          />
        </FadeWrapper>
        <FadeWrapper isVisible={screen === "chat"}>
          <ChatScreen
            key={chatSessionKey}
            onBackClick={() => {
              saveOrArchiveConversationIfAny();
              resetChat();
              setActiveConversationId(null);
              setScreen("conversations");
            }}
            onCloseClick={() => {
              saveOrArchiveConversationIfAny();
              onClose();
            }}
            selectedProduct={selectedProduct}
            userId={userId}
            sessionId={sessionId}
            sessionLoading={!userId || !sessionId}
            sessionError={sessionError}
            initialMessages={
              activeConversationId
                ? (conversations.find((c) => c.id === activeConversationId)?.messages ?? [])
                : (latestMessages.length > 0 ? latestMessages : undefined)
            }
            onMessagesChange={(messages) => {
              latestMessagesRef.current = messages;
              setLatestMessages(messages);
            }}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((prev) => !prev)}
            agentConfig={AGENT_CONFIG}
            chatMode={chatMode}
            setChatMode={setChatMode}
          />
        </FadeWrapper>
        {/* PRODUCTS */}
        <FadeWrapper isVisible={screen === "products"}>
          {selectedCategoryId ? (
            <ProductScreen
              categoryId={selectedCategoryId}
              onBack={() => setScreen("home")}
              onClose={() => {
                saveOrArchiveConversationIfAny();
                onClose();
              }}
              onSendProduct={(product) => {
                saveOrArchiveConversationIfAny();
                setActiveConversationId(null);
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
