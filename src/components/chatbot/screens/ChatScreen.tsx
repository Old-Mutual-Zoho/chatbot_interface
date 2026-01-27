import { useReducer, useRef, useEffect } from "react";
// import type { ChatMessage } from "../types"; // Removed unused import
import { MessageRenderer } from "../messages/MessageRenderer";
import WelcomeImage from "../../../assets/welcome.png";
import PatternImage from "../../../assets/pattern.jpg";
import { IoSend, IoArrowBack, IoClose } from "react-icons/io5";
import Logo from "../../../assets/Logo.png";
import type { ExtendedChatMessage } from "../messages/actionCardTypes";
import type { ActionOption } from "../ActionCard";

const getTimeString = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const mockBotReplies = [
  "That's a great question! Let me help you with that.",
  "I understand. Here's what I can do for you...",
  "Thanks for reaching out! I'd be happy to assist.",
  "I see. Let me provide you with more information.",
  "Absolutely! Here's what you need to know.",
  "Let me check that for you right away!",
];

const ACTION_OPTIONS: ActionOption[] = [
  { label: "General Info", value: "general" },
  { label: "Get My Quote", value: "quote" },
  { label: "Exclusions", value: "exclusions" },
  { label: "Buy Now", value: "buy" },
];

type State = {
  messages: ChatMessageWithTimestamp[];
  availableOptions: ActionOption[];
  showWelcomeCard: boolean;
  showActionCard: boolean;
  inputValue: string;
  isSending: boolean;
  loading: boolean;
  lastSelected: string | null;
};

type Action =
  | { type: "RESET"; selectedProduct?: string | null }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SEND_MESSAGE" }
  | { type: "RECEIVE_BOT_REPLY"; payload: string }
  | { type: "SELECT_OPTION"; payload: ActionOption }
  | { type: "RECEIVE_OPTION_RESPONSE"; payload: { response: string; option: ActionOption; remainingOptions: ActionOption[] } }
  | { type: "SET_LOADING"; payload: boolean };



const initialState = (selectedProduct?: string | null): State => {
  const welcomeMsg: ChatMessageWithTimestamp = {
    id: "welcome-1",
    type: "custom-welcome",
    sender: "bot",
    text: "",
    timestamp: getTimeString(),
  };
  const messages: ChatMessageWithTimestamp[] = [welcomeMsg];
  // Only add the selected product as a user message if it's a product selection (not an action card option)
  if (selectedProduct && !ACTION_OPTIONS.some(opt => opt.label === selectedProduct)) {
    messages.push({
      id: `product-${Date.now()}`,
      type: "text",
      sender: "user",
      text: selectedProduct,
      timestamp: getTimeString(),
    });
  }
  return {
    messages,
    availableOptions: ACTION_OPTIONS,
    showWelcomeCard: true,
    showActionCard: false,
    inputValue: "",
    isSending: false,
    loading: false,
    lastSelected: null,
  };
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET": {
      return initialState(action.selectedProduct);
    }
    case "SET_INPUT": {
      return { ...state, inputValue: action.payload };
    }
    case "SEND_MESSAGE": {
      if (state.inputValue.trim() === "") return state;
      const userMessage: ChatMessageWithTimestamp = {
        id: Date.now().toString(),
        type: "text",
        sender: "user",
        text: state.inputValue,
        timestamp: getTimeString(),
      };
      const loadingMessage: ChatMessageWithTimestamp = {
        id: `loading-${Date.now()}`,
        type: "loading",
        sender: "bot",
      };
      return {
        ...state,
        messages: [...state.messages, userMessage, loadingMessage],
        inputValue: "",
        isSending: true,
      };
    }
    case "RECEIVE_OPTION_RESPONSE": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      // Add the selected option as a user message if an option was selected and not already the last user message
      let newMessages = [...filtered];
      if (action.payload.option && action.payload.option.label) {
        const lastMsg = newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
        if (!(lastMsg && lastMsg.sender === "user" && lastMsg.text === action.payload.option.label)) {
          newMessages.push({
            id: `selected-${Date.now()}`,
            sender: "user",
            type: "text",
            text: action.payload.option.label,
            timestamp: getTimeString(),
          });
        }
      }
      // If response is empty, show loading bubble
      if (!action.payload.response) {
        newMessages.push({
          id: `loading-${Date.now()}`,
          sender: "bot",
          type: "loading",
        });
        return {
          ...state,
          messages: newMessages,
          showActionCard: false,
          loading: true,
        };
      }
      const botReply: ChatMessageWithTimestamp = {
        id: Date.now() + "-bot",
        sender: "bot",
        type: "text",
        text: action.payload.response,
        timestamp: getTimeString(),
      };
      newMessages.push(botReply);
      const remainingOptions = action.payload.remainingOptions;
        // If this is the initial help message after product selection, show all 4 options and no follow-up
        if (
          action.payload.response === "How can I help you today?" &&
          remainingOptions.length === 4
        ) {
          newMessages = [
            ...newMessages,
            {
              id: `action-card-${Date.now()}`,
              sender: "bot",
              type: "action-card",
              options: remainingOptions,
            } as ChatMessageWithTimestamp,
          ];
          return {
            ...state,
            messages: newMessages,
            showActionCard: true,
            loading: false,
            availableOptions: remainingOptions,
          };
        }
        // For follow-up after an option is selected, show follow-up message and only remaining options
        if (remainingOptions.length > 0) {
          newMessages = [
            ...newMessages,
            {
              id: `followup-${Date.now()}`,
              sender: "bot",
              type: "text",
              text: "Would you like to continue with another option?",
              timestamp: getTimeString(),
            },
            {
              id: `action-card-${Date.now()}`,
              sender: "bot",
              type: "action-card",
              options: remainingOptions,
            } as ChatMessageWithTimestamp,
          ];
          return {
            ...state,
            messages: newMessages,
            showActionCard: true,
            loading: false,
            availableOptions: remainingOptions,
          };
        }
        // If no options remain, just show the bot reply
        return {
          ...state,
          messages: newMessages,
          showActionCard: false,
          loading: false,
          availableOptions: [],
        };
    }
    case "SET_LOADING": {
      return { ...state, loading: action.payload };
    }
    default:
      return state;
  }
}


