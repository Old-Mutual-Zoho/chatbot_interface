import React, { useState } from "react";

interface PurchaseSummaryProps {
  productName: string;
  price: string;
  duration: string;
  isLoading?: boolean;
  onConfirmPayment?: () => void;
}

export const PurchaseSummary: React.FC<PurchaseSummaryProps> = ({
  productName,
  price,
  duration,
  isLoading = false,
  onConfirmPayment,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    if (onConfirmPayment) {
      onConfirmPayment();
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div
        className="bg-white rounded-2xl shadow-md overflow-hidden max-w-xs sm:max-w-sm md:max-w-md border border-gray-200"
        style={{
          borderLeft: "4px solid #00A651",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4"
          style={{
            background: "linear-gradient(135deg, #00A651 0%, #008C44 100%)",
          }}
        >
          <h3 className="text-white font-semibold text-base">Order Summary</h3>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Product Name */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Product
            </p>
            <p className="text-gray-900 font-semibold text-sm">{productName}</p>
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Price
              </p>
              <p className="text-gray-900 font-bold text-base">{price}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Duration
              </p>
              <p className="text-gray-900 font-semibold text-sm">{duration}</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase mb-3">
              Payment Methods Available
            </p>
            <div className="flex gap-3">
              {/* MTN Logo */}
              <div
                className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: "#FFD100" }}
                >
                  MTN
                </span>
              </div>
              {/* Airtel Logo */}
              <div
                className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: "#E91E2C" }}
                >
                  Airtel
                </span>
              </div>
            </div>
          </div>

          {/* Confirm & Pay Button */}
          <button
            onClick={handleConfirm}
            disabled={isLoading || isConfirming}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: isLoading || isConfirming
                ? "#D1D5DB"
                : "#00A651",
              cursor: isLoading || isConfirming ? "not-allowed" : "pointer",
            }}
          >
            {isLoading || isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
                Processing...
              </span>
            ) : (
              "Confirm & Pay"
            )}
          </button>

          {/* Info Message */}
          <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
            A payment prompt will appear on your phone
          </p>
        </div>
      </div>
    </div>
  );
};
