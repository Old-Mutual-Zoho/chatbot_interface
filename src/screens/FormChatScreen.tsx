import React from "react";
import ChatScreen from "./ChatScreen";
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
  // Only render the form, but keep the header and footer from ChatScreen
  return (
    <ChatScreen
      {...props}
      initialMessages={[]}
      // Always show the quote form on this screen
      // We use a custom key to force remount if needed
      renderCustomContent={({ selectedProduct, userId }) => (
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
