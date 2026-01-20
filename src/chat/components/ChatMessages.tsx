import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../types/message';

interface ChatMessagesProps {
  messages: ChatMessage[];
  onMessageClick?: (message: ChatMessage) => void;
}

export function ChatMessages({ messages, onMessageClick }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          text={message.text}
          isUser={message.sender === 'user'}
          onClick={onMessageClick ? () => onMessageClick(message) : undefined}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
