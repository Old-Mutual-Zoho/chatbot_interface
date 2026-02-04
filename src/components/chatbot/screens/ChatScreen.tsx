import popSound from "../../../assets/pop.mp3";
import { useReducer, useRef, useEffect, useState } from "react";
// import type { ChatMessage } from "../types"; // Removed unused import
import { MessageRenderer } from "../messages/MessageRenderer";
import WelcomeImage from "../../../assets/Welcome.png";
import PatternImage from "../../../assets/pattern.jpg";
import { IoSend, IoArrowBack, IoClose } from "react-icons/io5";
import Logo from "../../../assets/Logo.png";

import type { ExtendedChatMessage } from "../messages/actionCardTypes";
import type { ActionOption } from "../ActionCard";
import { sendChatMessage, startGuidedQuote } from "../../../services/api";
import type { GuidedResponsePayload } from "../../../services/guidedTypes";
import GuidedFormRenderer from "../GuidedFormRenderer";

const getTimeString = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


const ACTION_OPTIONS: ActionOption[] = [
  { label: "General Info", value: "general" },
  { label: "Get My Quote", value: "quote" },
  { label: "Exclusions", value: "exclusions" },
  { label: "Buy Now", value: "buy" },
];

type ChatInitOptions = { selectedProduct?: string | null; isGuidedFlow: boolean; initialMessages?: ChatMessageWithTimestamp[] };
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
};

type Action =
  | { type: "RESET"; selectedProduct?: string | null }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SEND_MESSAGE" }
  | { type: "RECEIVE_BOT_REPLY"; payload: string }
  | { type: "SELECT_OPTION"; payload: ActionOption }
  | { type: "RECEIVE_OPTION_RESPONSE"; payload: { response: string; option: ActionOption; remainingOptions: ActionOption[] } }
  | { type: "SET_LOADING"; payload: boolean };



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
      // Only run guided flow logic if isGuidedFlow is true
      const isGuidedFlow = state.isGuidedFlow;
      if (!isGuidedFlow) {
        // Free-form chat: just add bot reply, always remove all loading bubbles
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
          // Play pop sound immediately when bot reply is added
          if (typeof window !== 'undefined') {
            const audio = new Audio(popSound);
            audio.play().catch(() => {});
          }
        }
        return {
          ...state,
          messages: newMessages,
          showActionCard: false,
          loading: false,
          isSending: false,
        };
      }
      // Guided flow logic (existing), always remove all loading bubbles
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
      // Play pop sound immediately when bot reply is added (guided flow)
      if (typeof window !== 'undefined') {
        const audio = new Audio(popSound);
        audio.play().catch(() => {});
      }
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
    default:
      return state;
  }
}


type ChatMessageWithTimestamp = ExtendedChatMessage & { timestamp?: string };

