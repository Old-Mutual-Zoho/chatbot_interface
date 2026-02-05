import React, { useState } from "react";

interface MobileMoneyFormProps {
  onSubmitPayment?: (phoneNumber: string) => void;
  isLoading?: boolean;
}

export const MobileMoneyForm: React.FC<MobileMoneyFormProps> = ({
  onSubmitPayment,
  isLoading = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = () => {
    if (phoneNumber.trim() && onSubmitPayment) {
      onSubmitPayment(`256${phoneNumber.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && phoneNumber.trim() && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="flex justify-start mb-4 mt-4 w-full">
      <div
        className="rounded-2xl shadow-sm overflow-hidden w-full"
        style={{
          backgroundColor: "#D4F4E2",
        }}
      >
        {/* Content */}
        <div className="px-5 py-5">
          {/* MTN and Airtel Logos */}
          <div className="flex justify-center items-center gap-0 mb-4">
            {/* Airtel Logo */}
            <div
              className="px-4 py-2 flex items-center justify-center"
              style={{
                backgroundColor: "#E91E2C",
                borderRadius: "8px 0 0 8px",
              }}
            >
              <span
                className="font-bold text-base"
                style={{ color: "#FFF" }}
              >
                airtel
              </span>
            </div>
            {/* MTN Logo */}
            <div
              className="px-4 py-2 flex items-center justify-center"
              style={{
                backgroundColor: "#FFCC00",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <span
                className="font-bold text-base"
                style={{ color: "#000" }}
              >
                MTN
              </span>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-gray-900 text-sm text-center font-medium mb-4 leading-relaxed">
            Enter a valid mobile money number below
            <br />
            to process your payment
          </p>

          {/* Phone Number Input */}
          <div
            className="rounded-xl overflow-hidden mb-4"
            style={{ backgroundColor: "#B8E8CB" }}
          >
            <div className="px-4 py-3">
              <label className="block text-gray-900 text-xs font-semibold mb-2">
                Enter Phone Number
              </label>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                <span className="text-gray-900 font-semibold text-sm">256</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  onKeyPress={handleKeyPress}
                  placeholder=""
                  disabled={isLoading}
                  maxLength={9}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm placeholder-gray-400 disabled:opacity-60"
                  style={{ minWidth: "150px" }}
                />
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handleSubmit}
            disabled={!phoneNumber.trim() || isLoading}
            className="w-full py-3 px-4 rounded-lg font-bold text-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: !phoneNumber.trim() || isLoading ? "#9CA3AF" : "#00A651",
              cursor: !phoneNumber.trim() || isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
                Processing...
              </span>
            ) : (
              "PAY NOW"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
