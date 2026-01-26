export type MessageType = "text" | "loading" | "custom-welcome";

export interface ChatMessage {
  id: string;
  type: MessageType;
  sender: "user" | "bot";
  text?: string;
}
