import React, { useState } from "react";

interface PaymentMethodSelectorProps {
  onSelectMethod?: (method: "mobile" | "card" | "flexipay") => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelectMethod,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleMethodSelect = (method: "mobile" | "card" | "flexipay") => {
    setSelectedMethod(method);
    setTimeout(() => {
      if (onSelectMethod) {
        onSelectMethod(method);
      }
    }, 200);
  };

  return (
    <div className="flex justify-start mb-4 mt-4 w-full">
      <div
        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 w-full"
      >
        {/* Header */}
        <div className="px-5 py-3 bg-green-50 border-b border-green-100">
          <p className="text-gray-700 text-sm font-medium">
            Perfect! let's complete your purchase
          </p>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-gray-700 text-sm font-medium mb-4">
            How would you like to pay?
          </p>

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* Mobile Money */}
            <button
              onClick={() => handleMethodSelect("mobile")}
              disabled={selectedMethod !== null}
              className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
              style={{
                borderColor: selectedMethod === "mobile" ? "#00A651" : undefined,
                backgroundColor: selectedMethod === "mobile" ? "#F0FDF4" : "white",
              }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selectedMethod === "mobile" ? "#00A651" : "#D1D5DB",
                }}
              >
                {selectedMethod === "mobile" && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#00A651" }}
                  />
                )}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">
                Mobile Money
              </span>
              <div className="flex items-center gap-2">
                {/* MTN Logo */}
                <div
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: "#FFCC00" }}
                >
                  <span
                    className="font-bold text-xs"
                    style={{ color: "#000" }}
                  >
                    MTN
                  </span>
                </div>
                {/* Airtel Logo */}
                <div
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: "#E91E2C" }}
                >
                  <span
                    className="font-bold text-xs"
                    style={{ color: "#FFF" }}
                  >
                    airtel
                  </span>
                </div>
              </div>
            </button>

            {/* Card Payment */}
            <button
              onClick={() => handleMethodSelect("card")}
              disabled={selectedMethod !== null}
              className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
              style={{
                borderColor: selectedMethod === "card" ? "#00A651" : undefined,
                backgroundColor: selectedMethod === "card" ? "#F0FDF4" : "white",
              }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selectedMethod === "card" ? "#00A651" : "#D1D5DB",
                }}
              >
                {selectedMethod === "card" && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#00A651" }}
                  />
                )}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">
                Card Payment
              </span>
              <div className="flex items-center gap-2">
                {/* Visa Logo */}
                <div className="px-2 py-1 bg-white rounded border border-gray-200">
                  <span
                    className="font-bold text-xs"
                    style={{ color: "#1A1F71" }}
                  >
                    VISA
                  </span>
                </div>
                {/* Mastercard Logo */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(90deg, #EB001B 50%, #F79E1B 50%)",
                  }}
                />
              </div>
            </button>

            {/* FlexiPay */}
            <button
              onClick={() => handleMethodSelect("flexipay")}
              disabled={selectedMethod !== null}
              className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
              style={{
                borderColor: selectedMethod === "flexipay" ? "#00A651" : undefined,
                backgroundColor: selectedMethod === "flexipay" ? "#F0FDF4" : "white",
              }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selectedMethod === "flexipay" ? "#00A651" : "#D1D5DB",
                }}
              >
                {selectedMethod === "flexipay" && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#00A651" }}
                  />
                )}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">
                FlexiPay
              </span>
              <div className="flex items-center gap-2">
                {/* Standard Bank Logo */}
                <div
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: "#003087" }}
                >
                  <span
                    className="font-bold text-xs"
                    style={{ color: "#FFF" }}
                  >
                    SB
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
