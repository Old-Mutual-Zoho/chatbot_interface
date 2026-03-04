import React from "react";

type FeedbackActionBarProps = {
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onConnectAgent: () => void;
};

export const FeedbackActionBar: React.FC<FeedbackActionBarProps> = ({
  onThumbsUp,
  onThumbsDown,
  onConnectAgent,
}) => {
  return (
    <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full bg-white px-2 py-1">
      <button
        type="button"
        onClick={onThumbsUp}
        aria-label="Thumbs up"
        className="h-10 w-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition text-base flex items-center justify-center"
      >
        👍
      </button>
      <button
        type="button"
        onClick={onThumbsDown}
        aria-label="Thumbs down"
        className="h-10 w-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition text-base flex items-center justify-center"
      >
        👎
      </button>
      <button
        type="button"
        onClick={onConnectAgent}
        className="h-10 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition text-base text-[color:color-mix(in_srgb,var(--primary)_80%,black)]"
      >
        Connect with agent
      </button>
    </div>
  );
};
