import ChatHeader from "../components/chatbot/ChatHeader";
type State = {
  messages: ChatMessageWithTimestamp[];
  availableOptions: ActionOption[];
  showWelcomeCard: boolean;
  showActionCard: boolean;
  inputValue: string;
  isSending: boolean;
  isGuidedFlow: boolean;
  loading: boolean;
  lastSelected: string | null;
  isPurchasing: boolean;
  isPaymentMode: boolean;
  showQuoteForm: boolean;
  quoteFormKey: number;
};
import { useReducer, useRef, useEffect, useState } from "react";
import { MessageRenderer } from "../components/chatbot/messages/MessageRenderer";
import WelcomeImage from "../assets/Welcome.png";
import PatternImage from "../assets/pattern.jpg";
import { IoSend } from "react-icons/io5";
import QuoteFormScreen from "./QuoteFormScreen";
import type { ExtendedChatMessage } from "../components/chatbot/messages/actionCardTypes";
import type { ActionOption } from "../components/chatbot/ActionCard";
import { sendChatMessage, initiatePurchase } from "../services/api";
import { useGeneralInformation } from "../hooks/useGeneralInformation";
import { GeneralInfoCard } from "../components/chatbot/messages/GeneralInfoCard";
import { AGENT_CONFIG } from "../config/agentConfig";

const getTimeString = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


const ACTION_OPTIONS: ActionOption[] = [
  { label: "General Info", value: "personal_accident" },
  { label: "Get My Quote", value: "quote" },
  { label: "Exclusions", value: "exclusions" },
  { label: "Buy Now", value: "buy" },
];

const toBackendProductKey = (product: string | null | undefined): string | null => {
  if (!product) return null;
  return (
    PRODUCT_KEY_MAP[product] ||
    PRODUCT_KEY_MAP[product.replace(/\s+/g, "_").toLowerCase()] ||
    product
  );
};

type ChatInitOptions = { selectedProduct?: string | null; isGuidedFlow: boolean; initialMessages?: ChatMessageWithTimestamp[] };
type Action =
  { type: "RESET"; selectedProduct?: string | null }
