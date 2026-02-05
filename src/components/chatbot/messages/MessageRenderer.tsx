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

interface MessageRendererProps {
  message: ChatMessage | ActionCardMessage | PurchaseSummaryMessage | PaymentMethodSelectorMessage | MobileMoneyFormMessage | PaymentLoadingScreenMessage;
  onActionCardSelect?: (option: import("../ActionCard").ActionOption) => void;
  onConfirmPayment?: () => void;
  onSelectPaymentMethod?: (method: "mobile" | "card" | "flexipay") => void;
  onSubmitMobilePayment?: (phoneNumber: string) => void;
  loading?: boolean;
  lastSelected?: string | null;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  onActionCardSelect,
  onConfirmPayment,
  onSelectPaymentMethod,
  onSubmitMobilePayment,
  loading,
  lastSelected,
}) => {
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
    return <UserBubble message={message as ChatMessage} />;
  }
  return <BotBubble message={message as ChatMessage} />;
};

