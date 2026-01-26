import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../types";
import { MessageRenderer } from "../messages/MessageRenderer";
import WelcomeImage from "../../../assets/welcome.png";
import PatternImage from "../../../assets/pattern.jpg";
import { IoSend, IoArrowBack, IoClose } from "react-icons/io5";
import Logo from "../../../assets/Logo.png";

const mockBotReplies = [
  "That's a great question! Let me help you with that.",
  "I understand. Here's what I can do for you...",
  "Thanks for reaching out! I'd be happy to assist.",
  "I see. Let me provide you with more information.",
  "Absolutely! Here's what you need to know.",
];

interface ChatScreenProps {
  onBackClick?: () => void;
  onCloseClick?: () => void;
}

interface ChatMessageWithTimestamp extends ChatMessage {
  timestamp?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onBackClick, onCloseClick }) => {
  const [messages, setMessages] = useState<ChatMessageWithTimestamp[]>([]);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  // Show welcome card and follow-up after delays
  useEffect(() => {
    const welcomeTimeout = setTimeout(() => {
      setShowWelcomeCard(true);
      setMessages(prev => [
        ...prev,
        {
          id: "welcome-1",
          type: "custom-welcome",
          sender: "bot",
          text: "", // required for type
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        } as ChatMessageWithTimestamp
      ]);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: "welcome-2",
            type: "text",
            sender: "bot",
            text: "How can I help you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
        ]);
      }, 1200);
    }, 1200);
    return () => clearTimeout(welcomeTimeout);
  }, []);

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input on mount and maintain focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-focus input after bot finishes responding
  useEffect(() => {
    if (!isSending) {
      inputRef.current?.focus();
    }
  }, [isSending]);

  const generateMockReply = () => {
    return mockBotReplies[Math.floor(Math.random() * mockBotReplies.length)];
  };

  const getTimeString = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    setIsSending(true);

    // Add user message
    const userMessage: ChatMessageWithTimestamp = {
      id: Date.now().toString(),
      type: "text",
      sender: "user",
      text: inputValue,
      timestamp: getTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Add loading bubble
    const loadingMessage: ChatMessageWithTimestamp = {
      id: `loading-${Date.now()}`,
      type: "loading",
      sender: "bot",
    };

    setMessages((prev) => [...prev, loadingMessage]);

    // Replace loading with bot reply after 1 second
    setTimeout(() => {
      const botReply: ChatMessageWithTimestamp = {
        id: `bot-${Date.now()}`,
        type: "text",
        sender: "bot",
        text: generateMockReply(),
        timestamp: getTimeString(),
      };

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [...filtered, botReply];
      });
      setIsSending(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ backgroundImage: `url(${PatternImage})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.28 }}>
        <div className="absolute inset-0 w-full h-full" style={{ background: 'rgba(0,166,81,0.10)', mixBlendMode: 'multiply' }} />
      </div>
      <div className="relative z-10 flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary text-white px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        <button onClick={onBackClick} className="flex items-center text-white hover:bg-white/10 p-1 rounded transition cursor-pointer flex-shrink-0" title="Back">
          <IoArrowBack size={18} className="sm:block" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
            <img src={Logo} alt="Old Mutual" className="w-full h-full object-contain" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" title="Online"></span>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-white text-xs sm:text-sm truncate">Old Mutual Support</h3>
            <span className="text-xs text-white/80 leading-tight">Online</span>
          </div>
        </div>
        <button onClick={onCloseClick} className="flex items-center text-white hover:bg-white/10 p-1 rounded transition cursor-pointer flex-shrink-0" title="Close">
          <IoClose size={18} className="sm:block" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-8 sm:space-y-10">
        {messages.map((message) => {
          if (message.type === "custom-welcome" && !showWelcomeCard) {
            return null;
          }
          if (message.type === "custom-welcome" && showWelcomeCard) {
            return (
              <div key={message.id} className="flex justify-start animate-fade-in">
                <div className="bg-white rounded-xl shadow-md p-0 overflow-hidden max-w-xs sm:max-w-sm md:max-w-md">
                  <img src={WelcomeImage} alt="Welcome" className="w-full object-cover" style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                  <div className="px-4 pt-3 pb-2">
                    <p className="font-semibold text-gray-900 text-base mb-1">Hi Philemon!</p>
                    <p className="text-gray-700 text-sm mb-1">Welcome to Old Mutual Chat 👋</p>
                    <div className="flex justify-end">
                      <span className="text-xs text-gray-500 mt-1">{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return <MessageRenderer key={message.id} message={message} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4 bg-white">
        <div className="flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isSending}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-primary hover:bg-primary/90 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition text-sm flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 cursor-pointer flex-shrink-0"
          >
            <IoSend size={16} className="sm:block" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