type ChatMessageWithTimestamp = ExtendedChatMessage & { timestamp?: string };

export const ChatScreen: React.FC<{
  onBackClick?: () => void;
  onCloseClick?: () => void;
  selectedProduct?: string | null;
}> = ({ onBackClick, onCloseClick, selectedProduct }) => {
  const [state, dispatch] = useReducer(reducer, selectedProduct, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchBotResponse = async (option: string) => {
    await new Promise((r) => setTimeout(r, 800));
    return `Here is the info for "${option}" (placeholder response).`;
  };


  // Reset all relevant state when selectedProduct changes by using a key
  // Reset all chat state when selectedProduct changes
  useEffect(() => {
    dispatch({ type: "RESET", selectedProduct });
    if (selectedProduct) {
      // After a product is selected, show help message and action card only
      const followupTimeout = setTimeout(() => {
        dispatch({
          type: "RECEIVE_OPTION_RESPONSE",
          payload: {
            response: "How can I help you today?",
            option: { label: "", value: "" },
            remainingOptions: ACTION_OPTIONS,
          },
        });
        dispatch({ type: "SET_LOADING", payload: false });
      }, 1200);
      return () => clearTimeout(followupTimeout);
    } else {
      // On initial load, just show help message and action card
      const followupTimeout = setTimeout(() => {
        dispatch({
          type: "RECEIVE_OPTION_RESPONSE",
          payload: {
            response: "How can I help you today?",
            option: { label: "", value: "" },
            remainingOptions: ACTION_OPTIONS,
          },
        });
        dispatch({ type: "SET_LOADING", payload: false });
      }, 1200);
      return () => clearTimeout(followupTimeout);
    }
  }, [selectedProduct]);

  // Initialize messages state directly instead of in useEffect
  // Removed effect that sets messages on mount; now handled in useState initializer

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!state.isSending) {
      inputRef.current?.focus();
    }
  }, [state.isSending]);

  const generateMockReply = () => {
    return mockBotReplies[Math.floor(Math.random() * mockBotReplies.length)];
  };



  const handleSendMessage = () => {
    if (state.inputValue.trim() === "") return;
    dispatch({ type: "SEND_MESSAGE" });
    setTimeout(() => {
      const reply = generateMockReply();
      dispatch({ type: "RECEIVE_BOT_REPLY", payload: reply });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !state.isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionCardSelect = async (option: ActionOption) => {
    // Compute the new available options after selection
    const newAvailableOptions = state.availableOptions.filter((o) => o.value !== option.value);
    dispatch({ type: "SELECT_OPTION", payload: option });
    // Show loading bubble (bot is typing)
    dispatch({
      type: "RECEIVE_OPTION_RESPONSE",
      payload: {
        response: "",
        option,
        remainingOptions: newAvailableOptions,
      },
    });
    // Wait before showing bot response
    setTimeout(async () => {
      const response = await fetchBotResponse(option.label);
      dispatch({ type: "RECEIVE_OPTION_RESPONSE", payload: { response, option, remainingOptions: newAvailableOptions } });
    }, 900);
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
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
        {state.messages.map((message, idx) => {
          if (message.type === "custom-welcome" && !state.showWelcomeCard) {
            return null;
          }
          if (message.type === "custom-welcome" && state.showWelcomeCard) {
            return (
              <div key={message.id} className="flex justify-start animate-fade-in mb-4">
                <div className="bg-white rounded-xl shadow-md p-0 overflow-hidden max-w-xs sm:max-w-sm md:max-w-md">
                  <img src={WelcomeImage} alt="Welcome" className="w-full object-cover" style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                  <div className="px-4 pt-3 pb-2">
                    <p className="font-semibold text-gray-900 text-base mb-1">Hi, I'm MIA! 👋</p>
                    <p className="text-gray-700 text-sm mb-1">I'm here to make your journey smooth and enjoyable.</p>
                    <div className="flex justify-end">
                      <span className="text-xs text-gray-500 mt-1">{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          // Calculate spacing between messages
          const prevMsg = idx > 0 ? state.messages[idx - 1] : null;
          let spacingClass = "";
          // Treat action card as a bot message for spacing
          const isBot = message.sender === "bot" || message.type === "action-card";
          const prevIsBot = prevMsg && (prevMsg.sender === "bot" || prevMsg.type === "action-card");

          if (prevMsg && ((prevMsg.sender === "user" && isBot) || (prevIsBot && message.sender === "user"))) {
            spacingClass = "mb-6"; // More space between user and bot
          } else if (idx !== state.messages.length - 1) {
            spacingClass = "mb-2"; // Minimal space between bot messages (including action card)
          }

          // Render the action card after the initial help message or the follow-up message if there are available options
          const shouldShowActionCard =
            state.showActionCard &&
            state.availableOptions.length > 0 &&
            (
              (message.type === "text" && message.text === "How can I help you today?" && state.availableOptions.length === 4) ||
              (message.type === "text" && message.text === "Would you like to continue with another option?" && state.availableOptions.length < 4)
            );
          if (shouldShowActionCard) {
            return (
              <>
                <div key={message.id} className={spacingClass}>
                  <MessageRenderer message={message} />
                </div>
                <div key={"action-card-" + message.id} className="flex justify-start mt-0">
                  <MessageRenderer
                    message={{
                      id: "dynamic-action-card",
                      sender: "bot",
                      type: "action-card",
                      options: state.availableOptions,
                    }}
                    onActionCardSelect={handleActionCardSelect}
                    loading={state.loading}
                    lastSelected={state.lastSelected}
                  />
                </div>
              </>
            );
          }
          if (message.type === "action-card") {
            // Do not render action cards from the messages array (handled above)
            return null;
          }
          // Add standard spacing between messages
          return (
            <div key={message.id} className={spacingClass}>
              <MessageRenderer message={message} />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4 bg-white">
        <div className="flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={state.inputValue}
            onChange={(e) => dispatch({ type: "SET_INPUT", payload: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={state.isSending}
            className="flex-1 px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition"
          />
          <button
            onClick={handleSendMessage}
            disabled={state.inputValue.trim() === "" || state.isSending}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-primary hover:bg-primary/90 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition text-sm flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 cursor-pointer flex-shrink-0"
          >
            <IoSend size={16} className="sm:block" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );

// ...existing code...
};