| { type: "SET_INPUT"; payload: string }
| { type: "SEND_MESSAGE" }
| { type: "RECEIVE_BOT_REPLY"; payload: string }
  | { type: "SELECT_OPTION"; payload: ActionOption }
  | { type: "RECEIVE_OPTION_RESPONSE"; payload: { response: string; option: ActionOption; remainingOptions: ActionOption[] } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SHOW_QUOTE_FORM"; payload?: { label?: string } }
  | { type: "HIDE_QUOTE_FORM" }
  | { type: "QUOTE_FORM_SUBMITTED" }
  | { type: "START_BUY_FLOW" }
  | { type: "SHOW_PURCHASE_SUMMARY"; payload: { productName: string; price: string; duration: string } }
  | { type: "SHOW_PAYMENT_METHOD_SELECTOR" }
  | { type: "SELECT_PAYMENT_METHOD"; payload: "mobile" | "card" | "flexipay" }
  | { type: "SHOW_MOBILE_MONEY_FORM" }
  | { type: "SUBMIT_MOBILE_PAYMENT"; payload: string }

  | { type: "SHOW_PAYMENT_LOADING_SCREEN" }
  | { type: "CONFIRM_PURCHASE" }
  | { type: "PURCHASE_SUCCESS"; payload: string }
  | { type: "PURCHASE_FAILED"; payload: string };



  const initialState = (opts: ChatInitOptions): State => {
  const { selectedProduct, isGuidedFlow } = opts;
  const initialMessages = opts.initialMessages;
  if (initialMessages && initialMessages.length > 0) {
    return {
      messages: initialMessages,
      availableOptions: ACTION_OPTIONS,
      showWelcomeCard: true,
      showActionCard: false,
      inputValue: "",
      isSending: false,
      isGuidedFlow,
      loading: false,
      lastSelected: null,
      isPurchasing: false,
      isPaymentMode: false,
      showQuoteForm: false,
      quoteFormKey: 0,
    };
  }
  const welcomeMsg: ChatMessageWithTimestamp = {
    id: "welcome-1",
    type: "custom-welcome",
    sender: "bot",
    text: "",
    timestamp: getTimeString(),
  };
  const messages: ChatMessageWithTimestamp[] = [welcomeMsg];
  if (isGuidedFlow && selectedProduct && !ACTION_OPTIONS.some(opt => opt.label === selectedProduct)) {
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
    isGuidedFlow,
    loading: false,
    lastSelected: null,
    isPurchasing: false,
    isPaymentMode: false,
    showQuoteForm: false,
    quoteFormKey: 0,
  };
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET": {
      // Pass correct ChatInitOptions to initialState
      return initialState({
        selectedProduct: action.selectedProduct,
        isGuidedFlow: !!action.selectedProduct,
      });
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
        text: "",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...state.messages, userMessage, loadingMessage],
        inputValue: "",
        isSending: true,
      };
    }
    case "RECEIVE_BOT_REPLY": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      const botReply: ChatMessageWithTimestamp = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        type: "text",
        text: action.payload,
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...filtered, botReply],
        isSending: false,
        loading: false,
        showActionCard: false,
      };
    }
    case "SELECT_OPTION": {
      return {
        ...state,
        lastSelected: action.payload.value,
      };
    }
    case "RECEIVE_OPTION_RESPONSE": {
      const isGuidedFlow = state.isGuidedFlow;
      if (!isGuidedFlow) {
        const filtered = state.messages.filter((msg) => msg.type !== "loading");
        const newMessages = [...filtered];
        if (action.payload.response) {
          newMessages.push({
            id: Date.now() + "-bot",
            sender: "bot",
            type: "text",
            text: action.payload.response,
            timestamp: getTimeString(),
          });
        }
        return {
          ...state,
          messages: newMessages,
          showActionCard: false,
          loading: false,
          isSending: false,
        };
      }
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
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
          isSending: false,
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
      return {
        ...state,
        messages: newMessages,
        showActionCard: false,
        loading: false,
        availableOptions: [],
        isSending: false,
      };
    }
    case "SET_LOADING": {
      return { ...state, loading: action.payload };
    }
    case "SHOW_QUOTE_FORM": {
      const filtered = state.messages.filter(
        (msg) => msg.type !== "loading" && msg.type !== "action-card"
      );

      const label = action.payload?.label ?? "Get My Quote";
      const lastMsg = filtered.length > 0 ? filtered[filtered.length - 1] : null;
      const shouldAppendUserMsg = !(
        lastMsg &&
        lastMsg.sender === "user" &&
        lastMsg.type === "text" &&
        lastMsg.text === label
      );

      return {
        ...state,
        showQuoteForm: true,
        quoteFormKey: state.quoteFormKey + 1,
        showActionCard: false,
        loading: false,
        messages: shouldAppendUserMsg
          ? [
              ...filtered,
              {
                id: `quote-${Date.now()}`,
                sender: "user",
                type: "text",
                text: label,
                timestamp: getTimeString(),
              },
            ]
          : filtered,
      };
    }
    case "HIDE_QUOTE_FORM": {
      return {
        ...state,
        showQuoteForm: false,
      };
    }
    case "QUOTE_FORM_SUBMITTED": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      const confirmationMessage: ChatMessageWithTimestamp = {
        id: `form-confirm-${Date.now()}`,
        type: "text",
        sender: "bot",
        text: "Thank you! Your details have been submitted successfully. We'll get back to you shortly.",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        showQuoteForm: false,
        messages: [...filtered, confirmationMessage],
      };
    }
    case "START_BUY_FLOW": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      const botReply: ChatMessageWithTimestamp = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        type: "text",
        text: "Great choice 👍 I'll help you complete your purchase.",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...filtered, botReply],
        showActionCard: false,
        loading: false,
        isPaymentMode: true,
        isSending: false,
        isPurchasing: true,
      };
    }
    case "SHOW_PURCHASE_SUMMARY": {
      const purchaseSummaryMsg: ChatMessageWithTimestamp = {
        id: `purchase-${Date.now()}`,
        sender: "bot",
        type: "purchase-summary",
        text: "",
        timestamp: getTimeString(),
        productName: action.payload.productName,
        price: action.payload.price,
        duration: action.payload.duration,
      };
      return {
        ...state,
        messages: [...state.messages, purchaseSummaryMsg],
        isPurchasing: true,
      };
    }
    case "SHOW_PAYMENT_METHOD_SELECTOR": {
      const paymentMethodMsg: ChatMessageWithTimestamp = {
        id: `payment-method-${Date.now()}`,
        sender: "bot",
        type: "payment-method-selector",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...state.messages, paymentMethodMsg],
        isPurchasing: true,
      };
    }
    case "SELECT_PAYMENT_METHOD": {
      return {
        ...state,
        isPurchasing: true,
      };
    }
    case "SHOW_MOBILE_MONEY_FORM": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      const confirmMsg: ChatMessageWithTimestamp = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        type: "text",
        text: "Great! I'll process your payment using Mobile Money",
        timestamp: getTimeString(),
      };
      const mobileMoneyMsg: ChatMessageWithTimestamp = {
        id: `mobile-money-${Date.now()}`,
        sender: "bot",
        type: "mobile-money-form",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...filtered, confirmMsg, mobileMoneyMsg],
        isPurchasing: true,
        loading: false,
      };
    }
    case "SUBMIT_MOBILE_PAYMENT": {
      // Remove mobile money form and show confirming message
      const filtered = state.messages.filter((msg) => msg.type !== "mobile-money-form" && msg.type !== "loading");
      const confirmMsg: ChatMessageWithTimestamp = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        type: "text",
        text: "Great! I'm confirming your payment...",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...filtered, confirmMsg],
        loading: true,
        isPurchasing: true,
      };
    }
    case "SHOW_PAYMENT_LOADING_SCREEN": {
      const loadingScreen: ChatMessageWithTimestamp = {
        id: `payment-loading-${Date.now()}`,
        sender: "bot",
        type: "payment-loading-screen",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...state.messages, loadingScreen],
        loading: true,
        isPurchasing: true,
      };
    }
    case "CONFIRM_PURCHASE": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      const loadingMessage: ChatMessageWithTimestamp = {
        id: `loading-${Date.now()}`,
        type: "loading",
        sender: "bot",
        text: "",
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...filtered, loadingMessage],
        loading: true,
        isPurchasing: true,
      };
    }
    case "PURCHASE_SUCCESS": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      const botReply: ChatMessageWithTimestamp = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        type: "text",
        text: action.payload,
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...filtered, botReply],
        loading: false,
        isPurchasing: false,
        isPaymentMode: false,
      };
    }
    case "PURCHASE_FAILED": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      const botReply: ChatMessageWithTimestamp = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        type: "text",
        text: action.payload,
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...filtered, botReply],
        loading: false,
        isPurchasing: false,
        showActionCard: false,
        isPaymentMode: false,
      };
    }
    default:
      return state;
  }
}


