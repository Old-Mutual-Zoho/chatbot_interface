import React, { useState } from "react";

export type ActionOption = {
  label: string;
  value: string;
};

type ActionCardProps = {
  options: ActionOption[];
  onSelect: (option: ActionOption) => void;
  loading?: boolean;
  lastSelected?: string | null;
};

const OLD_MUTUAL_GREEN = "bg-[#007847]"; // Old Mutual green

export const ActionCard: React.FC<ActionCardProps> = ({ options, onSelect, loading, lastSelected }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl shadow p-3 w-full max-w-xs mx-auto flex flex-col gap-2">
      {options.map((opt, idx) => {
        const isActive = (activeIdx === idx) || (lastSelected && opt.value === lastSelected);
        return (
          <button
            key={opt.value}
            className={`w-full py-2 rounded-2xl border border-gray-200 text-gray-800 font-medium transition text-base
              ${isActive ? `${OLD_MUTUAL_GREEN} text-white` : "bg-gray-100 hover:bg-[#e6f4ec]"}
              focus:outline-none`}
            onClick={() => {
              setActiveIdx(idx);
              setTimeout(() => onSelect(opt), 200);
            }}
            disabled={loading || activeIdx !== null}
            style={{ marginBottom: 8 }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
