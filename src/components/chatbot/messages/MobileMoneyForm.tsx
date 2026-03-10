import React, { useState } from "react";

interface MobileMoneyFormProps {
  onSubmitPayment?: (phoneNumber: string) => void;
  isLoading?: boolean;
}

export const MobileMoneyForm: React.FC<MobileMoneyFormProps> = ({
  onSubmitPayment,
  isLoading = false,
}) => {
  const [phoneInput, setPhoneInput] = useState("");

  // Backend accepts:
  // - 07XXXXXXXX
  // - +2567XXXXXXXX
  // - 2567XXXXXXXX
  // We normalize to 2567XXXXXXXX for consistency.
  const normalizeToBackend = (raw: string): string | null => {
    const s = String(raw ?? "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "");

    if (!s) return null;

    // +2567XXXXXXXX or 2567XXXXXXXX
    if (/^\+?2567\d{8}$/.test(s)) return s.replace(/^\+/, "");

    // 07XXXXXXXX
    if (/^07\d{8}$/.test(s)) return `256${s.slice(1)}`;

    // 7XXXXXXXX (common when users omit leading 0 / country code)
    if (/^7\d{8}$/.test(s)) return `256${s}`;

    return null;
  };

  const normalizedPhone = normalizeToBackend(phoneInput);

  const handleSubmit = () => {
    if (!onSubmitPayment) return;
    if (!normalizedPhone) return;
    onSubmitPayment(normalizedPhone);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && normalizedPhone && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="flex justify-start mb-4 mt-4 w-full">
      <div
        className="rounded-2xl shadow-sm overflow-hidden w-full bg-primary/10"
      >
        {/* Content */}
        <div className="px-5 py-5">
          {/* MTN and Airtel Logos */}
          <div className="flex justify-center items-center gap-0 mb-4">
            {/* Airtel Logo */}
            <div
              className="px-4 py-2 flex items-center justify-center bg-red-600 rounded-l-lg border border-gray-200"
            >
              <span className="font-bold text-base text-white">
                airtel
              </span>
            </div>
            {/* MTN Logo */}
            <div
              className="px-4 py-2 flex items-center justify-center bg-yellow-400 rounded-r-lg border border-l-0 border-gray-200"
            >
              <span className="font-bold text-base text-gray-900">
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
            className="rounded-xl overflow-hidden mb-4 bg-primary/10"
          >
            <div className="px-4 py-3">
              <label className="block text-gray-900 text-xs font-semibold mb-2">
                Enter Phone Number
              </label>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                <input
                  type="tel"
                  inputMode="tel"
                  value={phoneInput}
                  onChange={(e) => {
                    // Allow digits and an optional leading '+'; strip all other characters.
                    const raw = e.target.value;
                    const cleaned = raw
                      .replace(/\s+/g, "")
                      .replace(/(?!^)\+/g, "")
                      .replace(/[^\d+]/g, "");
                    setPhoneInput(cleaned);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="07XXXXXXXX, +2567XXXXXXXX, or 2567XXXXXXXX"
                  disabled={isLoading}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-900 text-sm placeholder-gray-400 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handleSubmit}
            disabled={!normalizedPhone || isLoading}
            className="w-full py-3 px-4 rounded-lg font-bold text-white text-sm transition-colors bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400"
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
