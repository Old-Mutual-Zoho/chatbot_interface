import { BOT_CONFIG, HUMAN_CONFIG } from "../config/chatAgentConfigs";
import ChatHeader from "../components/chatbot/ChatHeader";
import PostConversationFeedback from "../components/chatbot/PostConversationFeedback";
import { GuidedStepRenderer } from "../components/form-components/GuidedStepRenderer";
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
import React, { useReducer, useRef, useEffect, useState } from "react";
import { MessageRenderer } from "../components/chatbot/messages/MessageRenderer";
import WelcomeImage from "../assets/Welcome.png";
import { IoSend } from "react-icons/io5";
import QuoteFormScreen from "./QuoteFormScreen";
import type { ExtendedChatMessage } from "../components/chatbot/messages/actionCardTypes";
import type { PaymentLoadingScreenVariant } from "../components/chatbot/messages/actionCardTypes";
import type { ActionOption } from "../components/chatbot/ActionCard";
import { extractBackendValidationError, sendChatMessage, initiatePurchase, startGuidedQuote, escalateSession, getSessionHistory } from "../services/api";
import type { GuidedStepResponse } from "../services/api";
import { useGeneralInformation } from "../hooks/useGeneralInformation";
import { SAVINGS_SUBCATEGORIES } from "../components/chatbot/data/products";
import { GeneralInfoCard } from "../components/chatbot/messages/GeneralInfoCard";
import { FeedbackActionBar } from "../components/chatbot/FeedbackActionBar";
import { FlagshipProductsQuickRow } from "../components/chatbot/FlagshipProductsQuickRow";
// Removed unused AGENT_CONFIG import

const getTimeString = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


const ACTION_OPTIONS: ActionOption[] = [
  { label: "General Info", value: "personal_accident" },
  { label: "Get My Quote", value: "quote" },
  { label: "Buy Now", value: "buy" },
];

const SIGN_UP_OPTION: ActionOption = { label: "Sign Up", value: "sign-up" };

const normalizeProductName = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

const DIGITAL_PRODUCT_NAMES = new Set(
  [
    "Travel",
    "Travel Sure Plus",
    "Motor Private",
    "Motor Private Insurance",
    "Motor Third Party",
    "Motor 3rd Party",
    "Serenicare",
    "Personal Accident",
    "Family Life",
    "Family Life Protection",
  ].map(normalizeProductName),
);

const UNIT_TRUST_PRODUCT_NAMES = new Set(
  SAVINGS_SUBCATEGORIES["unit-trusts"].products.map((p) => normalizeProductName(String(p))),
);

const getBaseActionOptionsForProduct = (productName: string | null | undefined): ActionOption[] => {
  // No selected product: keep current default (3 buttons + Talk to Agent injected by ActionCard).
  if (!productName) return ACTION_OPTIONS;

  const normalized = normalizeProductName(productName);

  // 1) Digital products: General Info, Get My Quote, Buy Now (+ Talk to Agent).
  if (DIGITAL_PRODUCT_NAMES.has(normalized)) return ACTION_OPTIONS;

  // 2) Unit Trust products: General Info, Sign Up (+ Talk to Agent).
  if (UNIT_TRUST_PRODUCT_NAMES.has(normalized)) return [ACTION_OPTIONS[0], SIGN_UP_OPTION];

  // 3) Regular products: General Info (+ Talk to Agent).
  return [ACTION_OPTIONS[0]];
};

const toBackendProductKey = (product: string | null | undefined): string | null => {
  if (!product) return null;
  return (
    PRODUCT_KEY_MAP[product] ||
    PRODUCT_KEY_MAP[product.replace(/\s+/g, "_").toLowerCase()] ||
    product
  );
};

type ChatInitOptions = {
  selectedProduct?: string | null;
  isGuidedFlow: boolean;
  initialMessages?: ChatMessageWithTimestamp[];
};

import type { PaymentMethod } from "../components/chatbot/messages/PaymentMethodSelector";

type Action =
  { type: "RESET"; selectedProduct?: string | null; initialMessages?: ChatMessageWithTimestamp[] }
