import type { ChatMessage } from "../types";
import type { ActionOption } from "../ActionCard";

export type ActionCardMessage = {
  id: string;
  type: "action-card";
  sender: "bot";
  options: ActionOption[];
};

export type PurchaseSummaryMessage = {
  id: string;
  type: "purchase-summary";
  sender: "bot";
  productName: string;
  price: string;
  duration: string;
  isLoading?: boolean;
};

export type PaymentMethodSelectorMessage = {
  id: string;
  type: "payment-method-selector";
  sender: "bot";
};

export type MobileMoneyFormMessage = {
  id: string;
  type: "mobile-money-form";
  sender: "bot";
  isLoading?: boolean;
};

export type PaymentLoadingScreenMessage = {
  id: string;
  type: "payment-loading-screen";
  sender: "bot";
};

export type ExtendedChatMessage = ChatMessage | ActionCardMessage | PurchaseSummaryMessage | PaymentMethodSelectorMessage | MobileMoneyFormMessage | PaymentLoadingScreenMessage;
