

import type { ChatMessage } from "../types";
import UserIcon from "../../../assets/user.png";

interface UserBubbleProps {
  message: ChatMessage & { timestamp?: string };
}

export const UserBubble: React.FC<UserBubbleProps> = ({ message }) => {
  const isShort = (message.text || '').length <= 40;
  return (
    <div className="flex justify-end mb-2 animate-fade-in mr-3 sm:mr-5 gap-2 items-end">
      <div className="max-w-xs sm:max-w-sm md:max-w-md px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-200 text-gray-900 text-sm shadow-md hover:shadow-lg transition-shadow overflow-hidden" style={{ borderRadius: '18px 18px 4px 18px' }}>
        <div className={isShort && message.timestamp ? "flex items-center justify-between gap-2" : undefined}>
          <p className="break-words whitespace-pre-wrap leading-relaxed text-sm sm:text-base flex-1">{message.text}</p>
          {isShort && message.timestamp && (
            <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">{message.timestamp}</span>
          )}
        </div>
        {!isShort && message.timestamp && (
          <p className="text-xs text-gray-600 mt-1 text-right">{message.timestamp}</p>
        )}
      </div>
      <img src={UserIcon} alt="User" className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0" />
    </div>
  );
};
