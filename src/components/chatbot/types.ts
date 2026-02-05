export type MessageType = "text" | "loading" | "custom-welcome" | "action-card" | "purchase-summary" | "payment-method-selector" | "mobile-money-form" | "payment-loading-screen";

export interface ChatMessage {
  id: string;
  type: MessageType;
  sender: "user" | "bot";
  text?: string;
}

export interface PurchaseSummaryData {
  productName: string;
  price: string;
  duration: string;
  isLoading?: boolean;
}