interface ChatScreenProps {
  onBackClick?: () => void;
  onCloseClick?: () => void;
  selectedProduct?: string | null;
  userId: string | null;
  sessionId: string | null;
  sessionLoading?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps & { onMessagesChange?: (messages: ChatMessageWithTimestamp[]) => void; initialMessages?: ChatMessageWithTimestamp[]; onShowQuoteForm?: () => void }> = ({
  onBackClick,
  onCloseClick,
  selectedProduct,
  userId,
  sessionId,
  sessionLoading,
  onMessagesChange,
  initialMessages,
  onShowQuoteForm
}) => {
  const isGuidedFlow = !!selectedProduct;
  const [state, dispatch] = useReducer(
    reducer,
    { selectedProduct, isGuidedFlow, initialMessages },
    initialState,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Guided (backend-driven) form state
  const [lastGuidedResponse, setLastGuidedResponse] = useState<GuidedResponsePayload | null>(null);
  const [guidedFormValues, setGuidedFormValues] = useState<Record<string, string>>({});
  const [guidedActive, setGuidedActive] = useState(false);
  const [guidedStep, setGuidedStep] = useState<number | null>(null);

  // This function now calls the backend for real responses
  const fetchBotResponse = async (option: string) => {
    if (!userId || !sessionId) {
      return "Connecting to chat...";
    }
    try {
      const apiResp = await sendChatMessage({ user_id: userId, session_id: sessionId, message: option });
      console.log("DEBUG BOT RESPONSE:", apiResp);

      const inner = apiResp?.response as any;

      // Guided mode: only treat as guided when a guided journey was explicitly started
      if (guidedActive && inner && typeof inner === "object" && inner.mode === "guided") {
        const guidedEnvelope = inner as {
          mode: string;
          flow?: string;
          step?: number;
          response?: GuidedResponsePayload | string;
        };
        const payload = guidedEnvelope.response;
        if (payload && typeof payload === "object") {
          setLastGuidedResponse(payload as GuidedResponsePayload);
          setGuidedFormValues({});
          if (typeof guidedEnvelope.step === "number") {
            setGuidedStep(guidedEnvelope.step);
          }
          if ("message" in payload && typeof (payload as any).message === "string") {
            return (payload as any).message as string;
          }
          return "Please complete the form to continue.";
        }
      }

      // Conversational mode (or generic fallback): look into inner payload
      const r: any = inner;
      if (typeof r === "string") {
        return r;
      }
      if (r && typeof r === "object") {
        if (typeof r.response === "string") {
          return r.response;
        }
        if (typeof r.message === "string") {
          return r.message;
        }
      }
      return "Sorry, I could not understand the server response.";
    } catch {
      return "Sorry, I couldn't retrieve information from the server.";
    }
  };



  // Reset all chat state when selectedProduct changes
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

  const handleActionCardSelect = async (option: ActionOption) => {
    if (option.value === "quote") {
      // Start a guided quote journey from the selected product, instead of
      // using the separate QuoteForm screen.
      if (!userId || !sessionId) {
        return;
      }
      setGuidedActive(true);

      // Map selected product label to backend flow + product_id
      let flowName: string | null = null;
      let productId: string | null = null;

      switch (selectedProduct) {
        case "Personal Accident":
          flowName = "personal_accident";
          productId = "personal_accident";
          break;
        case "Serenicare":
          flowName = "serenicare";
          productId = "serenicare";
          break;
        case "Travel Sure Plus":
          flowName = "travel_insurance";
          productId = "travel_insurance";
          break;
        case "Motor Private Insurance":
          flowName = "motor_private";
          productId = "motor_private";
          break;
        default:
          break;
      }

      if (flowName && productId) {
        try {
          const resp = await startGuidedQuote({
            user_id: userId,
            flow_name: flowName,
            session_id: sessionId || undefined,
            initial_data: { product_id: productId },
          });

          // start-guided returns the guided envelope at the top level:
          // { session_id, mode, flow, step, response: { ... }, data }
          if (resp && resp.response && typeof resp.response === "object") {
            const payload = resp.response as GuidedResponsePayload;
            setLastGuidedResponse(payload);
            setGuidedFormValues({});
            if (typeof resp.step === "number") {
              setGuidedStep(resp.step);
            } else {
              setGuidedStep(0);
            }
            if ("message" in payload && typeof (payload as any).message === "string") {
              dispatch({ type: "RECEIVE_BOT_REPLY", payload: (payload as any).message as string });
            }
          } else {
            dispatch({
              type: "RECEIVE_BOT_REPLY",
              payload: "I’ve started your quote journey. Please follow the next instructions.",
            });
          }
        } catch {
          dispatch({
            type: "RECEIVE_BOT_REPLY",
            payload: "Sorry, I couldn't start the quote journey right now.",
          });
        }
      } else {
        // Fallback: if we don't recognise the product, send a descriptive message
        const text =
          selectedProduct && selectedProduct.trim().length > 0
            ? `I would like a quote for ${selectedProduct}.`
            : "I would like to get a quote.";
        const reply = await fetchBotResponse(text);
        dispatch({ type: "RECEIVE_BOT_REPLY", payload: reply });
      }
      return;
    }
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
            <h3 className="font-semibold text-white text-xs sm:text-sm truncate">Mutual Intellingence Assistant</h3>
            <span className="text-xs text-white/80 leading-tight">Online</span>
          </div>
        </div>
        <button onClick={onCloseClick} className="flex items-center text-white hover:bg-white/10 p-1 rounded transition cursor-pointer flex-shrink-0" title="Close">
          <IoClose size={18} className="sm:block" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 om-show-scrollbar">
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
          // Calculate spacing between messages: always apply mb-6 between different senders, mb-2 between same sender
          const prevMsg = idx > 0 ? state.messages[idx - 1] : null;
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
            } else if (idx !== state.messages.length - 1) {
              spacingClass = "mb-2"; // Minimal space between same sender
            }
          }

          // Only show action card and guided UI if isGuidedFlow is true
          const shouldShowActionCard =
            isGuidedFlow &&
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
        {/* Guided forms rendered inline when flows are active */}
        {lastGuidedResponse && userId && sessionId && (
          <GuidedFormRenderer
            response={lastGuidedResponse}
            values={guidedFormValues}
            onChange={(name, value) => {
              setGuidedFormValues((prev) => ({ ...prev, [name]: value }));
            }}
            onSubmit={async (nextValues) => {
              const payloadValues = nextValues || guidedFormValues;
              try {
                // First send: submit the current step's form data
                const apiResp = await sendChatMessage({
                  user_id: userId,
                  session_id: sessionId,
                  form_data: payloadValues,
                });

                const inner = apiResp?.response as any;

                if (inner && typeof inner === "object" && inner.mode === "guided") {
                  const env = inner as {
                    mode: string;
                    flow?: string;
                    step?: number;
                    response?: GuidedResponsePayload | string;
                    complete?: boolean;
                  };
                  
                  const currentStep = guidedStep ?? 0;
                  const serverStep = typeof env.step === "number" ? env.step : currentStep;

                  // The backend returns the NEXT step number in the 'step' field after processing
                  // So if we submitted step 6, the backend processes it and returns step 7
                  // We need to check if the server step is greater than our current step
                  if (serverStep > currentStep) {
                    // Step advanced: update our step tracker and fetch the schema for the new step
                    setGuidedStep(serverStep);
                    
                    // Fetch the next step's schema by sending an empty message
                    const nextResp = await sendChatMessage({
                      user_id: userId,
                      session_id: sessionId,
                      message: "",
                    });

                    const nextInner = nextResp?.response as any;
                    if (nextInner && typeof nextInner === "object" && nextInner.mode === "guided") {
                      const nextEnv = nextInner as {
                        mode: string;
                        flow?: string;
                        step?: number;
                        response?: GuidedResponsePayload | string;
                      };
                      const nextPayload = nextEnv.response;
                      if (nextPayload && typeof nextPayload === "object") {
                        setLastGuidedResponse(nextPayload as GuidedResponsePayload);
                        setGuidedFormValues({});
                        if ("message" in nextPayload && typeof (nextPayload as any).message === "string") {
                          dispatch({
                            type: "RECEIVE_BOT_REPLY",
                            payload: (nextPayload as any).message as string,
                          });
                        }
                        // Update step to match what the server says
                        if (typeof nextEnv.step === "number") {
                          setGuidedStep(nextEnv.step);
                        }
                        return;
                      }
                    }
                  } else if (serverStep === currentStep) {
                    // Step didn't advance (e.g., validation error or same step returned)
                    // Show the server's response (which might be an error or the same form)
                    const payload = env.response;
                    if (payload && typeof payload === "object") {
                      setLastGuidedResponse(payload as GuidedResponsePayload);
                      // Don't clear form values if it's the same step (user might need to fix errors)
                      if (serverStep !== currentStep) {
                        setGuidedFormValues({});
                      }
                      if ("message" in payload && typeof (payload as any).message === "string") {
                        dispatch({
                          type: "RECEIVE_BOT_REPLY",
                          payload: (payload as any).message as string,
                        });
                      }
                      if (typeof env.step === "number") {
                        setGuidedStep(env.step);
                      }
                    }
                  } else {
                    // Server step is less than current (shouldn't happen, but handle gracefully)
                    // Update to server's step
                    const payload = env.response;
                    if (payload && typeof payload === "object") {
                      setLastGuidedResponse(payload as GuidedResponsePayload);
                      setGuidedFormValues({});
                      if ("message" in payload && typeof (payload as any).message === "string") {
                        dispatch({
                          type: "RECEIVE_BOT_REPLY",
                          payload: (payload as any).message as string,
                        });
                      }
                      if (typeof env.step === "number") {
                        setGuidedStep(env.step);
                      }
                    }
                  }

                  // Check if flow is complete
                  if (env.complete) {
                    setLastGuidedResponse(null);
                    setGuidedFormValues({});
                    setGuidedActive(false);
                  }
                } else {
                  // Not in guided mode anymore; clear guided UI and show plain response text if present.
                  setLastGuidedResponse(null);
                  setGuidedFormValues({});
                  setGuidedActive(false);
                  const r: any = inner;
                  if (typeof r?.response === "string") {
                    dispatch({ type: "RECEIVE_BOT_REPLY", payload: r.response });
                  }
                }
              } catch (error) {
                console.error("Error submitting form:", error);
                dispatch({
                  type: "RECEIVE_BOT_REPLY",
                  payload: "Sorry, something went wrong while submitting the form.",
                });
              }
            }}
          />
        )}
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
      </div>
    </div>
  );

// ...existing code...
};
