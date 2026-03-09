import { useMemo } from "react";
import { IoChevronBack, IoChatbubbles, IoClose, IoHome, IoTrashOutline } from "react-icons/io5";
import type { ExtendedChatMessage } from "../components/chatbot/messages/actionCardTypes";
import type { ChatMessage } from "../components/chatbot/types";

// Chat messages with an optional timestamp.
export type ConversationMessage = ExtendedChatMessage & { timestamp?: string };

// What we store for each conversation.
export type ConversationSnapshot = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  selectedProduct?: string | null;
  messages: ConversationMessage[];
};

// Helper: is this a text message?
function isTextMessage(msg: ConversationMessage): msg is ChatMessage & { type: "text"; timestamp?: string } {
  return msg.type === "text";
}

// Helper: ignore action cards and loading bubbles.
function isDisplayableMessage(
  msg: ConversationMessage,
): msg is Exclude<ConversationMessage, { type: "action-card" } | { type: "loading" }> {
  return msg.type !== "action-card" && msg.type !== "loading";
}

export default function ConversationScreen({
  conversations,
  onBack,
  onStartNew,
  onOpenConversation,
  onDeleteConversation,
  onClose,
}: {
  conversations: ConversationSnapshot[];
  onBack: () => void;
  onStartNew: () => void;
  onOpenConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onClose: () => void;
}) {
  // Sort conversations by most recently updated
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  return (
    <div className="flex flex-col h-full w-full bg-white om-pattern-bg">
      {/* Header: navigation and close */}
      <div className="h-16 shrink-0 bg-primary text-white flex items-center px-4">
        <button
          onClick={onBack}
          className="mr-2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition cursor-pointer"
          aria-label="Back"
        >
          <IoChevronBack size={20} />
        </button>
        <h2 className="text-lg font-semibold">Conversations</h2>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <IoClose size={20} />
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Show empty state or list of conversations */}
        {sorted.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="text-gray-800 font-semibold mb-2">No previous conversations</div>
            <div className="text-gray-500 text-sm mb-6">
              Previous chats are stored temporarily and reset when you refresh.
            </div>
            <button
              type="button"
              onClick={onStartNew}
              className="bg-primary text-white px-5 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition cursor-pointer"
            >
              Start new conversation
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onStartNew}
              className="w-full bg-primary text-white px-4 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition cursor-pointer"
            >
              Start new conversation
            </button>

            {/* Each saved conversation */}
            {sorted.map((c) => {
              // Preview: last non-empty text.
              const lastText = [...c.messages].reverse().find((m) => {
                if (!isTextMessage(m)) return false;
                return typeof m.text === "string" && m.text.trim() !== "";
              });

              const preview = lastText && isTextMessage(lastText) ? lastText.text ?? "" : "";

              // Last updated time.
              const updated = new Date(c.updatedAt).toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });

              // Count only “real” messages.
              const displayMessages = c.messages.filter(isDisplayableMessage);

              return (
                <div key={c.id} className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center">
                  <button
                    type="button"
                    onClick={() => onOpenConversation(c.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{c.title}</div>
                        <div className="text-sm text-gray-500 truncate">{preview || "(no messages)"}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-xs text-gray-500 whitespace-nowrap">{updated}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{displayMessages.length} messages</div>
                  </button>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteConversation(c.id);
                    }}
                    className="text-red-600 hover:text-red-700 transition cursor-pointer p-1 ml-2"
                  >
                    <IoTrashOutline size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="mt-auto bg-gray-50 border-t border-gray-200 px-10 py-4 pl-15 pr-15 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="flex flex-col items-center text-primary/45 cursor-pointer"
        >
          <IoHome size={26} />
          <span className="text-sm mt-1">Home</span>
        </button>

        <div className="flex flex-col items-center text-primary" aria-current="page">
          <IoChatbubbles size={26} />
          <span className="text-sm mt-1">Conversation</span>
        </div>
      </div>
    </div>
  );
}
