import React from "react";

import type { PaymentLoadingScreenVariant } from "./actionCardTypes";

type PaymentLoadingScreenProps = {
  variant?: PaymentLoadingScreenVariant;
  text?: string;
};

export const PaymentLoadingScreen: React.FC<PaymentLoadingScreenProps> = ({
  variant = "payment",
  text,
}) => {
  const defaultTextByVariant: Record<PaymentLoadingScreenVariant, string> = {
    quote: "Calculating your quote... Please wait",
    payment: "Processing or verifying your details...",
    escalation: "Connecting you to a human agent... Please wait.",
  };

  const displayText = text ?? defaultTextByVariant[variant];
  return (
    <div className="flex flex-col items-center justify-center py-12 w-full">
      {/* Loading Spinner */}
      <div className="mb-6">
        <div className="relative w-32 h-32">
          {/* Outer ring with segments */}
          <svg
            className="animate-spin"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Light green background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-primary/30"
            />
            {/* Animated segments */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray="60 20 40 30"
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
          {/* Inner white circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-24 h-24 rounded-full bg-white border-4 border-primary/10 flex items-center justify-center"
            >
              {/* Solid green circle in the center */}
              <div className="w-16 h-16 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <p className="text-gray-900 font-semibold text-lg text-center escalation-loader">
        {displayText}
      </p>
    </div>
  );
};
