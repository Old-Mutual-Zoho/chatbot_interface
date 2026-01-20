import { useCallback, useEffect, useRef, useState } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = 'Type your message…',
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const markTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 700);
  }, []);

  const sendNow = useCallback(() => {
    onSend();
    setIsTyping(false);
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, [onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') sendNow();
    },
    [sendNow],
  );

  return (
    <div className="chat-input-container">
      <input
        className={`chat-input${isTyping ? ' is-typing' : ''}`}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          markTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      <button className="btn btn-send" onClick={sendNow} disabled={!value.trim()}>
        Send
      </button>
    </div>
  );
}