| { type: "SET_INPUT"; payload: string }
| { type: "SEND_MESSAGE"; chatMode?: 'bot' | 'human' }
| { type: "CLEAR_LOADING" }
| { type: "RECEIVE_BOT_REPLY"; payload: string; chatMode: 'bot' | 'human' }
  | { type: "SELECT_OPTION"; payload: ActionOption }
  | { type: "RECEIVE_OPTION_RESPONSE"; payload: { response: string; option: ActionOption; remainingOptions: ActionOption[] } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SHOW_QUOTE_FORM"; payload?: { label?: string } }
  | { type: "HIDE_QUOTE_FORM" }
  | { type: "QUOTE_FORM_SUBMITTED" }
  | { type: "START_BUY_FLOW" }
  | { type: "SHOW_PURCHASE_SUMMARY"; payload: { productName: string; price: string; duration: string } }
  | { type: "SHOW_PAYMENT_METHOD_SELECTOR" }
  | { type: "SELECT_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "SHOW_MOBILE_MONEY_FORM" }
  | { type: "SUBMIT_MOBILE_PAYMENT"; payload: string }

  | { type: "SHOW_PAYMENT_LOADING_SCREEN"; variant?: PaymentLoadingScreenVariant; text?: string }
  | { type: "CLEAR_PAYMENT_LOADING_SCREEN"; variant?: PaymentLoadingScreenVariant }
  | { type: "CONFIRM_PURCHASE" }
  | { type: "PURCHASE_SUCCESS"; payload: string }
  | { type: "PURCHASE_FAILED"; payload: string };



  const initialState = (opts: ChatInitOptions): State => {
  const { selectedProduct, isGuidedFlow } = opts;
  const initialMessages = opts.initialMessages;
  if (initialMessages && initialMessages.length > 0) {
    return {
      messages: initialMessages,
      availableOptions: getBaseActionOptionsForProduct(selectedProduct),
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
  if (isGuidedFlow && selectedProduct && !getBaseActionOptionsForProduct(selectedProduct).some(opt => opt.label === selectedProduct)) {
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
    availableOptions: getBaseActionOptionsForProduct(selectedProduct),
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
        initialMessages: action.initialMessages,
      });
    }
    case "SET_INPUT": {
      return { ...state, inputValue: action.payload };
    }
    case "SEND_MESSAGE": {
      if (state.inputValue.trim() === "") return state;

      const mode = action.chatMode ?? 'bot';
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

      // In human mode, keep input usable (do not lock sending), but still show
      // a typing bubble that will be replaced when the agent message arrives.
      const baseMessages = mode === 'human'
        ? state.messages.filter((msg) => msg.type !== 'loading')
        : state.messages;

      return {
        ...state,
        messages: [...baseMessages, userMessage, loadingMessage],
        inputValue: "",
        isSending: mode !== 'human',
      };
    }
    case "CLEAR_LOADING": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      return {
        ...state,
        messages: filtered,
        isSending: false,
        loading: false,
        showActionCard: false,
      };
    }
    case "RECEIVE_BOT_REPLY": {
      const filtered = state.messages.filter((msg) => msg.type !== "loading");
      // Determine avatar for this message based on chatMode at dispatch time
      const avatar = action.chatMode === "human" ? HUMAN_CONFIG.avatar : BOT_CONFIG.avatar;
      const botReply: ChatMessageWithTimestamp & { avatar?: string } = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        type: "text",
        text: action.payload,
        timestamp: getTimeString(),
        avatar,
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
      // Initial prompt: show ONLY the action buttons (no follow-up prompt).
      if (action.payload.response === "How can I help you today?" && remainingOptions.length > 0) {
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
        variant: action.variant ?? "payment",
        text: action.text,
        timestamp: getTimeString(),
      };
      return {
        ...state,
        messages: [...state.messages, loadingScreen],
        loading: true,
        isPurchasing: true,
      };
    }
    case "CLEAR_PAYMENT_LOADING_SCREEN": {
      const nextMessages = state.messages.filter((msg) => {
        if (msg.type !== "payment-loading-screen") return true;
        if (!action.variant) return false;
        const msgVariant = (msg as Extract<ChatMessageWithTimestamp, { type: "payment-loading-screen" }>).variant;
        return msgVariant !== action.variant;
      });
      return {
        ...state,
        messages: nextMessages,
        loading: false,
        isPurchasing: false,
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
  variant?: PaymentLoadingScreenVariant;
  text?: string;
};


type ChatScreenProps = {
  onBackClick?: () => void;
  onCloseClick?: () => void;
  selectedProduct?: string | null;
  userId: string | null;
  sessionId: string | null;
  sessionLoading?: boolean;
  sessionError?: string | null;
  isConversationEnded?: boolean;
  onSubmitFeedback?: (payload: { rating: number; feedback: string }) => void;
  autoConnectAgent?: boolean;
  onAutoConnectAgentHandled?: () => void;
  channel?: 'web' | 'whatsapp';
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
  initialMessages?: ChatMessageWithTimestamp[];
  onMessagesChange?: (messages: ChatMessageWithTimestamp[]) => void;
};

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBackClick,
  onCloseClick,
  selectedProduct,
  userId,
  sessionId: sessionIdProp,
  sessionLoading,
  sessionError,
  isConversationEnded = false,
  onSubmitFeedback,
  autoConnectAgent,
  onAutoConnectAgentHandled,
  agentConfig,
  chatMode,
  setChatMode,
  isExpanded = false,
  onToggleExpand,
  renderCustomContent,
  initialMessages,
  onMessagesChange,
  channel = 'web',
}) => {
  const isWhatsApp = channel === 'whatsapp';

  const pendingQuickSendRef = useRef<string | null>(null);

  // Persist whether this chat session is "agent-first" (entered via Chat-with-Agent nav).
  // This must survive the container clearing autoConnectAgent.
  const agentRequestedRef = useRef(!!autoConnectAgent);
  useEffect(() => {
    if (autoConnectAgent) agentRequestedRef.current = true;
  }, [autoConnectAgent]);

  // Expand/collapse state is managed by the container.
  const handleToggleExpand = onToggleExpand ?? (() => undefined);
  // Robust session management: persist sessionId from backend, update on backend response, use for all requests, reset only on new conversation/session expiry
  const [sessionId, setSessionId] = useState<string | null>(sessionIdProp ?? null);
  const isGuidedFlow = !!selectedProduct;
  const [state, dispatch] = useReducer(
    reducer,
    { selectedProduct, isGuidedFlow, initialMessages },
    initialState,
  );

  // Keep stable refs for values that should not trigger chat resets.
  const initialMessagesRef = useRef(initialMessages);
  useEffect(() => {
    initialMessagesRef.current = initialMessages;
  }, [initialMessages]);

  const onMessagesChangeRef = useRef(onMessagesChange);
  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange;
  }, [onMessagesChange]);
  // Escalation state
  // const [escalating, setEscalating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const quoteFormRef = useRef<HTMLDivElement>(null);

  // Contextual feedback actions shown under the latest bot text response
  const [showFeedbackActions, setShowFeedbackActions] = useState(false);
  const [feedbackAnchorMessageId, setFeedbackAnchorMessageId] = useState<string | null>(null);
  const lastBotTextIdRef = useRef<string | null>(null);
  const suppressNextFeedbackBarRef = useRef(false);

  // Conversational inline guided quote flow (backend-driven)
  const [inlineGuidedStep, setInlineGuidedStep] = useState<GuidedStepResponse | null>(null);
  const [inlineGuidedValues, setInlineGuidedValues] = useState<Record<string, string>>({});
  const [inlineGuidedErrors, setInlineGuidedErrors] = useState<Record<string, string>>({});
  const [inlineGuidedLoading, setInlineGuidedLoading] = useState(false);
  const [inlineGuidedPendingAction, setInlineGuidedPendingAction] = useState<string | null>(null);


  const inlineGuidedRef = useRef<HTMLDivElement>(null);

  // Polling for agent replies after escalation.
  const agentPollTimerRef = useRef<number | null>(null);
  const seenAgentKeysRef = useRef<Set<string>>(new Set());
  const [awaitingAgent, setAwaitingAgent] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);

  const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

  useEffect(() => {
    if (isWhatsApp) return;

    // Find the latest bot text message id
    const lastBotText = [...state.messages]
      .reverse()
      .find((m) => {
        if (m.sender !== 'bot' || m.type !== 'text') return false;
        const textValue = (m as unknown as { text?: unknown }).text;
        return typeof textValue === 'string';
      });
    const nextId = (() => {
      const idValue = (lastBotText as unknown as { id?: unknown } | undefined)?.id;
      return typeof idValue === 'string' ? idValue : null;
    })();

    if (!nextId || nextId === lastBotTextIdRef.current) return;

    lastBotTextIdRef.current = nextId;
    setFeedbackAnchorMessageId(nextId);

    if (suppressNextFeedbackBarRef.current) {
      suppressNextFeedbackBarRef.current = false;
      setShowFeedbackActions(false);
      return;
    }

    // Only show the action bar for bot-mode conversations
    setShowFeedbackActions(chatMode === 'bot');
  }, [state.messages, isWhatsApp, chatMode]);

  const getMessageAvatar = (msg: ChatMessageWithTimestamp): string | undefined => {
    const avatarValue = (msg as unknown as { avatar?: unknown }).avatar;
    return typeof avatarValue === 'string' ? avatarValue : undefined;
  };

  const extractSessionIdFromResponse = (res: unknown): string | null => {
    if (!isRecord(res)) return null;
    const direct = res['session_id'];
    if (typeof direct === 'string' && direct.trim()) return direct;

    const responseObj = res['response'];
    if (isRecord(responseObj)) {
      const nested = responseObj['session_id'];
      if (typeof nested === 'string' && nested.trim()) return nested;
    }
    return null;
  };

  const extractGuidedStep = (res: unknown): GuidedStepResponse | null => {
    // Walk nested `response.response` layers until we find an object with a `type`.
    const tryUnwrap = (value: unknown): GuidedStepResponse | null => {
      let current: unknown = value;
      for (let i = 0; i < 6; i += 1) {
        if (!isRecord(current)) return null;
        const typeValue = current['type'];
        if (typeof typeValue === 'string') return current as GuidedStepResponse;
        current = current['response'];
      }
      return null;
    };

    if (!isRecord(res)) return null;
    return tryUnwrap(res['response']) || tryUnwrap(res);
  };

  const extractIsComplete = (res: unknown): boolean => {
    if (!isRecord(res)) return false;
    const responseObj = isRecord(res['response']) ? (res['response'] as Record<string, unknown>) : null;
    const completeValue = (responseObj ? responseObj['complete'] : undefined) ?? res['complete'];
    return completeValue === true;
  };

  const extractTextFromChatResponse = (res: unknown): string | null => {
    if (!isRecord(res)) return null;
    if (typeof res['message'] === 'string' && (res['message'] as string).trim()) return res['message'] as string;

    const responseObj = res['response'];
    if (isRecord(responseObj)) {
      const inner = responseObj['response'];
      if (isRecord(inner) && typeof inner['message'] === 'string' && (inner['message'] as string).trim()) return inner['message'] as string;
      if (typeof responseObj['message'] === 'string' && (responseObj['message'] as string).trim()) return responseObj['message'] as string;
    }
    return null;
  };

  const normalizeOutgoingMessageForBackend = (rawMessage: string): string => {
    // Conversational UX: users often say "car" instead of "Motor Private".
    // If the message looks like a quote request, rewrite it to include the canonical product label.
    const lower = rawMessage.toLowerCase();

    const isQuoteIntent =
      lower.includes('quote') ||
      lower.includes('quotation') ||
      lower.includes('premium') ||
      lower.includes('how much') ||
      lower.includes('price') ||
      lower.includes('cost');

    if (!isQuoteIntent) return rawMessage;

    // Motor insurance synonyms
    const wantsThirdParty =
      lower.includes('third party') ||
      lower.includes('thirdparty') ||
      lower.includes('3rd party') ||
      lower.includes('3rdparty');
    if (wantsThirdParty) {
      return 'Get My Quote for Motor Third Party';
    }

    const mentionsCar = /\b(car|vehicle|auto|automobile)\b/.test(lower);
    const alreadyMentionsMotor =
      lower.includes('motor private') ||
      lower.includes('motor third party') ||
      lower.includes('motor third') ||
      lower.includes('motor private insurance');

    if (mentionsCar && !alreadyMentionsMotor) {
      return 'Get My Quote for Motor Private Insurance';
    }

    return rawMessage;
  };

  const inferQuoteFlowName = (rawMessage: string): string | null => {
    const lower = rawMessage.toLowerCase();
    const isQuoteIntent =
      lower.includes('quote') ||
      lower.includes('quotation') ||
      lower.includes('premium') ||
      lower.includes('how much') ||
      lower.includes('price') ||
      lower.includes('cost');
    if (!isQuoteIntent) return null;

    // Motor insurance: treat “car/vehicle/auto” as Motor Private by default.
    const wantsThirdParty =
      lower.includes('third party') ||
      lower.includes('thirdparty') ||
      lower.includes('3rd party') ||
      lower.includes('3rdparty');
    if (wantsThirdParty) return null;

    const mentionsCar = /\b(car|vehicle|auto|automobile)\b/.test(lower);
    if (mentionsCar) return 'motor_private';

    // If the user explicitly mentions the canonical product name, infer as well.
    if (lower.includes('motor private')) return 'motor_private';

    return null;
  };

  // General Info UI state (must be after selectedProduct and sessionId are defined)
  const [showGeneralInfo, setShowGeneralInfo] = useState(false);
  // Important: keep this as derived state (not a ref) so React re-renders when the product changes.
  const selectedProductKey = toBackendProductKey(selectedProduct);
  const { info: generalInfo, loading: generalInfoLoading, error: generalInfoError, fetchInfo } = useGeneralInformation(selectedProductKey);
 

  // Fetch bot response and manage sessionId (supports backend-driven guided steps)
  const fetchBotResponse = async (option: string): Promise<
    | { kind: 'guided'; step: GuidedStepResponse; complete: boolean }
    | { kind: 'text'; text: string }
  > => {
    if (!userId) {
      return { kind: 'text', text: "Connecting to chat..." };
    }
    try {
      // If the user is in a conversational flow and clearly requests a quote for a known product synonym,
      // prefer the explicit guided start endpoint so we reliably get a GuidedStepResponse.
      if (!selectedProduct && !inlineGuidedStep) {
        const inferredFlow = inferQuoteFlowName(option);
        if (inferredFlow && userId) {
          try {
            const guided = await startGuidedQuote({
              user_id: userId,
              flow_name: inferredFlow,
              session_id: sessionId || undefined,
              initial_data: undefined,
            });
            if (guided?.session_id && guided.session_id !== sessionId) {
              setSessionId(guided.session_id);
            }
            if (guided?.response) {
              return { kind: 'guided', step: guided.response, complete: false };
            }
          } catch {
            // Fall back to normal chat messaging if the guided start is not supported.
          }
        }
      }

      const messageForBackend = (!selectedProduct && !inlineGuidedStep)
        ? normalizeOutgoingMessageForBackend(option)
        : option;

      const response = await sendChatMessage({ user_id: userId, session_id: sessionId || '', message: messageForBackend });

      // Update sessionId if backend returns a new one
      const nextSessionId = extractSessionIdFromResponse(response);
      if (nextSessionId && nextSessionId !== sessionId) {
        setSessionId(nextSessionId);
      }

      const guidedStep = extractGuidedStep(response);
      const complete = extractIsComplete(response);
      if (guidedStep) {
        return { kind: 'guided', step: guidedStep, complete };
      }

      if (isRecord(response)) {
        const rawResponseField: unknown = response['response'];
        const responseObj = isRecord(rawResponseField) ? rawResponseField : null;

        const responseResponseValue = responseObj ? responseObj['response'] : undefined;
        if (typeof responseResponseValue === 'string' && responseResponseValue.trim()) {
          return { kind: 'text', text: responseResponseValue };
        }

        if (typeof rawResponseField === 'string' && rawResponseField.trim()) {
          return { kind: 'text', text: rawResponseField };
        }

        const messageValue = response['message'];
        if (typeof messageValue === 'string' && messageValue.trim()) {
          return { kind: 'text', text: messageValue };
        }

        const optionsValue = response['options'];
        if (Array.isArray(optionsValue) && optionsValue.length > 0) {
          const labels = optionsValue
            .map((opt) => {
              if (!isRecord(opt)) return null;
              const label = opt['label'];
              return typeof label === 'string' ? label : null;
            })
            .filter((label): label is string => !!label);

          if (labels.length > 0) {
            const prompt =
              (typeof response['message'] === 'string' && response['message'].trim())
                ? response['message']
                : (responseObj && typeof responseObj['message'] === 'string' ? (responseObj['message'] as string) : 'Please choose an option:');
            return { kind: 'text', text: `${prompt}\n${labels.map((l) => `- ${l}`).join('\n')}` };
          }
        }

        if (responseObj) {
          const nestedOptions = responseObj['options'];
          if (Array.isArray(nestedOptions) && nestedOptions.length > 0) {
            const labels = nestedOptions
              .map((opt) => {
                if (!isRecord(opt)) return null;
                const label = opt['label'];
                return typeof label === 'string' ? label : null;
              })
              .filter((label): label is string => !!label);

            if (labels.length > 0) {
              const prompt =
                (typeof responseObj['message'] === 'string' && (responseObj['message'] as string).trim())
                  ? (responseObj['message'] as string)
                  : 'Please choose an option:';
              return { kind: 'text', text: `${prompt}\n${labels.map((l) => `- ${l}`).join('\n')}` };
            }
          }
        }
      }

      return { kind: 'text', text: typeof response === 'string' ? response : 'Sorry, I could not understand the server response.' };
    } catch {
      return { kind: 'text', text: "Sorry, I couldn't retrieve information from the server." };
    }
  };

  const submitInlineGuided = async (payload: Record<string, unknown>) => {
    if (!userId) return;

    // Persist all user-entered values across guided step types so that
    // later confirmation steps can display a complete summary.
    setInlineGuidedValues((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const [key, rawValue] of Object.entries(payload)) {
        const k = String(key ?? '').trim();
        if (!k) continue;
        if (k === 'action') continue;
        if (k.startsWith('_')) continue;
        if (rawValue == null) {
          next[k] = '';
          continue;
        }
        if (typeof rawValue === 'string') {
          next[k] = rawValue;
          continue;
        }
        if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
          next[k] = String(rawValue);
          continue;
        }
        if (Array.isArray(rawValue)) {
          next[k] = rawValue
            .map((v) => (v == null ? '' : String(v)).trim())
            .filter(Boolean)
            .join(', ');
          continue;
        }
        try {
          next[k] = JSON.stringify(rawValue);
        } catch {
          next[k] = String(rawValue);
        }
      }
      return next;
    });

    setInlineGuidedLoading(true);
    try {
      const payloadToSend = inlineGuidedPendingAction ? { ...payload, action: inlineGuidedPendingAction } : payload;
      const res = await sendChatMessage({
        user_id: userId,
        session_id: sessionId || '',
        form_data: payloadToSend,
      });

      const nextSessionId = extractSessionIdFromResponse(res);
      if (nextSessionId && nextSessionId !== sessionId) {
        setSessionId(nextSessionId);
      }

      const nextStep = extractGuidedStep(res);
      const complete = extractIsComplete(res);
      if (complete && !nextStep) {
        setInlineGuidedStep(null);
        setInlineGuidedValues({});
        setInlineGuidedErrors({});
        setInlineGuidedPendingAction(null);
        const msg = extractTextFromChatResponse(res);
        if (msg) {
          dispatch({ type: 'RECEIVE_BOT_REPLY', payload: msg, chatMode });
        }
        return;
      }

      if (nextStep) {
        setInlineGuidedPendingAction(null);
        // Payment transition: backend may return an informational `proceed_to_payment` step first,
        // then return the actual payment options (`payment_method`) on the next call.
        if (nextStep.type === 'proceed_to_payment') {
          try {
            const quoteId = typeof nextStep.quote_id === 'string' && nextStep.quote_id.trim() ? nextStep.quote_id.trim() : undefined;

            const extractPremiumAmount = (): number | null => {
              const candidates: unknown[] = [
                (nextStep as unknown as Record<string, unknown>)['premium_amount'],
                (nextStep as unknown as Record<string, unknown>)['amount'],
                (nextStep as unknown as Record<string, unknown>)['premium'],
                (nextStep as unknown as Record<string, unknown>)['monthly_premium'],
              ];

              // Also try values we've already captured from prior steps.
              if (inlineGuidedValues && typeof inlineGuidedValues === 'object') {
                const v = inlineGuidedValues as Record<string, unknown>;
                candidates.push(
                  v['premium_amount'],
                  v['amount'],
                  v['premium'],
                  v['monthly_premium'],
                  v['annual_premium'],
                );
              }
              const maybeData = (nextStep as unknown as Record<string, unknown>)['data'];
              if (maybeData && typeof maybeData === 'object' && maybeData !== null) {
                candidates.push(
                  (maybeData as Record<string, unknown>)['premium_amount'],
                  (maybeData as Record<string, unknown>)['amount'],
                  (maybeData as Record<string, unknown>)['premium'],
                  (maybeData as Record<string, unknown>)['monthly_premium'],
                );
              }
              for (const raw of candidates) {
                if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
                if (typeof raw === 'string') {
                  const n = Number(raw);
                  if (Number.isFinite(n)) return n;
                }
              }
              return null;
            };

            const premiumAmount = extractPremiumAmount();

            const followUp = await sendChatMessage({
              user_id: userId,
              session_id: sessionId || '',
              form_data: {
                ...(quoteId ? { quote_id: quoteId } : {}),
                ...(premiumAmount != null ? { premium_amount: premiumAmount } : {}),
              },
            });

            const followUpSessionId = extractSessionIdFromResponse(followUp);
            if (followUpSessionId && followUpSessionId !== sessionId) {
              setSessionId(followUpSessionId);
            }

            const advancedStep = extractGuidedStep(followUp);
            if (advancedStep) {
              setInlineGuidedStep(advancedStep);
              return;
            }
          } catch {
            // Fall back to rendering the proceed_to_payment step.
          }
        }

        setInlineGuidedStep(nextStep);
      }
    } catch (err) {
      const validation = extractBackendValidationError(err);
      if (validation?.fieldErrors) {
        const fieldErrors = validation.fieldErrors;
        setInlineGuidedErrors(fieldErrors);
        const attemptedAction = payload && typeof payload['action'] === 'string' ? (payload['action'] as string) : null;
        if (attemptedAction) setInlineGuidedPendingAction(attemptedAction);

        const headline = validation.message && validation.message.trim()
          ? validation.message.trim()
          : 'Please correct the highlighted fields.';
        const keys = Object.keys(fieldErrors).filter((k) => k && !k.startsWith('_'));
        const details = keys.length
          ? `\n${keys.slice(0, 8).map((k) => `- ${k}: ${fieldErrors[k]}`).join('\n')}${keys.length > 8 ? `\n- …and ${keys.length - 8} more` : ''}`
          : '';
        dispatch({ type: 'RECEIVE_BOT_REPLY', payload: `${headline}${details}`, chatMode });
        return;
      }

      setInlineGuidedErrors((prev) => ({ ...prev, _error: 'Failed to submit. Please try again.' }));
    } finally {
      setInlineGuidedLoading(false);
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
    setInlineGuidedStep(null);
    setInlineGuidedValues({});
    setInlineGuidedErrors({});
    setInlineGuidedLoading(false);
    const bootMessages = initialMessagesRef.current;
    dispatch({ type: "RESET", selectedProduct, initialMessages: bootMessages });

    // In agent-first mode, do not show the bot's default follow-up prompt.
    if (agentRequestedRef.current) return;

    // If we're hydrating an existing conversation, don't inject the default prompt.
    if (bootMessages && bootMessages.length > 0) return;

    const followupTimeout = setTimeout(() => {
      const optionsForProduct = getBaseActionOptionsForProduct(selectedProduct);
      dispatch({
        type: "RECEIVE_OPTION_RESPONSE",
        payload: {
          response: "How can I help you today?",
          option: { label: "", value: "" },
          remainingOptions: optionsForProduct,
        },
      });
    }, 600);
    return () => clearTimeout(followupTimeout);
  }, [selectedProduct]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    onMessagesChangeRef.current?.(state.messages);
  }, [state.messages]);

  useEffect(() => {
    if (state.showQuoteForm) {
      quoteFormRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [state.showQuoteForm, state.quoteFormKey]);

  useEffect(() => {
    if (!inlineGuidedStep) return;
    inlineGuidedRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [inlineGuidedStep]);

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

    // Hide contextual feedback bar when the user sends a new message
    setShowFeedbackActions(false);

    const outgoingText = state.inputValue;

    // Escalation keyword detection (text input)
    const messageLower = state.inputValue.toLowerCase();
    const escalationKeywords = [
      "human",
      "agent",
      "talk to human",
      "talk to agent",
      "customer support",
      "support",
      "real person"
    ];
    const wantsHuman = escalationKeywords.some(keyword => messageLower.includes(keyword));

    // Always append user message (and typing bubble)
    dispatch({ type: "SEND_MESSAGE", chatMode });

    // If escalation intent and in bot mode, trigger escalation and stop further bot response
    if (wantsHuman && chatMode === "bot") {
      requestEscalation({
        reason: 'User requested a human agent',
        metadata: { source: 'keyword' },
      });
      return;
    }

    // Human agent mode: do NOT show backend ack text ("message sent...").
    // Keep the typing bubble until the agent reply arrives via polling.
    if (chatMode === 'human') {
      (async () => {
        try {
          if (!userId) throw new Error('Missing user id');
          await sendChatMessage({
            user_id: userId,
            session_id: sessionId || '',
            message: outgoingText,
          });
        } catch {
          dispatch({ type: 'CLEAR_LOADING' });
          dispatch({
            type: 'RECEIVE_BOT_REPLY',
            payload: "Sorry — I couldn't send your message to the agent. Please try again.",
            chatMode: 'human',
          });
        }
      })();
      return;
    }

    // Otherwise, proceed with normal bot response
    (async () => {
      const result = await fetchBotResponse(outgoingText);
      if (result.kind === 'guided') {
        dispatch({ type: 'CLEAR_LOADING' });
        setInlineGuidedStep(result.step);
        return;
      }
      dispatch({ type: "RECEIVE_BOT_REPLY", payload: result.text, chatMode });
    })();
  };

  useEffect(() => {
    const pending = pendingQuickSendRef.current;
    if (!pending) return;
    if (state.inputValue !== pending) return;

    pendingQuickSendRef.current = null;
    handleSendMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.inputValue]);

  const handleFlagshipProductSelect = React.useCallback(
    (productName: string) => {
      // Route through the existing input + send handler so it behaves like typed text.
      pendingQuickSendRef.current = productName;
      dispatch({ type: "SET_INPUT", payload: productName });
    },
    [dispatch],
  );

  const resizeTypingArea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    const maxHeightPx = 160;
    const nextHeight = Math.min(el.scrollHeight, maxHeightPx);
    el.style.height = `${nextHeight}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !state.isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    resizeTypingArea(inputRef.current);
  }, []);

  // general info button for products
  // Escalation (handoff to human agent)
  type EscalationTrigger = {
    reason: string;
    metadata: Record<string, unknown>;
  };

  const escalationState = React.useRef({
    inProgress: false,
    timeout: null as number | null,
    startedAt: null as number | null,
    pending: null as EscalationTrigger | null,
  });

  const autoScrollToBottom = React.useCallback(() => {
    setTimeout(() => {
      const chatContainer = document.querySelector('.om-show-scrollbar');
      if (chatContainer) {
        (chatContainer as HTMLElement).scrollTop = (chatContainer as HTMLElement).scrollHeight;
      }
    }, 100);
  }, []);

  const clearEscalationLoader = React.useCallback(() => {
    dispatch({ type: "CLEAR_PAYMENT_LOADING_SCREEN", variant: "escalation" });
    if (escalationState.current.timeout) {
      clearTimeout(escalationState.current.timeout);
      escalationState.current.timeout = null;
    }
    escalationState.current.inProgress = false;
    escalationState.current.startedAt = null;
    escalationState.current.pending = null;
    autoScrollToBottom();
  }, [autoScrollToBottom, dispatch]);

  function failEscalation(message: string) {
    setAwaitingAgent(false);
    clearEscalationLoader();
    dispatch({
      type: "RECEIVE_BOT_REPLY",
      payload: message,
      chatMode: 'bot',
    });
  }

  async function performEscalation(activeSessionId: string, trigger: EscalationTrigger) {
    try {
      const timeoutMs = 15000;
      const data = await Promise.race([
        escalateSession({
          session_id: activeSessionId,
          reason: trigger.reason,
          metadata: trigger.metadata,
        }),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error('Escalation timed out')), timeoutMs),
        ),
      ]);

      const ok = (data?.success === true) || (data?.escalated === true);
      if (!ok) {
        const serverMessage = (data?.error || data?.message) ? String(data.error || data.message) : null;
        throw new Error(serverMessage || 'Failed to escalate');
      }
      // Switch the customer UI into human-chat mode quickly after escalation
      // succeeds, then wait for real agent replies from conversation history.
      const startedAt = escalationState.current.startedAt ?? Date.now();
      const elapsedMs = Date.now() - startedAt;
      const remainingMs = Math.max(0, 800 - elapsedMs);

      window.setTimeout(() => {
        // If escalation was cancelled/cleared before timer fires, do nothing.
        if (!escalationState.current.inProgress) return;

        setAwaitingAgent(true);
        setAgentConnected(false);
        clearEscalationLoader();
        switchToHumanAgent();
        dispatch({
          type: 'RECEIVE_BOT_REPLY',
          payload: "You're now in the customer support chat. Send your message and an agent will reply here shortly.",
          chatMode: 'human',
        });
      }, remainingMs);
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : 'Failed to connect to an agent. Please try again.';
      failEscalation(`Sorry — I couldn't connect you to an agent. ${msg}`);
    }
  }

  function requestEscalation(trigger: EscalationTrigger) {
    // Only escalate from bot mode.
    if (chatMode !== 'bot') return;
    if (escalationState.current.inProgress) return;

    // Mark this session as agent-first.
    agentRequestedRef.current = true;
    setAgentConnected(false);
    setAwaitingAgent(false);

    escalationState.current.inProgress = true;
    escalationState.current.startedAt = Date.now();
    escalationState.current.pending = null;
    dispatch({ type: "SHOW_PAYMENT_LOADING_SCREEN", variant: "escalation" });
    autoScrollToBottom();

    // Hard stop so we never leave the loader spinning indefinitely.
    escalationState.current.timeout = window.setTimeout(() => {
      failEscalation('Timed out while trying to connect you to an agent. Please try again.');
    }, 60000);

    if (!sessionId) {
      // Session still being created; run the escalation as soon as we have a sessionId.
      escalationState.current.pending = trigger;
      return;
    }

    void performEscalation(sessionId, trigger);
  }

  // If the user requested an agent before the session existed, continue once we have it.
  useEffect(() => {
    if (!sessionId) return;
    const pending = escalationState.current.pending;
    if (!pending) return;
    if (!escalationState.current.inProgress) return;
    escalationState.current.pending = null;
    void performEscalation(sessionId, pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // If requested by the container (e.g., user clicked "Chat with Agent" from the landing page),
  // immediately start the existing escalation flow.
  const autoConnectTriggeredRef = useRef(false);
  useEffect(() => {
    if (!autoConnectAgent) {
      autoConnectTriggeredRef.current = false;
      return;
    }
    if (autoConnectTriggeredRef.current) return;
    autoConnectTriggeredRef.current = true;

    // Mark this session as agent-first immediately.
    agentRequestedRef.current = true;

    requestEscalation({
      reason: 'User clicked chat with agent',
      metadata: { source: 'chat_with_agent' },
    });
    onAutoConnectAgentHandled?.();
    // Intentionally depend only on the trigger flag to avoid re-running due to
    // internal state changes; the container clears the flag via the callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnectAgent]);

  const switchToHumanAgent = React.useCallback(() => {
    setChatMode('human');
    // Do NOT call appendHumanMessage() here; let useEffect handle it after chatMode is set
  }, [setChatMode]);

  const getAgentMessageText = (m: unknown): string | null => {
    if (!m || typeof m !== 'object') return null;
    const rec = m as Record<string, unknown>;
    const text = typeof rec['text'] === 'string' ? rec['text'] : null;
    const message = typeof rec['message'] === 'string' ? rec['message'] : null;
    const rawText = typeof rec['raw_text'] === 'string' ? rec['raw_text'] : null;
    const content = typeof rec['content'] === 'string' ? rec['content'] : null;
    const raw = (text && text.trim())
      ? text.trim()
      : (message && message.trim()
        ? message.trim()
        : (rawText && rawText.trim()
          ? rawText.trim()
          : (content && content.trim() ? content.trim() : null)));
    if (!raw) return null;

    const cleaned = raw.replace(/^\[agent\]\[chat_id:[^\]]+\]\s*/i, '').trim();
    return cleaned || raw;
  };

  const makeAgentKey = (m: unknown, fallbackText: string): string => {
    const rec = (m && typeof m === 'object') ? (m as Record<string, unknown>) : {};
    const ts =
      typeof rec['timestamp'] === 'string'
        ? rec['timestamp']
        : typeof rec['ts'] === 'string'
          ? rec['ts']
          : '';
    const role = typeof rec['role'] === 'string' ? rec['role'] : '';
    return `${ts}::${role}::${fallbackText}`;
  };

  useEffect(() => {
    // New backend session => reset dedupe so we can show messages for the new chat.
    seenAgentKeysRef.current = new Set();
    setAwaitingAgent(false);
    setAgentConnected(false);
  }, [sessionId]);

  useEffect(() => {
    // Poll when awaiting an agent connection OR while in human mode.
    if (!sessionId) return;
    if (chatMode !== 'human' && !awaitingAgent) return;

    const pollOnce = async () => {
      try {
        const data = await getSessionHistory(sessionId);
        const historyMessages = Array.isArray(data?.messages) ? data.messages : [];
        const agentMessages = historyMessages.filter((m) => m && typeof m === 'object' && m.role === 'agent');
        if (agentMessages.length === 0) return;

        agentMessages.sort((a, b) => {
          const ats = typeof a.timestamp === 'string' ? a.timestamp : '';
          const bts = typeof b.timestamp === 'string' ? b.timestamp : '';
          return ats.localeCompare(bts);
        });

        for (const m of agentMessages) {
          const text = getAgentMessageText(m);
          if (!text) continue;
          const key = makeAgentKey(m, text);
          if (seenAgentKeysRef.current.has(key)) continue;
          seenAgentKeysRef.current.add(key);

          if (!agentConnected) {
            setAgentConnected(true);
          }

          if (awaitingAgent) {
            setAwaitingAgent(false);
            clearEscalationLoader();
            if (chatMode !== 'human') switchToHumanAgent();
          }

          dispatch({
            type: "RECEIVE_BOT_REPLY",
            payload: text,
            chatMode: 'human',
          });
        }
      } catch (e) {
        console.warn('Failed to fetch escalated conversation history', e);
      }
    };

    void pollOnce();
    agentPollTimerRef.current = window.setInterval(pollOnce, 2000);

    return () => {
      if (agentPollTimerRef.current) {
        clearInterval(agentPollTimerRef.current);
        agentPollTimerRef.current = null;
      }
    };
  }, [chatMode, sessionId, awaitingAgent, agentConnected, clearEscalationLoader, switchToHumanAgent]);

  const handleActionCardSelect = async (option: ActionOption) => {
    if (option.value === "talk-to-agent") {
      requestEscalation({
        reason: 'User clicked talk to agent',
        metadata: { source: 'talk_to_agent' },
      });
      return;
    }
    if (option.value === "sign-up") {
      dispatch({ type: "SELECT_OPTION", payload: option });
      window.open("https://selfservice.uapoldmutual.com/", "_blank");
      return;
    }
    // ...existing General Info logic...
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
      try {
        // Recompute the product key at click-time to avoid any timing issues.
        const productKey = toBackendProductKey(selectedProduct);
        const result = await fetchInfo(productKey);
        const data = result.data;
        let infoText = "";
        if (data && (data.definition || data.benefits || data.eligibility)) {
          if (data.definition) infoText += `Definition: ${data.definition}\n`;
          if (data.benefits && data.benefits.length > 0) infoText += `Benefits: ${data.benefits.join(", ")}\n`;
          if (data.eligibility) infoText += `Eligibility: ${data.eligibility}`;
        } else if (result.error) {
          // Show the real backend error (e.g. 401/404 detail) in the chat.
          infoText = result.error;
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
            chatMode,
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
      // Guided flow (selected product): keep the existing embedded QuoteFormScreen.
      if (selectedProduct) {
        dispatch({ type: "SELECT_OPTION", payload: option });
        dispatch({ type: "SHOW_QUOTE_FORM", payload: { label: option.label } });
        return;
      }

      // Conversational flow: backend can return guided step payloads.
      dispatch({ type: "SET_INPUT", payload: option.label });
      dispatch({ type: "SEND_MESSAGE", chatMode });
      setTimeout(async () => {
        const result = await fetchBotResponse(option.label);
        if (result.kind === 'guided') {
          dispatch({ type: 'CLEAR_LOADING' });
          setInlineGuidedStep(result.step);
          return;
        }
        dispatch({ type: "RECEIVE_BOT_REPLY", payload: result.text, chatMode });
      }, 250);

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
      const result = await fetchBotResponse(option.label);
      if (result.kind === 'guided') {
        setInlineGuidedStep(result.step);
        dispatch({ type: "RECEIVE_OPTION_RESPONSE", payload: { response: "", option, remainingOptions: newAvailableOptions } });
        return;
      }
      dispatch({ type: "RECEIVE_OPTION_RESPONSE", payload: { response: result.text, option, remainingOptions: newAvailableOptions } });
    }, 900);
  };

  const productInContext = (selectedProduct && selectedProduct.trim()) ? selectedProduct.trim() : null;

  const handleFeedbackThumbsUp = () => {
    suppressNextFeedbackBarRef.current = true;
    setShowFeedbackActions(false);
    dispatch({
      type: "RECEIVE_BOT_REPLY",
      payload: productInContext
        ? `You're welcome! If you have any questions about ${productInContext}, just let me know.`
        : "You're welcome! If you have any questions, just let me know.",
      chatMode: 'bot',
    });
  };

  const handleFeedbackThumbsDown = () => {
    suppressNextFeedbackBarRef.current = true;
    setShowFeedbackActions(false);
    dispatch({
      type: "RECEIVE_BOT_REPLY",
      payload:
        "Sorry if that wasn’t helpful. \"Could you clarify your question or provide a little more detail so I can assist you better?\"",
      chatMode: 'bot',
    });
  };

  const handleFeedbackConnectAgent = () => {
    setShowFeedbackActions(false);
    requestEscalation({
      reason: 'User clicked connect with agent',
      metadata: { source: 'connect_with_agent' },
    });
  };

  const shouldShowFeedbackForMessage = (message: ChatMessageWithTimestamp) => {
    return (
      !isWhatsApp &&
      chatMode === 'bot' &&
      showFeedbackActions &&
      feedbackAnchorMessageId === message?.id &&
      message?.sender === 'bot' &&
      message?.type === 'text'
    );
  };

  const shouldShowThumbsForFeedbackMessage = (message: ChatMessageWithTimestamp) => {
    const anchorId = message?.id;
    if (!anchorId) return false;

    const anchorIndex = state.messages.findIndex((m) => m.id === anchorId);
    if (anchorIndex <= 0) return false;

    return state.messages.slice(0, anchorIndex).some((m) => m.sender === 'user');
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: "SELECT_PAYMENT_METHOD", payload: method });
    if (method === "MTN" || method === "AIRTEL") {
      setTimeout(() => {
        dispatch({ type: "SHOW_MOBILE_MONEY_FORM" });
      }, 800);
    } else if (method === "FLEXIPAY") {
      setTimeout(() => {
        dispatch({
          type: "RECEIVE_BOT_REPLY",
          payload: `FlexiPay is coming soon. Please use MTN or Airtel Mobile Money for now.`,
          chatMode,
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
      dispatch({ type: "SHOW_PAYMENT_LOADING_SCREEN", variant: "payment" });
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
        chatMode,
      });
    }
  }, [showGeneralInfo, generalInfoError, chatMode]);

  // Divider state: only show once, only when switching to human mode, after loader disappears and before first human message
  const [showDivider, setShowDivider] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Only show "Connected to live agent" once we have a real agent message.
    if (agentConnected) {
      if (!showDivider) setShowDivider(true);
      return;
    }
    setShowDivider(false);
  }, [agentConnected, showDivider]);

  useEffect(() => {
    if (showDivider && dividerRef.current) {
      dividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [showDivider]);

  return (
    <div
      className={
        isWhatsApp
          ? 'flex flex-col w-full bg-white om-pattern-bg h-full min-h-0'
          : 'flex flex-col w-full bg-white om-pattern-bg h-full min-h-0 md:shadow-xl md:rounded-2xl'
      }
    >
      {/* Header (web only) */}
      {!isWhatsApp ? (
        <ChatHeader
          onBack={onBackClick}
          onClose={onCloseClick!}
          agentConfig={agentConfig}
          chatMode={chatMode}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
        />
      ) : null}

      {/* Messages Container */}
      <div className={
        isConversationEnded
          ? "flex-1 min-h-0"
          : "flex-1 min-h-0 overflow-y-auto px-4 py-3 om-show-scrollbar"
      }>
        {isConversationEnded ? (
          <PostConversationFeedback
            isConversationEnded
            onSubmitFeedback={onSubmitFeedback}
          />
        ) : (
          <>
            {/* System Divider Message */}
            {!isWhatsApp && showDivider && (
              <div
                ref={dividerRef}
                className="w-full flex justify-center items-center mb-2 min-h-6 animate-fade-in"
              >
                <span className="w-full text-center text-xs text-gray-400 select-none">
                  Connected to live agent
                </span>
              </div>
            )}

            {state.messages
              .filter((msg) => {
                // ...existing code...
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
                // ...existing code...
              if (message.type === "custom-welcome" && !state.showWelcomeCard) {
                return null;
              }
              if (!isWhatsApp && message.type === "custom-welcome" && state.showWelcomeCard) {
                return (
                  <div key={"welcome-" + message.id} className="flex w-full justify-center animate-fade-in mb-4">
                    <div className="bg-white rounded-xl shadow-md p-0 overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg">
                      <img src={WelcomeImage} alt="Welcome" className="w-full object-cover rounded-t-xl" />
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
              // ...existing code...
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
                // ...existing code...
                const prevSender = isGuidedFlow
                  ? (prevMsg.sender === "bot" || prevMsg.type === "action-card" ? "bot" : prevMsg.sender)
                  : prevMsg.sender;
                const currSender = isGuidedFlow
                  ? (message.sender === "bot" || message.type === "action-card" ? "bot" : message.sender)
                  : message.sender;
                if (prevSender !== currSender) {
                  spacingClass = "mb-4";
                } else if (idx !== filteredMessages.length - 1) {
                  spacingClass = "mb-0.5";
                }
              }

              // ...existing code...
              const baseActionOptionCount = getBaseActionOptionsForProduct(selectedProduct).length;
              const shouldShowActionCard =
                isGuidedFlow &&
                !state.showQuoteForm &&
                state.showActionCard &&
                state.availableOptions.length > 0 &&
                (
                  (message.type === "text" && message.text === "How can I help you today?" && state.availableOptions.length === baseActionOptionCount) ||
                  (message.type === "text" && message.text === "Would you like to continue with another option?" && state.availableOptions.length < baseActionOptionCount)
                );
              if (shouldShowActionCard) {
                // The action card is effectively a continuation of the bot message.
                // Keep the gap between the bot prompt and its action buttons tight.
                const msgSpacing = "mb-1";
                if (isWhatsApp) {
                  const optionLines = state.availableOptions.map((o) => `- ${o.label}`).join('\n');
                  return [
                    <div key={message.id + "-msg"} className={msgSpacing}>
                      <MessageRenderer
                        message={message}
                        avatar={getMessageAvatar(message)}
                        chatMode={chatMode}
                        channel="whatsapp"
                      />
                    </div>,
                    <div key={"whatsapp-options-" + message.id} className="mb-1">
                      <MessageRenderer
                        message={{
                          id: `whatsapp-options-${message.id}`,
                          sender: 'bot',
                          type: 'text',
                          text: optionLines ? `Options:\n${optionLines}` : 'Options available.',
                        }}
                        chatMode={chatMode}
                        channel="whatsapp"
                      />
                    </div>,
                  ];
                }
                return [
                  <div key={message.id + "-msg"} className={msgSpacing}>
                    <MessageRenderer
                      message={message}
                      onConfirmPayment={handleConfirmPayment}
                      onSelectPaymentMethod={handleSelectPaymentMethod}
                      onSubmitMobilePayment={handleSubmitMobilePayment}
                      avatar={getMessageAvatar(message)}
                      chatMode={chatMode}
                      channel="web"
                    />
                    {shouldShowFeedbackForMessage(message) ? (
                      <div className="flex w-full justify-start mt-2 pl-7 sm:pl-8">
                        <FeedbackActionBar
                          onThumbsUp={handleFeedbackThumbsUp}
                          onThumbsDown={handleFeedbackThumbsDown}
                          onConnectAgent={handleFeedbackConnectAgent}
                          showThumbs={shouldShowThumbsForFeedbackMessage(message)}
                          showConnect={shouldShowThumbsForFeedbackMessage(message)}
                        />
                      </div>
                    ) : null}
                  </div>,
                  <div key={"action-card-" + message.id} className="flex w-full justify-center mt-0">
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
                      loading={state.loading || !!sessionLoading || !!sessionError}
                      lastSelected={state.lastSelected}
                      channel="web"
                    />
                  </div>,
                ];
              }
              if (message.type === "action-card") {
                return null;
              }
              return (
                <div key={message.id} className={spacingClass}>
                  <MessageRenderer
                    message={message}
                    onConfirmPayment={handleConfirmPayment}
                    onSelectPaymentMethod={handleSelectPaymentMethod}
                    onSubmitMobilePayment={handleSubmitMobilePayment}
                    avatar={getMessageAvatar(message)}
                    chatMode={chatMode}
                    channel={isWhatsApp ? 'whatsapp' : 'web'}
                  />
                  {shouldShowFeedbackForMessage(message) ? (
                    <div className="flex w-full justify-start mt-2 pl-7 sm:pl-8">
                      <FeedbackActionBar
                        onThumbsUp={handleFeedbackThumbsUp}
                        onThumbsDown={handleFeedbackThumbsDown}
                        onConnectAgent={handleFeedbackConnectAgent}
                        showThumbs={shouldShowThumbsForFeedbackMessage(message)}
                        showConnect={shouldShowThumbsForFeedbackMessage(message)}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}

          {renderCustomContent?.({ selectedProduct, userId })}

          {!isWhatsApp && state.showQuoteForm && (
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

          {!isWhatsApp && !selectedProduct && inlineGuidedStep && (
            <div ref={inlineGuidedRef} className="flex justify-start animate-fade-in mb-4">
              <div className="w-full">
                <GuidedStepRenderer
                  step={inlineGuidedStep}
                  values={inlineGuidedValues}
                  errors={inlineGuidedErrors}
                  onClearError={(name) => {
                    setInlineGuidedErrors((prev) => {
                      const next = { ...prev };
                      delete next[name];
                      return next;
                    });
                  }}
                  onChange={(name, value) => {
                    setInlineGuidedValues((prev) => ({ ...prev, [name]: value }));
                  }}
                  onSubmit={submitInlineGuided}
                  loading={inlineGuidedLoading}
                  titleFallback="Quote Details"
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Footer Area (flagship products + input) */}
      {!isConversationEnded && (
        <div className="shrink-0 bg-white border-t border-gray-200">
          {/* Flagship quick product buttons (free conversation only) */}
          {!isWhatsApp && !selectedProduct && (
            <FlagshipProductsQuickRow
              disabled={state.isSending || sessionLoading || !!sessionError}
              onSelect={handleFlagshipProductSelect}
            />
          )}

          {/* Input Area */}
          <div className="p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                rows={1}
                value={state.inputValue}
                onChange={(e) => {
                  // Hide contextual feedback bar as soon as the user starts typing
                  if (showFeedbackActions) setShowFeedbackActions(false);
                  dispatch({ type: "SET_INPUT", payload: e.target.value });
                  resizeTypingArea(e.currentTarget);
                }}
                onKeyDown={handleKeyPress}
                placeholder={
                  sessionError
                    ? sessionError
                    : sessionLoading
                      ? "Connecting..."
                      : chatMode === 'human'
                        ? (awaitingAgent ? "Send your message to customer support..." : "Chat with customer support...")
                        : "Type a message..."
                }
                disabled={state.isSending || sessionLoading || !!sessionError}
                className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base leading-relaxed resize-none overflow-y-auto disabled:bg-gray-50 disabled:cursor-not-allowed transition"
              />
              <button
                onClick={handleSendMessage}
                disabled={state.inputValue.trim() === "" || state.isSending || sessionLoading || !!sessionError}
                className="bg-primary hover:bg-primary/90 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition text-sm flex items-center justify-center w-10 h-10 cursor-pointer shrink-0"
              >
                <IoSend size={16} className="sm:block" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Info Modal/Card (web only) */}
      {!isWhatsApp && showGeneralInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="animate-fade-in">
              {generalInfoLoading ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center w-full max-w-sm">Loading general information...</div>
              ) : generalInfoError ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center w-full max-w-sm text-red-600">{generalInfoError}</div>
              ) : generalInfo ? (
                <GeneralInfoCard info={generalInfo} onClose={() => setShowGeneralInfo(false)} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center w-full max-w-sm">No information found.</div>
              )}
            </div>
          </div>
      )}
    </div>
  );
};

// Map product values (not labels) to backend keys for the API
const PRODUCT_KEY_MAP: Record<string, string> = {
  // Display labels from ProductScreen
  "Personal Accident": "personal_accident",
  "Serenicare": "serenicare",
  "Motor Private Insurance": "motor_private",
  // General Information backend expects `travel`
  "Travel Sure Plus": "travel",
  "Travel Insurance": "travel",
  "Travel": "travel",

  // Backend keys / normalized values
  personal_accident: "personal_accident",
  serenicare: "serenicare",
  motor_private: "motor_private",
  travel: "travel",
  // Back-compat: if anything still produces travel_sure_plus, treat it as travel for general info
  travel_sure_plus: "travel",
  // Add more mappings as needed
};