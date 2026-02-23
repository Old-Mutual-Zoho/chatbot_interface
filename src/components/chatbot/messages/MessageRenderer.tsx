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

interface MessageRendererProps {
  message: ChatMessage | ActionCardMessage | PurchaseSummaryMessage | PaymentMethodSelectorMessage | MobileMoneyFormMessage | PaymentLoadingScreenMessage;
  onActionCardSelect?: (option: import("../ActionCard").ActionOption) => void;
  onConfirmPayment?: () => void;
  onSelectPaymentMethod?: (method: "mobile" | "card" | "flexipay") => void;
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

  const renderAsWhatsAppText = (text: string) => {
    const normalized: ChatMessage = {
      id: (message as { id: string }).id || String(Date.now()),
      type: 'text',
      sender: (message as any).sender === 'user' ? 'user' : 'bot',
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
    if (message.type === 'action-card') {
      const options = (message as any).options as Array<{ label: string }> | undefined;
      const optionLines = (options ?? []).map((o) => `- ${o.label}`).join('\n');
      return renderAsWhatsAppText(optionLines ? `Options:\n${optionLines}` : 'Options available.');
    }
    if (message.type === 'purchase-summary') {
      const p = message as any;
      return renderAsWhatsAppText(`Purchase summary:\n${p.productName ?? ''}\n${p.price ?? ''} ${p.duration ?? ''}`.trim());
    }
    if (message.type === 'payment-method-selector') {
      return renderAsWhatsAppText('Choose a payment method: Mobile Money, Card, FlexiPay.');
    }
    if (message.type === 'mobile-money-form') {
      return renderAsWhatsAppText('Please enter your Mobile Money phone number.');
    }
    if (message.type === 'payment-loading-screen') {
      return renderAsWhatsAppText('Processing…');
    }
    // Plain text (or any remaining types)
    if ((message as any).sender === 'user') {
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
    return <PaymentLoadingScreen />;
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

