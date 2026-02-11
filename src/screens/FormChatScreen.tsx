import React from "react";
import { ChatScreen } from "./ChatScreen";
import QuoteFormScreen from "./QuoteFormScreen";

interface FormChatScreenProps {
  selectedProduct?: string | null;
  userId: string | null;
  sessionId: string | null;
  onBackClick?: () => void;
  onCloseClick?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}


const FormChatScreen: React.FC<FormChatScreenProps> = (props) => {
  // Renders only the quote form, preserving ChatScreen layout
  return (
    <ChatScreen
      {...props}
      initialMessages={[]}
      renderCustomContent={({ selectedProduct, userId }: { selectedProduct?: string | null; userId: string | null }) => (
        <div className="flex justify-start animate-fade-in mb-4 w-full">
          <QuoteFormScreen
            embedded
            selectedProduct={selectedProduct}
            userId={userId}
            onFormSubmitted={() => {}}
          />
        </div>
      )}
    />
  );
};

export default FormChatScreen;
