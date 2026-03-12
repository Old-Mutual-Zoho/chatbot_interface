import React from "react";

type FeedbackActionBarProps = {
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onConnectAgent: () => void;
  showThumbs?: boolean;
  showConnect?: boolean;
};

export const FeedbackActionBar: React.FC<FeedbackActionBarProps> = ({
  onThumbsUp,
  onThumbsDown,
  onConnectAgent,
  showThumbs = true,
  showConnect = true,
}) => {
  return (
    <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full bg-white px-2 py-1">
      {showThumbs ? (
        <>
          <button
            type="button"
            onClick={onThumbsUp}
            aria-label="Thumbs up"
            className="h-10 w-10 rounded-full border border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/45 hover:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:scale-95 transition-[transform,background-color,border-color,box-shadow] duration-150 text-base flex items-center justify-center outline-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:border-primary/45 focus-visible:bg-primary/10 focus-visible:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:border-primary/60 active:bg-primary/15 active:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)]"
          >
            👍
          </button>
          <button
            type="button"
            onClick={onThumbsDown}
            aria-label="Thumbs down"
            className="h-10 w-10 rounded-full border border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/45 hover:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:scale-95 transition-[transform,background-color,border-color,box-shadow] duration-150 text-base flex items-center justify-center outline-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:border-primary/45 focus-visible:bg-primary/10 focus-visible:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:border-primary/60 active:bg-primary/15 active:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)]"
          >
            👎
          </button>
        </>
      ) : null}
      {showConnect ? (
        <button
          type="button"
          onClick={onConnectAgent}
          className="h-10 px-4 rounded-full border border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/45 hover:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] hover:text-primary active:scale-95 transition-[transform,background-color,border-color,box-shadow,color] duration-150 text-base text-[color:color-mix(in_srgb,var(--primary)_80%,black)] outline-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:border-primary/45 focus-visible:bg-primary/10 focus-visible:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] focus-visible:text-primary active:border-primary/60 active:bg-primary/15 active:shadow-[0_0_0_2px_var(--primary),0_0_22px_var(--primary),0_0_60px_var(--primary)] active:text-primary"
        >
          Connect with agent
        </button>
      ) : null}
    </div>
  );
};
