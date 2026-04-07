// Auto-convert plain text to markdown for bot messages
function autoConvertToMarkdown(text: string): string {
  if (!text) return '';
  let out = text;
  // Convert numbered lists
  out = out.replace(/^(\d+)\.\s+/gm, (_, n) => `${n}. `);
  // Convert bullets (lines starting with - or *)
  out = out.replace(/^(?:\-|\*)\s+/gm, '- ');
  // Subtitle keywords (Definition, Benefits, Eligibility, Summary, Note, etc.)
  out = out.replace(/^(Definition|Benefits|Eligibility|Summary|Note):/gim, '\n**$1:**');
  // Questions as subtitles (e.g. 'Who is this for?')
  out = out.replace(/^(Who is this for\?|What is [^?]+\?|How does [^?]+\?|Why [^?]+\?|When [^?]+\?|Where [^?]+\?):/gim, '\n**$1**');
  // Also handle 'Question:' as a subtitle
  out = out.replace(/^(Question):/gim, '\n**$1:**');
  // Convert _italics_ (simulate for lines with 'Note:')
  out = out.replace(/_([^_]+)_/g, '*$1*');
  // Convert ~strikethrough~
  out = out.replace(/~([^~]+)~/g, '~~$1~~');
  // Convert inline code (simulate for text in backticks)
  out = out.replace(/`([^`]+)`/g, '`$1`');
  // Add spacing for paragraphs
  out = out.replace(/\n{2,}/g, '\n\n');
  // Remove accidental double newlines at start
  out = out.replace(/^\n+/, '');

  // Auto-bullet lines after 'This cover includes:' or similar, with emoji for important info
  out = out.replace(/(This cover includes:|Benefits:)([\s\S]*?)(\n\n|$)/gi, (match, title, items, ending) => {
    // Split lines, filter non-empty, and bullet those that look like items (not sentences)
    const lines = items.split(/\n/).map((l: string) => l.trim()).filter((l: string) => l);
    if (lines.length === 0) return match;
    // Use emoji bullet for important info
    const importantBullet = '🔹';
    const bulleted = lines.map((l: string) => l && !/^[-*🔹]/.test(l) ? `${importantBullet} ${l}` : l).join('\n');
    return `\n**${title}**\n${bulleted}${ending}`;
  });

  return out;
}
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
          alt="OM-Intelligence"
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
        />
      ) : null}
      <div
        className={
          isWhatsApp
            ? 'bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] break-words'
            : 'bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] break-words chatbot-markdown'
        }
      >
        <div className={isShort && message.timestamp ? "flex items-center justify-between gap-2" : undefined}>
          <div className="break-words whitespace-pre-wrap leading-relaxed om-chatbot-message-text flex-1">
            <ReactMarkdown>{autoConvertToMarkdown(message.text || "")}</ReactMarkdown>
          </div>
          {!isWhatsApp && isShort && message.timestamp && (
            <span className="om-chatbot-meta ml-2 whitespace-nowrap">{message.timestamp}</span>
          )}
        </div>
        {!isWhatsApp && !isShort && message.timestamp && (
          <p className="om-chatbot-meta mt-1 text-right">{message.timestamp}</p>
        )}
      </div>
    </div>
  );
};
