import React from "react";

interface QuoteDisplayProps {
  quoteAmount: number | string;
  currency?: string;
  details?: string;
  onRestart?: () => void;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quoteAmount, currency = "ZAR", details, onRestart }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <h3 className="text-xl font-bold text-primary mb-2">Your Quote</h3>
      <div className="text-3xl font-extrabold text-green-600 mb-2">
        {currency} {quoteAmount}
      </div>
      {details && <div className="text-gray-700 text-center mb-4">{details}</div>}
      {onRestart && (
        <button
          onClick={onRestart}
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition font-medium"
        >
          Start Over
        </button>
      )}
    </div>
  );
};

export default QuoteDisplay;
