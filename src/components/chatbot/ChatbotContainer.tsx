import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface Props {
  onClose: () => void;
}

export default function ChatbotContainer({ onClose }: Props) {
  return (
    <div className="fixed bottom-28 right-6 w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <ChatHeader onClose={onClose} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <ChatMessages />
      </div>

      {/* Input Area */}
      <ChatInput />
    </div>
  );
}
