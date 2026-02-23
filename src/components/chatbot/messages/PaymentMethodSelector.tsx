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
              className={
                [
                  'w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                  selectedMethod === 'mobile' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
                ].join(' ')
              }
            >
              <div
                className={
                  [
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    selectedMethod === 'mobile' ? 'border-primary' : 'border-gray-300',
                  ].join(' ')
                }
              >
                {selectedMethod === "mobile" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">
                Mobile Money
              </span>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  <span className="font-bold text-xs text-gray-700">MTN</span>
                </div>
                <div className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  <span className="font-bold text-xs text-gray-700">Airtel</span>
                </div>
              </div>
            </button>

            {/* Card Payment */}
            <button
              onClick={() => handleMethodSelect("card")}
              disabled={selectedMethod !== null}
              className={
                [
                  'w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                  selectedMethod === 'card' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
                ].join(' ')
              }
            >
              <div
                className={
                  [
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    selectedMethod === 'card' ? 'border-primary' : 'border-gray-300',
                  ].join(' ')
                }
              >
                {selectedMethod === "card" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">
                Card Payment
              </span>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-white rounded border border-gray-200">
                  <span className="font-bold text-xs text-gray-700">VISA</span>
                </div>
                <div className="px-2 py-1 bg-white rounded border border-gray-200">
                  <span className="font-bold text-xs text-gray-700">MC</span>
                </div>
              </div>
            </button>

            {/* FlexiPay */}
            <button
              onClick={() => handleMethodSelect("flexipay")}
              disabled={selectedMethod !== null}
              className={
                [
                  'w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                  selectedMethod === 'flexipay' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
                ].join(' ')
              }
            >
              <div
                className={
                  [
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    selectedMethod === 'flexipay' ? 'border-primary' : 'border-gray-300',
                  ].join(' ')
                }
              >
                {selectedMethod === "flexipay" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">
                FlexiPay
              </span>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded bg-gray-100 border border-gray-200">
                  <span className="font-bold text-xs text-gray-700">SB</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
