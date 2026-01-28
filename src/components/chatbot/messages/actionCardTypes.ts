import type { ChatMessage } from "../types";
import type { ActionOption } from "../ActionCard";

export type ActionCardMessage = {
  id: string;
  type: "action-card";
  sender: "bot";
  options: ActionOption[];
};

export type ExtendedChatMessage = ChatMessage | ActionCardMessage;
