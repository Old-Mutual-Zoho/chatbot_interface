import type { ChatMessage } from "../types";
// Avatar is now passed as prop
import ReactMarkdown from "react-markdown";

interface BotBubbleProps {
  message: ChatMessage & { timestamp?: string };
  avatar?: string;
  channel?: 'web' | 'whatsapp';
}

export const BotBubble: React.FC<BotBubbleProps> = ({ message, avatar, channel = 'web' }) => {
  const isShort = (message.text || '').length <= 40;
  const isWhatsApp = channel === 'whatsapp';

  return (
    <div className="flex w-full justify-start mb-2 animate-fade-in gap-2 items-end">
      {!isWhatsApp ? (
        <img
          src={avatar}
          alt="Old Mutual"
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
        />
      ) : null}
      <div
        className={
          isWhatsApp
            ? 'bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] break-words'
            : 'bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] break-words'
        }
      >
        <div className={isShort && message.timestamp ? "flex items-center justify-between gap-2" : undefined}>
          <div className="break-words whitespace-pre-wrap leading-relaxed text-sm flex-1">
            <ReactMarkdown>{message.text || ""}</ReactMarkdown>
          </div>
          {!isWhatsApp && isShort && message.timestamp && (
            <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">{message.timestamp}</span>
          )}
        </div>
        {!isWhatsApp && !isShort && message.timestamp && (
          <p className="text-xs text-gray-600 mt-1 text-right">{message.timestamp}</p>
        )}
      </div>
    </div>
  );
};
