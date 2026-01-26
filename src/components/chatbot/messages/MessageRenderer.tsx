
import type { ChatMessage } from "../types";
import { BotBubble } from "./BotBubble";
import { UserBubble } from "./UserBubble";
import { LoadingBubble } from "./LoadingBubble";
import CustomWelcomeCard from "./CustomWelcomeCard";

interface MessageRendererProps {
  message: ChatMessage;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ message }) => {
  if (message.type === "loading") {
    return <LoadingBubble />;
  }
  if (message.type === "custom-welcome") {
    return <CustomWelcomeCard />;
  }
  if (message.sender === "user") {
    return <UserBubble message={message} />;
  }
  return <BotBubble message={message} />;
};
