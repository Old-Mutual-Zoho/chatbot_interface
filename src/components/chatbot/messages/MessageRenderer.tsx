import type { ChatMessage } from "../types";
import { BotBubble } from "./BotBubble";
import { UserBubble } from "./UserBubble";
import { LoadingBubble } from "./LoadingBubble";
import CustomWelcomeCard from "./CustomWelcomeCard";
import type { ActionCardMessage } from "./actionCardTypes";
import { ActionCardRenderer } from "./ActionCardRenderer";

interface MessageRendererProps {
  message: ChatMessage | ActionCardMessage;
  onActionCardSelect?: (option: import("../ActionCard").ActionOption) => void;
  loading?: boolean;
  lastSelected?: string | null;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ message, onActionCardSelect, loading, lastSelected }) => {
  if (message.type === "loading") {
    return <LoadingBubble />;
  }
  if (message.type === "custom-welcome") {
    return <CustomWelcomeCard />;
  }
  if (message.type === "action-card") {
    return <ActionCardRenderer message={message as ActionCardMessage} onSelect={onActionCardSelect!} loading={loading} lastSelected={lastSelected} />;
  }
  if (message.sender === "user") {
    return <UserBubble message={message as ChatMessage} />;
  }
  return <BotBubble message={message as ChatMessage} />;
};
