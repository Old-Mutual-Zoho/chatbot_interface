import React, { useState } from "react";


export type PaymentMethod = "MTN" | "AIRTEL" | "FLEXIPAY";
interface PaymentMethodSelectorProps {
  onSelectMethod?: (method: PaymentMethod) => void;
}


export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ onSelectMethod }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleMethodSelect = (method: PaymentMethod) => {
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
            {/* MTN Mobile Money */}
            <button
              onClick={() => handleMethodSelect("MTN")}
              disabled={selectedMethod !== null}
              className={[
                'w-full flex items-center gap-3 p-3 border-2 rounded-xl min-h-[48px] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                selectedMethod === 'MTN' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
              ].join(' ')}
            >
              <div className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                selectedMethod === 'MTN' ? 'border-primary' : 'border-gray-300',
              ].join(' ')}>
                {selectedMethod === "MTN" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">MTN Mobile Money</span>
            </button>
            {/* Airtel Mobile Money */}
            <button
              onClick={() => handleMethodSelect("AIRTEL")}
              disabled={selectedMethod !== null}
              className={[
                'w-full flex items-center gap-3 p-3 border-2 rounded-xl min-h-[48px] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                selectedMethod === 'AIRTEL' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
              ].join(' ')}
            >
              <div className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                selectedMethod === 'AIRTEL' ? 'border-primary' : 'border-gray-300',
              ].join(' ')}>
                {selectedMethod === "AIRTEL" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">Airtel Mobile Money</span>
            </button>
            {/* FlexiPay */}
            <button
              onClick={() => handleMethodSelect("FLEXIPAY")}
              disabled={selectedMethod !== null}
              className={[
                'w-full flex items-center gap-3 p-3 border-2 rounded-xl min-h-[48px] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                selectedMethod === 'FLEXIPAY' ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
              ].join(' ')}
            >
              <div className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                selectedMethod === 'FLEXIPAY' ? 'border-primary' : 'border-gray-300',
              ].join(' ')}>
                {selectedMethod === "FLEXIPAY" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">FlexiPay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
