import type { ChatMessage } from "../types";
import { BotBubble } from "./BotBubble";
import { UserBubble } from "./UserBubble";
import { LoadingBubble } from "./LoadingBubble";
import CustomWelcomeCard from "./CustomWelcomeCard";
import type { ActionCardMessage, PurchaseSummaryMessage, PaymentMethodSelectorMessage, MobileMoneyFormMessage, PaymentLoadingScreenMessage } from "./actionCardTypes";
import { ActionCardRenderer } from "./ActionCardRenderer";
import { PurchaseSummary } from "./PurchaseSummary";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { MobileMoneyForm } from "./MobileMoneyForm";
import { PaymentLoadingScreen } from "./PaymentLoadingScreen";
import { AgentBubble } from "./AgentBubble";
import Logo from "../../../assets/Logo.png";
import humanAvatar from "../../../assets/ai-profile.jpeg";

import type { PaymentMethod } from "./PaymentMethodSelector";

interface MessageRendererProps {
  message: ChatMessage | ActionCardMessage | PurchaseSummaryMessage | PaymentMethodSelectorMessage | MobileMoneyFormMessage | PaymentLoadingScreenMessage;
  onActionCardSelect?: (option: import("../ActionCard").ActionOption) => void;
  onConfirmPayment?: () => void;
  onSelectPaymentMethod?: (method: PaymentMethod) => void;
  onSubmitMobilePayment?: (phoneNumber: string) => void;
  loading?: boolean;
  lastSelected?: string | null;
  chatMode?: 'bot' | 'human';
  avatar?: string;
  channel?: 'web' | 'whatsapp';
}

export const MessageRenderer: React.FC<MessageRendererProps & { avatar?: string }> = ({
  message,
  onActionCardSelect,
  onConfirmPayment,
  onSelectPaymentMethod,
  onSubmitMobilePayment,
  loading,
  lastSelected,
  chatMode,
  avatar,
  channel = 'web',
}) => { //whatsapp mode: if message is not text, render a text version of it. For all messages, render using the appropriate bubble but with whatsapp styling (no avatar, different colors, etc).
  const isWhatsApp = channel === 'whatsapp';

  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

  const isActionCard = (
    m: MessageRendererProps["message"]
  ): m is ActionCardMessage => m.type === 'action-card' && isRecord(m) && Array.isArray((m as Record<string, unknown>)['options']);

  const isPurchaseSummary = (
    m: MessageRendererProps["message"]
  ): m is PurchaseSummaryMessage =>
    m.type === 'purchase-summary' && isRecord(m) && typeof (m as Record<string, unknown>)['productName'] === 'string';

  const isPaymentLoading = (
    m: MessageRendererProps["message"]
  ): m is PaymentLoadingScreenMessage => m.type === 'payment-loading-screen';

  const renderAsWhatsAppText = (text: string) => {
    const normalized: ChatMessage = {
      // Must be stable/idempotent during render (no Date.now).
      id: message.id,
      type: 'text',
      sender: message.sender === 'user' ? 'user' : 'bot',
      text,
    };
    return normalized.sender === 'user'
      ? <UserBubble message={normalized} channel="whatsapp" />
      : <BotBubble message={normalized} channel="whatsapp" />;
  };

  if (isWhatsApp) {
    // WhatsApp mode: render ONLY message bubbles (no cards, no loaders, no forms).
    if (message.type === 'loading') {
      return renderAsWhatsAppText('…');
    }
    if (message.type === 'custom-welcome') {
      return renderAsWhatsAppText("Hi, I'm MIA!\nHow may I help you today?");
    }
    if (isActionCard(message)) {
      const optionLines = (message.options ?? []).map((o) => `- ${o.label}`).join('\n');
      return renderAsWhatsAppText(optionLines ? `Options:\n${optionLines}` : 'Options available.');
    }
    if (isPurchaseSummary(message)) {
      return renderAsWhatsAppText(
        `Purchase summary:\n${message.productName ?? ''}\n${message.price ?? ''} ${message.duration ?? ''}`.trim()
      );
    }
    if (message.type === 'payment-method-selector') {
      return renderAsWhatsAppText('Choose a payment method: Mobile Money, Card, FlexiPay.');
    }
    if (message.type === 'mobile-money-form') {
      return renderAsWhatsAppText('Please enter your Mobile Money phone number.');
    }
    if (isPaymentLoading(message)) {
      return renderAsWhatsAppText('Processing…');
    }
    // Plain text (or any remaining types)
    if (message.sender === 'user') {
      return <UserBubble message={message as ChatMessage} channel="whatsapp" />;
    }
    return <BotBubble message={message as ChatMessage} channel="whatsapp" />;
  }

  if (message.type === "loading") {
    return <LoadingBubble />;
  }
  if (message.type === "custom-welcome") {
    return <CustomWelcomeCard />;
  }
  if (message.type === "action-card") {
    return (
      <ActionCardRenderer
        message={message as ActionCardMessage}
        onSelect={onActionCardSelect!}
        loading={loading}
        lastSelected={lastSelected}
      />
    );
  }
  if (message.type === "purchase-summary") {
    const purchaseMsg = message as PurchaseSummaryMessage;
    return (
      <PurchaseSummary
        productName={purchaseMsg.productName}
        price={purchaseMsg.price}
        duration={purchaseMsg.duration}
        isLoading={purchaseMsg.isLoading}
        onConfirmPayment={onConfirmPayment}
      />
    );
  }
  if (message.type === "payment-method-selector") {
    return <PaymentMethodSelector onSelectMethod={onSelectPaymentMethod} />;
  }
  if (message.type === "mobile-money-form") {
    const mobileMsg = message as MobileMoneyFormMessage;
    return (
      <MobileMoneyForm
        onSubmitPayment={onSubmitMobilePayment}
        isLoading={mobileMsg.isLoading}
      />
    );
  }
  if (message.type === "payment-loading-screen") {
    const m = message as PaymentLoadingScreenMessage;
    return <PaymentLoadingScreen variant={m.variant} text={m.text} />;
  }
  if (message.sender === "user") {
    return <UserBubble message={message as ChatMessage} channel="web" />;
  }
  // For new incoming bot messages, use avatar from message if present, else fallback
  if (message.sender === "bot") {
    const avatarSrc = avatar || (chatMode === "human" ? humanAvatar : Logo);
    return chatMode === "human"
      ? <AgentBubble message={message as ChatMessage} avatar={avatarSrc} />
      : <BotBubble message={message as ChatMessage} avatar={avatarSrc} channel="web" />;
  }
  return <BotBubble message={message as ChatMessage} avatar={Logo} channel="web" />;
};

