import React from "react";

export interface ConfirmationCardProps {
  data: Record<string, any>;
  labels: Record<string, string>;
  onConfirm: () => void;
  onEdit: () => void;
  confirmDisabled?: boolean;
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ data, labels, onConfirm, onEdit, confirmDisabled }) => {
  return (
    <div className="bg-white border-2 border-green-400 rounded-2xl shadow-lg p-6 max-w-md mx-auto my-4 animate-fade-in">
      <h3 className="text-lg font-bold text-green-700 mb-4">Please Confirm Your Details</h3>
      <div className="divide-y divide-gray-200 mb-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="py-2 flex justify-between items-center">
            <span className="font-medium text-gray-700">{labels[key] || key}</span>
            <span className="text-gray-900 text-right break-all">{String(value)}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-2 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer disabled:bg-green-200 disabled:cursor-not-allowed"
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          Get Quote
        </button>
        <button
          className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition cursor-pointer"
          onClick={onEdit}
        >
          Edit Details
        </button>
      </div>
    </div>
  );
};

export default ConfirmationCard;
