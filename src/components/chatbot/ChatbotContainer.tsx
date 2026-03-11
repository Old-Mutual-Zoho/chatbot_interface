import { useCallback, useEffect, useRef, useState } from "react";
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

export default function ChatbotContainer({
  onClose,
  initialScreen = "home",
}: {
  onClose: () => void;
  initialScreen?: "home" | "chat" | "products" | "conversations";
}) {
  // Main wrapper for the chatbot screens.

  // Key used to store conversations for the current browser session only.
  // NOTE: We intentionally do NOT persist chats permanently.
  const STORAGE_KEY = "om_chatbot_conversations_v1";
  const loadConversations = (): ConversationSnapshot[] => {
    try {
      if (typeof window === "undefined") return [];

      // Cleanup legacy permanent storage (users should not see week-old chats).
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors.
      }

      const raw = window.sessionStorage.getItem(STORAGE_KEY);
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
  const [screen, setScreen] = useState<"home" | "chat" | "products" | "conversations">(initialScreen);
  const [selectedCategoryId, setSelectedCategoryId] = useState<TopCategoryId | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Used as a key to reset ChatScreen.
  const [chatSessionKey, setChatSessionKey] = useState(0);

  // Saved conversations.
  const [conversations, setConversations] = useState<ConversationSnapshot[]>(() => loadConversations());

  // Keep the latest messages so we can save them when leaving chat.
  const latestMessagesRef = useRef<ConversationSnapshot["messages"]>([]);

  // The conversation we are viewing (if any).
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Toggle the wide view.
  const [isExpanded, setIsExpanded] = useState(false);

  // When set, the next time we enter ChatScreen we should immediately trigger
  // the existing agent escalation flow (same logic as clicking "Talk to Agent").
  const [autoConnectAgent, setAutoConnectAgent] = useState(false);

  // Post-conversation feedback state (applies to both guided + normal conversations).
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [pendingExit, setPendingExit] = useState<"back" | "close" | null>(null);

  // Backend session ids.
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const getSessionErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        typeof error.response?.data === "object" && error.response?.data && "message" in error.response.data
          ? String((error.response.data as { message?: unknown }).message)
          : undefined;
      if (status === 401) return "Failed to connect (missing/invalid API key)";
      if (status === 404 && message?.toLowerCase().includes("application not found")) {
        return "Failed to connect (backend URL not found / Railway app missing)";
      }
      if (status) return `Failed to connect (HTTP ${status})`;
      return "Failed to connect (network error)";
    }
    return "Failed to connect";
  };

  const clearStoredConversations = () => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
    // Also remove any legacy permanent storage that may still exist.
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
    setConversations([]);
    latestMessagesRef.current = [];
    setActiveConversationId(null);
  };

  // Save conversations when they change (session-only).
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
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
    setIsConversationEnded(false);
    setPendingExit(null);
    setActiveConversationId(null);
    setChatMode('bot');
    latestMessagesRef.current = [];
    resetChat();
    setChatSessionKey((k) => k + 1);
    setScreen("chat");
  };

  const startChatWithAgent = () => {
    setAutoConnectAgent(true);
    startNewConversation();
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

    setIsConversationEnded(false);
    setPendingExit(null);
    setChatMode('bot');
    setActiveConversationId(conversationId);
    setSelectedProduct(convo.selectedProduct ?? null);

    // Seed the current message buffer so ChatScreen mounts with the stored history.
    // (ChatScreen reads initialMessages only on mount.)
    latestMessagesRef.current = convo.messages;

    setChatSessionKey((k) => k + 1);
    setScreen("chat");
  };

  const handleMessagesChange = useCallback((messages: ConversationSnapshot["messages"]) => {
    latestMessagesRef.current = messages;
  }, []);

  const performBack = () => {
    saveOrArchiveConversationIfAny();
    resetChat();
    setActiveConversationId(null);
    setScreen("conversations");
  };

  const performClose = () => {
    // Closing the widget should discard conversations (no permanent history).
    clearStoredConversations();
    onClose();
  };

  const shouldShowPostConversationFeedback = (messages: ConversationSnapshot["messages"]) => {
    type Msg = ConversationSnapshot["messages"][number];

    const isMeaningfulUserMessage = (m: Msg) =>
      m.sender === "user" &&
      m.type === "text" &&
      typeof m.text === "string" &&
      m.text.trim() !== "";

    // A bot reply must occur after a user message; ignore initial welcome/typing bubbles.
    const isMeaningfulBotReply = (m: Msg) => {
      if (m.sender !== "bot") return false;
      if (m.type === "loading" || m.type === "custom-welcome") return false;
      if (m.type !== "text") return true;
      return typeof m.text === "string" && m.text.trim() !== "";
    };

    const firstUserIndex = messages.findIndex(isMeaningfulUserMessage);
    if (firstUserIndex === -1) return false;
    return messages.slice(firstUserIndex + 1).some(isMeaningfulBotReply);
  };

  const requestEndConversation = (exitType: "back" | "close") => {
    if (!isConversationEnded) {
      // Only show the feedback card if the user actually had a bot conversation.
      if (!shouldShowPostConversationFeedback(latestMessagesRef.current)) {
        if (exitType === "back") performBack();
        else performClose();
        return;
      }
      setIsConversationEnded(true);
      setPendingExit(exitType);
      return;
    }
    // If already ended, treat another click as "exit now".
    if (exitType === "back") performBack();
    else performClose();
  };

  const handleSubmitFeedback = (payload: { rating: number; feedback: string }) => {
    void payload;
    // Keep this component reusable: integration can later POST to an API.
    // For now, proceed with whatever exit the user originally requested.
    const exit = pendingExit;
    setIsConversationEnded(false);
    setPendingExit(null);
    if (exit === "back") performBack();
    else if (exit === "close") performClose();
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
          'flex flex-col w-full h-full bg-white overflow-visible min-h-0',
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
            onChatWithAgent={() => {
              startChatWithAgent();
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
              performClose();
            }}
          />
        </FadeWrapper>
        <FadeWrapper isVisible={screen === "chat"}>
          <ChatScreen
            key={chatSessionKey}
            onBackClick={() => requestEndConversation("back")}
            onCloseClick={() => requestEndConversation("close")}
            selectedProduct={selectedProduct}
            userId={userId}
            sessionId={sessionId}
            sessionLoading={!userId || !sessionId}
            sessionError={sessionError}
            isConversationEnded={isConversationEnded}
            onSubmitFeedback={handleSubmitFeedback}
            autoConnectAgent={autoConnectAgent}
            onAutoConnectAgentHandled={() => setAutoConnectAgent(false)}
            initialMessages={
              activeConversationId
                ? (conversations.find((c) => c.id === activeConversationId)?.messages ?? [])
                : undefined
            }
            onMessagesChange={handleMessagesChange}
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
                performClose();
              }}
              onSendProduct={(product) => {
                saveOrArchiveConversationIfAny();
                setActiveConversationId(null);
                setSelectedProduct(product);
                setIsConversationEnded(false);
                setPendingExit(null);
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