type ChatMessageWithTimestamp = (ExtendedChatMessage & { timestamp?: string }) | {
  id: string;
  type: "purchase-summary";
  sender: "bot";
  timestamp?: string;
  productName: string;
  price: string;
  duration: string;
} | {
  id: string;
  type: "payment-method-selector";
  sender: "bot";
  timestamp?: string;
} | {
  id: string;
  type: "mobile-money-form";
  sender: "bot";
  timestamp?: string;
  isLoading?: boolean;
} | {
  id: string;
  type: "payment-loading-screen";
  sender: "bot";
  timestamp?: string;
};


type ChatScreenProps = {
  onBackClick?: () => void;
  onCloseClick?: () => void;
  selectedProduct?: string | null;
  userId: string | null;
  sessionId: string | null;
  sessionLoading?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  renderCustomContent?: (props: { selectedProduct?: string | null; userId: string | null }) => React.ReactNode;
  agentConfig: {
    name: string;
    avatar: string;
    status: string;
  };
  chatMode: 'bot' | 'human';
  setChatMode: (mode: 'bot' | 'human') => void;
  initialMessages?: any[];
  onMessagesChange?: (messages: any[]) => void;
};

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBackClick,
  onCloseClick,
  selectedProduct,
  userId,
  sessionId: sessionIdProp,
  sessionLoading,
  // ...existing code...
  renderCustomContent,
  agentConfig,
  chatMode,
  setChatMode,
  initialMessages,
  onMessagesChange,
}) => {
  // Expand/collapse state for ChatHeader
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggleExpand = () => setIsExpanded((prev) => !prev);
  // Robust session management: persist sessionId from backend, update on backend response, use for all requests, reset only on new conversation/session expiry
  const [sessionId, setSessionId] = useState<string | null>(sessionIdProp ?? null);
  const isGuidedFlow = !!selectedProduct;
  const [state, dispatch] = useReducer(
    reducer,
    { selectedProduct, isGuidedFlow, initialMessages },
    initialState,
  );
  // Escalation state
  // const [escalating, setEscalating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quoteFormRef = useRef<HTMLDivElement>(null);

  // General Info UI state (must be after selectedProduct and sessionId are defined)
  const [showGeneralInfo, setShowGeneralInfo] = useState(false);
  const selectedProductRef = useRef<string | null>(
    toBackendProductKey(selectedProduct)
  );
  useEffect(() => {
    selectedProductRef.current = toBackendProductKey(selectedProduct);
  }, [selectedProduct]);
  const { info: generalInfo, loading: generalInfoLoading, error: generalInfoError, fetchInfo } = useGeneralInformation(sessionId, selectedProductRef.current);
 

  // Fetch bot response and manage sessionId
  const fetchBotResponse = async (option: string) => {
    if (!userId) {
      return "Connecting to chat...";
    }
    try {
      const response = await sendChatMessage({ user_id: userId, session_id: sessionId || '', message: option });
      // Update sessionId if backend returns a new one
      if (response && typeof response === 'object') {
        if ('session_id' in response && typeof response.session_id === 'string' && response.session_id !== sessionId) {
          setSessionId(response.session_id);
        } else if (
          response.response &&
          typeof response.response === 'object' &&
          'session_id' in response.response &&
          typeof response.response.session_id === 'string' &&
          response.response.session_id !== sessionId
        ) {
          setSessionId(response.response.session_id);
        }
      }
      if (typeof response === 'object' && response !== null) {
        if (typeof response.response === 'object' && response.response !== null && typeof response.response.response === 'string') {
          return response.response.response;
        }
        if (typeof response.response === 'string') {
          return response.response;
        }
        if (typeof response.message === 'string') {
          return response.message;
        }
        if (Array.isArray(response.options) && response.options.length > 0) {
          const optionsText = response.options.map((opt: { label: string }) => `- ${opt.label}`).join('\n');
          return `${response.message || response.response?.message || 'Please choose an option:'}\n${optionsText}`;
        }
        if (response.response && Array.isArray(response.response.options)) {
          const optionsText = response.response.options.map((opt: { label: string }) => `- ${opt.label}`).join('\n');
          return `${response.response.message || 'Please choose an option:'}\n${optionsText}`;
        }
      }
      return typeof response === 'string' ? response : 'Sorry, I could not understand the server response.';
    } catch {
      return "Sorry, I couldn't retrieve information from the server.";
    }
  };

  // Keep internal sessionId in sync once the backend session is created.
  // IMPORTANT: do not reset the whole chat when sessionIdProp changes, otherwise the first click can be wiped out.
  useEffect(() => {
    if (!sessionIdProp) return;
    setSessionId((prev) => (prev ?? sessionIdProp));
  }, [sessionIdProp]);

  // Reset all chat state when selectedProduct changes (new conversation)
  useEffect(() => {
    dispatch({ type: "RESET", selectedProduct });
    const followupTimeout = setTimeout(() => {
      dispatch({
        type: "RECEIVE_OPTION_RESPONSE",
        payload: {
          response: "How can I help you today?",
          option: { label: "", value: "" },
          remainingOptions: ACTION_OPTIONS,
        },
      });
    }, 600);
    return () => clearTimeout(followupTimeout);
  }, [selectedProduct]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (onMessagesChange) {
      onMessagesChange(state.messages);
    }
  }, [state.messages, onMessagesChange]);

  useEffect(() => {
    if (state.showQuoteForm) {
      quoteFormRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [state.showQuoteForm, state.quoteFormKey]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!state.isSending) {
      inputRef.current?.focus();
    }
  }, [state.isSending]);



  const handleSendMessage = () => {
    if (state.inputValue.trim() === "") return;
    dispatch({ type: "SEND_MESSAGE" });
    (async () => {
      const reply = await fetchBotResponse(state.inputValue);
      dispatch({ type: "RECEIVE_BOT_REPLY", payload: reply });
    })();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !state.isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // general info button for products
  const handleActionCardSelect = async (option: ActionOption) => {
    if (option.value === "talk-to-agent") {
      showConnectingLoader();
      return;
    }
      // Modular escalation functions
      function showConnectingLoader() {
        dispatch({
          type: "SHOW_PAYMENT_LOADING_SCREEN"
        });
        // Append loader message with text
        setTimeout(() => {
          switchToHumanAgent();
        }, 5000);
      }

      function switchToHumanAgent() {
        setChatMode && setChatMode('human');
        updateHeaderToHuman();
        appendHumanMessage();
      }

      function updateHeaderToHuman() {
        // Header will react to chatMode and agentConfig
      }

      function appendHumanMessage() {
        dispatch({
          type: "RECEIVE_BOT_REPLY",
          payload: "Hi 👋 This is Joy from Customer Support. How may I assist you today?",
        });
      }
    if (option.label === "General Info") {    
      // ...existing General Info logic...
      dispatch({
        type: "SELECT_OPTION",
        payload: option,
      });
      const remainingOptions = state.availableOptions.filter((o) => o.value !== option.value);
      if (!selectedProduct) {
        dispatch({
          type: "RECEIVE_OPTION_RESPONSE",
          payload: {
            response: "Please select a product first to get general information.",
            option,
            remainingOptions,
          },
        });
        return;
      }
      const productKey = PRODUCT_KEY_MAP[selectedProduct.replace(/\s+/g, '_').toLowerCase()] || selectedProduct;
      if (selectedProductRef && selectedProductRef.current !== productKey) {
        selectedProductRef.current = productKey;
      }
      try {
        const data = await fetchInfo();
        let infoText = "";
        if (data && (data.definition || data.benefits || data.eligibility)) {
          if (data.definition) infoText += `Definition: ${data.definition}\n`;
          if (data.benefits && data.benefits.length > 0) infoText += `Benefits: ${data.benefits.join(", ")}\n`;
          if (data.eligibility) infoText += `Eligibility: ${data.eligibility}`;
        } else if (generalInfoError) {
          infoText = generalInfoError;
        } else {
          infoText = "No general information found for this product.";
        }
        dispatch({
          type: "RECEIVE_OPTION_RESPONSE",
          payload: {
            response: infoText.trim() || "General information found.",
            option,
            remainingOptions,
          },
        });
      } catch {
        dispatch({
          type: "RECEIVE_OPTION_RESPONSE",
          payload: {
            response: "Failed to fetch general information.",
            option,
            remainingOptions,
          },
        });
      }
      return;
    }
    // Handle Buy Now flow
    if (option.value === "buy") {
      dispatch({ type: "START_BUY_FLOW" });
      if (!selectedProduct) {
        setTimeout(() => {
          dispatch({
            type: "RECEIVE_BOT_REPLY",
            payload: "Please select a product first before proceeding to purchase.",
          });
          setTimeout(() => {
            dispatch({ type: "RESET", selectedProduct: null });
          }, 600);
        }, 900);
        return;
      }
      setTimeout(() => {
        dispatch({ type: "SHOW_PAYMENT_METHOD_SELECTOR" });
      }, 1200);
      return;
    }
    // Handle Get My Quote (quote) flow
    if (option.value === "quote") {
      // Mark the option as selected (for UI state)
      dispatch({ type: "SELECT_OPTION", payload: option });
      // Show the quote form (renders QuoteFormScreen)
      dispatch({ type: "SHOW_QUOTE_FORM", payload: { label: option.label } });
      // Do NOT dispatch RECEIVE_OPTION_RESPONSE for 'quote' (prevents bot message/loading)
      return;
    }
    // Compute the new available options after selection
    const newAvailableOptions = state.availableOptions.filter((o) => o.value !== option.value);
    dispatch({ type: "SELECT_OPTION", payload: option });
    dispatch({
      type: "RECEIVE_OPTION_RESPONSE",
      payload: {
        response: "",
        option,
        remainingOptions: newAvailableOptions,
      },
    });
    setTimeout(async () => {
      const response = await fetchBotResponse(option.label);
      dispatch({ type: "RECEIVE_OPTION_RESPONSE", payload: { response, option, remainingOptions: newAvailableOptions } });
    }, 900);
  };

  const handleSelectPaymentMethod = (method: "mobile" | "card" | "flexipay") => {
    dispatch({ type: "SELECT_PAYMENT_METHOD", payload: method });

    if (method === "mobile") {
      // Show loading briefly before showing mobile money form
      setTimeout(() => {
        dispatch({ type: "SHOW_MOBILE_MONEY_FORM" });
      }, 800);
    } else {
      // For card and flexipay, show coming soon message
      setTimeout(() => {
        dispatch({
          type: "RECEIVE_BOT_REPLY",
          payload: `${method === "card" ? "Card Payment" : "FlexiPay"} is coming soon. Please use Mobile Money for now.`,
        });
      }, 800);
    }
  };

  const handleSubmitMobilePayment = async (phoneNumber: string) => {
    if (!selectedProduct || !userId || !sessionId) {
      dispatch({
        type: "PURCHASE_FAILED",
        payload: "⚠️ Payment could not be initiated. Please try again or contact support.",
      });
      return;
    }

    dispatch({ type: "SUBMIT_MOBILE_PAYMENT", payload: phoneNumber });

    // Show loading screen after confirmation message
    setTimeout(() => {
      dispatch({ type: "SHOW_PAYMENT_LOADING_SCREEN" });
    }, 300);

    try {
      const response = await initiatePurchase({
        user_id: userId,
        session_id: sessionId,
        product: selectedProduct,
        channel: "chatbot",
      });

      // Session management: update sessionId if backend returns a new one
      if (response && typeof response === 'object' && 'session_id' in response && typeof response.session_id === 'string' && response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }

      const purchaseResponse = response as unknown as { success?: boolean; message?: string } | null;

      if (purchaseResponse && purchaseResponse.success !== false) {
        // Show success after loading
        setTimeout(() => {
          dispatch({
            type: "PURCHASE_SUCCESS",
            payload: "✅ Payment request sent. Please complete payment on your phone.",
          });
        }, 10000);
      } else {
        throw new Error(purchaseResponse?.message || "Payment initiation failed");
      }
    } catch {
      setTimeout(() => {
        dispatch({
          type: "PURCHASE_FAILED",
          payload: "⚠️ Payment could not be initiated. Please try again or contact support.",
        });
      }, 10000);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedProduct || !userId || !sessionId) {
      dispatch({
        type: "PURCHASE_FAILED",
        payload: "⚠️ Payment could not be initiated. Please try again or contact support.",
      });
      return;
    }

    dispatch({ type: "CONFIRM_PURCHASE" });

    try {
      const response = await initiatePurchase({
        user_id: userId,
        session_id: sessionId,
        product: selectedProduct,
        channel: "chatbot",
      });

      // Session management: update sessionId if backend returns a new one
      if (response && typeof response === 'object' && 'session_id' in response && typeof response.session_id === 'string' && response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }

      const purchaseResponse = response as unknown as { success?: boolean; message?: string } | null;

      if (purchaseResponse && purchaseResponse.success !== false) {
        dispatch({
          type: "PURCHASE_SUCCESS",
          payload: "✅ Payment request sent. Please complete payment on your phone.",
        });
      } else {
        throw new Error(purchaseResponse?.message || "Payment initiation failed");
      }
    } catch {
      dispatch({
        type: "PURCHASE_FAILED",
        payload: "⚠️ Payment could not be initiated. Please try again or contact support.",
      });
    }
  };

  useEffect(() => {
    if (showGeneralInfo && generalInfoError) {
      dispatch({
        type: "RECEIVE_BOT_REPLY",
        payload: generalInfoError,
      });
    }
  }, [showGeneralInfo, generalInfoError]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ backgroundImage: `url(${PatternImage})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.28 }}>
        <div className="absolute inset-0 w-full h-full" style={{ background: 'rgba(0,166,81,0.10)', mixBlendMode: 'multiply' }} />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <ChatHeader
          onBack={onBackClick}
          onClose={onCloseClick!}
          agentConfig={agentConfig || AGENT_CONFIG}
          chatMode={chatMode}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
        />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 om-show-scrollbar">
          {state.messages
            .filter((msg) => {
              // In payment mode, only show payment-related messages
              if (state.isPaymentMode) {
                return (
                  msg.type === "text" && msg.text === "Great choice 👍 I'll help you complete your purchase." ||
                  msg.type === "text" && msg.text === "Perfect! let's complete your purchase" ||
                  msg.type === "payment-method-selector" ||
                  msg.type === "mobile-money-form" ||
                  msg.type === "payment-loading-screen" ||
                  msg.type === "loading" ||
                  (msg.type === "text" && msg.text?.includes("Great! I'll process your payment")) ||
                  (msg.type === "text" && msg.text?.includes("Great! I'm confirming your payment"))
                );
              }
              return true;
            })
            .map((message, idx) => {
            if (message.type === "custom-welcome" && !state.showWelcomeCard) {
              return null;
            }
            if (message.type === "custom-welcome" && state.showWelcomeCard) {
              return (
                <div key={"welcome-" + message.id} className="flex justify-start animate-fade-in mb-4">
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
            // Calculate spacing between messages: always apply mb-6 between different senders, mb-2 between same sender
            const filteredMessages = state.isPaymentMode
              ? state.messages.filter((msg) => 
                  msg.type === "text" && msg.text === "Great choice 👍 I'll help you complete your purchase." ||
                  msg.type === "text" && msg.text === "Perfect! let's complete your purchase" ||
                  msg.type === "payment-method-selector" ||
                  msg.type === "mobile-money-form" ||
                  msg.type === "payment-loading-screen" ||
                  msg.type === "loading" ||
                  (msg.type === "text" && msg.text?.includes("Great! I'll process your payment")) ||
                  (msg.type === "text" && msg.text?.includes("Great! I'm confirming your payment"))
                )
              : state.messages;
            const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
            let spacingClass = "";
            if (prevMsg) {
              // In guided flow, treat action-card as bot for spacing; in free-form, just compare sender
              const prevSender = isGuidedFlow
                ? (prevMsg.sender === "bot" || prevMsg.type === "action-card" ? "bot" : prevMsg.sender)
                : prevMsg.sender;
              const currSender = isGuidedFlow
                ? (message.sender === "bot" || message.type === "action-card" ? "bot" : message.sender)
                : message.sender;
              if (prevSender !== currSender) {
                spacingClass = "mb-6"; // More space between different senders
              } else if (idx !== filteredMessages.length - 1) {
                spacingClass = "mb-2"; // Minimal space between same sender
              }
            }

            // Only show action card and guided UI if isGuidedFlow is true
            const shouldShowActionCard =
              isGuidedFlow &&
              !state.showQuoteForm &&
              state.showActionCard &&
              state.availableOptions.length > 0 &&
              (
                (message.type === "text" && message.text === "How can I help you today?" && state.availableOptions.length === 4) ||
                (message.type === "text" && message.text === "Would you like to continue with another option?" && state.availableOptions.length < 4)
              );
            if (shouldShowActionCard) {
              return [
                <div key={message.id + "-msg"} className={spacingClass}>
                  <MessageRenderer
                    message={message}
                    onConfirmPayment={handleConfirmPayment}
                    onSelectPaymentMethod={handleSelectPaymentMethod}
                    onSubmitMobilePayment={handleSubmitMobilePayment}
                    chatMode={chatMode}
                  />
                </div>,
                <div key={"action-card-" + message.id} className="flex justify-start mt-0">
                  <MessageRenderer
                    message={{
                      id: "dynamic-action-card",
                      sender: "bot",
                      type: "action-card",
                      options: state.availableOptions,
                    }}
                    onActionCardSelect={handleActionCardSelect}
                    onConfirmPayment={handleConfirmPayment}
                    onSelectPaymentMethod={handleSelectPaymentMethod}
                    onSubmitMobilePayment={handleSubmitMobilePayment}
                    loading={state.loading || !!sessionLoading}
                    lastSelected={state.lastSelected}
                  />
                </div>,
              ];
            }
            if (message.type === "action-card") {
              // Do not render action cards from the messages array (handled above)
              return null;
            }
            // Add standard spacing between messages
            return (
              <div key={message.id} className={spacingClass}>
                <MessageRenderer
                  message={message}
                  onConfirmPayment={handleConfirmPayment}
                  onSelectPaymentMethod={handleSelectPaymentMethod}
                  onSubmitMobilePayment={handleSubmitMobilePayment}
                />
              </div>
            );
          })}

          {renderCustomContent?.({ selectedProduct, userId })}

          {state.showQuoteForm && (
            <div ref={quoteFormRef} className="flex justify-start animate-fade-in mb-4">
              <div className="w-full">
                <QuoteFormScreen
                  key={state.quoteFormKey}
                  embedded
                  selectedProduct={selectedProduct}
                  userId={userId}
                  sessionId={sessionId}
                  onFormSubmitted={() => dispatch({ type: "QUOTE_FORM_SUBMITTED" })}
                />
              </div>
            </div>
          )}
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
              placeholder={sessionLoading ? "Connecting..." : "Type a message..."}
              disabled={state.isSending || sessionLoading}
              className="flex-1 px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition"
            />
            <button
              onClick={handleSendMessage}
              disabled={state.inputValue.trim() === "" || state.isSending || sessionLoading}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-primary hover:bg-primary/90 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition text-sm flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 cursor-pointer flex-shrink-0"
            >
              <IoSend size={16} className="sm:block" />
            </button>
          </div>
        </div>

        {/* General Info Modal/Card */}
        {showGeneralInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="animate-fade-in">
              {generalInfoLoading ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center min-w-[300px]">Loading general information...</div>
              ) : generalInfoError ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center min-w-[300px] text-red-600">{generalInfoError}</div>
              ) : generalInfo ? (
                <GeneralInfoCard info={generalInfo} onClose={() => setShowGeneralInfo(false)} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center min-w-[300px]">No information found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Map product values (not labels) to backend keys for the API
const PRODUCT_KEY_MAP: Record<string, string> = {
  // Display labels from ProductScreen
  "Personal Accident": "personal_accident",
  "Serenicare": "serenicare",
  "Motor Private Insurance": "motor_private",
  "Travel Sure Plus": "travel_sure_plus",

  // Backend keys / normalized values
  personal_accident: "personal_accident",
  serenicare: "serenicare",
  motor_private: "motor_private",
  travel_sure_plus: "travel_sure_plus",
  // Add more mappings as needed
};


