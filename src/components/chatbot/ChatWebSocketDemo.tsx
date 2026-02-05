import { useState } from "react";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";

const USER_ID = "demo-user-1"; // Replace with real user/session logic

export default function ChatWebSocketDemo() {
  const [input, setInput] = useState("");
  const { readyState, lastMessage, send } = useChatWebSocket(USER_ID);

  const handleSend = () => {
    if (input.trim()) {
      send({ message: input });
      setInput("");
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto mt-8">
      <div className="mb-2 text-sm text-gray-500">
        WebSocket status: <b>{readyState}</b>
      </div>
      <div className="mb-4">
        <input
          className="border px-2 py-1 rounded w-3/4"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
          onClick={handleSend}
          disabled={readyState !== "open"}
        >
          Send
        </button>
      </div>
      <div className="bg-gray-100 p-2 rounded min-h-[60px]">
        <div className="text-xs text-gray-400 mb-1">Last message from server:</div>
        <pre className="whitespace-pre-wrap break-all text-sm">
          {lastMessage ? JSON.stringify(lastMessage, null, 2) : "(none)"}
        </pre>
      </div>
    </div>
  );
}
