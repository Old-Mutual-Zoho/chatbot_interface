import React from "react";

export const PaymentLoadingScreen: React.FC = () => {
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
              stroke="#86EFAC"
              strokeWidth="8"
              opacity="0.3"
            />
            {/* Animated segments */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00A651"
              strokeWidth="8"
              strokeDasharray="60 20 40 30"
              strokeLinecap="round"
              style={{
                transformOrigin: "center",
              }}
            />
          </svg>
          {/* Inner white circle */}
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-24 h-24 rounded-full bg-white border-4 flex items-center justify-center"
              style={{ borderColor: "#E8F5E9" }}
            >
              {/* Solid green circle in the center */}
              <div
                className="w-16 h-16 rounded-full"
                style={{ backgroundColor: "#00A651" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <p className="text-gray-900 font-semibold text-lg text-center escalation-loader">
        Connecting you to a human agent... Please wait.
      </p>
    </div>
  );
};
