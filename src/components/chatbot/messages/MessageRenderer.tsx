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
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ message, onActionCardSelect }) => {
  if (message.type === "loading") {
    return <LoadingBubble />;
  }
  if (message.type === "custom-welcome") {
    return <CustomWelcomeCard />;
  }
  if (message.type === "action-card") {
    return <ActionCardRenderer message={message} onSelect={onActionCardSelect!} />;
  }
  if (message.sender === "user") {
    return <UserBubble message={message} />;
  }
  return <BotBubble message={message as any} />;
};
