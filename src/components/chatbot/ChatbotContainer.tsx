import { useState } from "react";
import ChatHeader from "./ChatHeader";
import FadeWrapper from "./FadeWrapper";
import HomeScreen from "./screens/HomeScreen";
import ChatScreen from "./screens/ChatScreen";

export default function ChatbotContainer({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<"home" | "chat">("home");

  return (
    <div className="w-[430px] h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">

      {/* Header (hidden on home) */}
      {screen !== "home" && (
        <ChatHeader
          title="Conversation"
          onBack={() => setScreen("home")}
          onClose={onClose}
        />
      )}

      {/* Screens */}
      <div className="flex-1 relative">

        {/* HOME */}
        <FadeWrapper isVisible={screen === "home"}>
          <HomeScreen
            onStartChat={() => setScreen("chat")}
            onGoToConversation={() => setScreen("chat")}
          />
        </FadeWrapper>

        {/* CHAT */}
        <FadeWrapper isVisible={screen === "chat"}>
          <ChatScreen />
        </FadeWrapper>

      </div>
    </div>
  );
}
