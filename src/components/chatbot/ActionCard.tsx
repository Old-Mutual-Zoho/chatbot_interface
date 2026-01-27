import React, { useState } from "react";

export type ActionOption = {
  label: string;
  value: string;
};

type ActionCardProps = {
  options: ActionOption[];
  onSelect: (option: ActionOption) => void;
};

const OLD_MUTUAL_GREEN = "bg-[#007847]"; // Old Mutual green

export const ActionCard: React.FC<ActionCardProps> = ({ options, onSelect }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl shadow p-3 w-full max-w-xs mx-auto flex flex-col gap-2">
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          className={`w-full py-2 rounded-lg border border-gray-200 text-gray-800 font-medium transition
            ${activeIdx === idx ? `${OLD_MUTUAL_GREEN} text-white` : "bg-gray-100 hover:bg-[#e6f4ec]"}
            focus:outline-none`}
          onClick={() => {
            setActiveIdx(idx);
            setTimeout(() => onSelect(opt), 200); // brief highlight before card disappears
          }}
          disabled={activeIdx !== null}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
