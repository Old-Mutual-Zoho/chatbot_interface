import type { ChatMessage } from "../types";
import UserIcon from "../../../assets/user.png";

interface UserBubbleProps {
  message: ChatMessage & { timestamp?: string };
  channel?: 'web' | 'whatsapp';
}

export const UserBubble: React.FC<UserBubbleProps> = ({ message, channel = 'web' }) => {
  const isShort = (message.text || '').length <= 40;
  const isWhatsApp = channel === 'whatsapp';
  return (
    <div className="flex w-full justify-end mb-2 animate-fade-in gap-2 items-end">
      <div className="bg-green-100 rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] break-words">
        <div className={isShort && message.timestamp ? "flex items-center justify-between gap-2" : undefined}>
          <p className="break-words whitespace-pre-wrap leading-relaxed text-sm flex-1">{message.text}</p>
          {!isWhatsApp && isShort && message.timestamp && (
            <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">{message.timestamp}</span>
          )}
        </div>
        {!isWhatsApp && !isShort && message.timestamp && (
          <p className="text-xs text-gray-600 mt-1 text-right">{message.timestamp}</p>
        )}
      </div>
      {!isWhatsApp ? (
        <img src={UserIcon} alt="User" className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0" />
      ) : null}
    </div>
  );
};
