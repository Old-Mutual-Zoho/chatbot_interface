export type ChatMessageSender = 'user' | 'bot';

export interface ChatMessage {
	id: string;
	text: string;
	sender: ChatMessageSender;
}

