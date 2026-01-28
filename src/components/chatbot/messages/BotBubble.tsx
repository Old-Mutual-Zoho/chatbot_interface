
import type { ChatMessage } from "../types";
import Logo from "../../../assets/Logo.png";
import { useEffect, useRef } from "react";
import popSound from "../../../assets/pop.mp3";
import ReactMarkdown from "react-markdown";

interface BotBubbleProps {
  message: ChatMessage & { timestamp?: string };
}

export const BotBubble: React.FC<BotBubbleProps> = ({ message }) => {
  const isShort = (message.text || '').length <= 40;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play sound only for actual bot text messages (not loading, not welcome, etc.)
    if (message.type === "text" && message.sender === "bot") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [message.id]);

  return (
    <div className="flex justify-start mb-2 animate-fade-in gap-2 items-end">
      <audio ref={audioRef} src={popSound} preload="auto" />
      <img src={Logo} alt="Old Mutual" className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0" />
      <div className="max-w-xs sm:max-w-sm md:max-w-md px-4 sm:px-5 py-2.5 sm:py-3 bg-[#e6f7ef] text-gray-900 text-sm shadow-md hover:shadow-lg transition-shadow overflow-hidden" style={{ borderRadius: '18px 18px 18px 4px' }}>
        <div className={isShort && message.timestamp ? "flex items-center justify-between gap-2" : undefined}>
          <div className="break-words whitespace-pre-wrap leading-relaxed text-sm sm:text-base flex-1">
            <ReactMarkdown>{message.text || ""}</ReactMarkdown>
          </div>
          {isShort && message.timestamp && (
            <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">{message.timestamp}</span>
          )}
        </div>
        {!isShort && message.timestamp && (
          <p className="text-xs text-gray-600 mt-1 text-right">{message.timestamp}</p>
        )}
      </div>
    </div>
  );
};
