export interface MessageBubbleProps {
  text: string;
  isUser?: boolean;
  onClick?: () => void;
}

export function MessageBubble({
  text,
  isUser = false,
  onClick,
}: MessageBubbleProps) {
  const row = isUser
    ? 'flex items-end gap-[10px] justify-end flex-row-reverse'
    : 'flex items-end gap-[10px] justify-start';

  const avatarBase =
    'w-[34px] h-[34px] flex-none rounded-full grid place-items-center text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white';
  const avatar = isUser ? `${avatarBase} bg-[#111827]` : `${avatarBase} bg-[var(--om-green)]`;

  const bubbleBase =
    'max-w-[72%] py-[10px] px-[12px] rounded-[14px] leading-[1.4] text-[0.95rem] whitespace-pre-wrap break-words shadow-[0_1px_2px_rgba(0,0,0,0.08)] transform-gpu animate-bubble-float motion-reduce:animate-none hover:[animation-play-state:paused]';

  const bubbleTone = isUser
    ? 'bg-white text-[#111827] border border-black/10 rounded-tr-[6px]'
    : 'bg-gradient-to-br from-[#4ade80] to-[#00a651] text-white rounded-tl-[6px]';

  const bubble = `${bubbleBase} ${bubbleTone} ${onClick ? 'cursor-pointer' : 'cursor-default'}`;

  return (
    <div className={row}>
      <div
        className={avatar}
        aria-hidden="true"
        title={isUser ? 'You' : 'MIA'}
      >
        {isUser ? 'You' : 'MIA'}
      </div>

      <div
        className={bubble}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === 'Enter' || e.key === ' ') onClick();
        }}
      >
        {text}
      </div>
    </div>
  );
}
