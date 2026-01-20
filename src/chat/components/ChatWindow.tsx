import { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import type { ChatMessage } from '../types/message';
import { ChatInput } from './ChatInput';
	import { ChatLandingPanel } from '../../pages/ChatLandingPanel';
	import { unitToBotMessage, type BusinessUnit } from '../domain/businessUnits';

function createBotReply(userText: string): string {
	const trimmed = userText.trim();
	if (!trimmed) return "I'm here — what would you like help with?";

	const lower = trimmed.toLowerCase();
	if (lower.includes('claim')) return 'Sure — are you asking about starting a claim, required documents, or tracking an existing claim?';
	if (lower.includes('premium') || lower.includes('payment')) return 'Got it. Do you want to pay a premium, check an amount due, or see payment methods?';
	if (lower.includes('hello') || lower.includes('hi')) return 'Hello! What can I help you with today?';

	return 'Thanks — could you share a bit more detail so I guide you correctly?';
}

export interface ChatWindowProps {
  initialView?: 'chat' | 'landing';
	hideHeader?: boolean;
}

export function ChatWindow({ initialView = 'chat', hideHeader = false }: ChatWindowProps) {
	const [view, setView] = useState<'chat' | 'landing'>(initialView);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: 'm1',
			text: "Hi there — I'm your Old Mutual Uganda assistant. What can I help you with today?",
			sender: 'bot',
		},
	]);
	const [draft, setDraft] = useState('');

	const send = () => {
		const text = draft.trim();
		if (!text) return;

		const userMessage: ChatMessage = {
			id: `u-${Date.now()}`,
			text,
			sender: 'user',
		};

		setMessages((prev) => [...prev, userMessage]);
		setDraft('');
		setView('chat');

		window.setTimeout(() => {
			const botMessage: ChatMessage = {
				id: `b-${Date.now()}`,
				text: createBotReply(text),
				sender: 'bot',
			};
			setMessages((prev) => [...prev, botMessage]);
		}, 450);
	};

	const handleMessageClick = (message: ChatMessage) => {
		if (message.sender !== 'bot') return;
		setView('landing');
	};

	const pickUnit = (unit: BusinessUnit) => {
		setMessages((prev) => [...prev, unitToBotMessage(unit)]);
		setView('chat');
	};

	return (
		<div className="chat-window cw">
			{!hideHeader && <ChatHeader />}
			{view === 'landing' ? (
				<ChatLandingPanel
					onPickUnit={pickUnit}
					onSend={send}
					draft={draft}
					onDraftChange={setDraft}
				/>
			) : (
				<>
					<ChatMessages messages={messages} onMessageClick={handleMessageClick} />
					<ChatInput value={draft} onChange={setDraft} onSend={send} />
				</>
			)}
		</div>
	);
}

