import { useState } from "react";

// Guided option buttons shown as a bot message.

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

export const ActionCard: React.FC<ActionCardProps> = ({ options, onSelect, loading, lastSelected }) => {
  // Lock after first click to avoid double submits.
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Add Talk to Agent button as the last option if not already present
  const hasTalkToAgent = options.some(opt => opt.value === 'talk-to-agent');
  const extendedOptions = hasTalkToAgent
    ? options
    : [
        ...options,
        { label: 'Talk to Agent', value: 'talk-to-agent' }
      ];

  return (
    <div className="w-full max-w-sm mx-auto my-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-md">
      <div className="w-full flex flex-col items-center gap-4">
        {extendedOptions.map((opt, idx) => {
          // Keep the chosen option highlighted during loading.
          const isActive = (activeIdx === idx) || (lastSelected && opt.value === lastSelected);
          return (
            <button
              key={opt.value}
              type="button"
              className={
                [
                  'w-full max-w-xs mx-auto py-3 px-4 rounded-xl font-bold text-base transition focus:outline-none',
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-white border-2 border-primary text-primary hover:bg-primary/5',
                  'disabled:opacity-60',
                ].join(' ')
              }
              onClick={(e) => {
                e.preventDefault();
                setActiveIdx(idx);
                // Brief delay so the active state is visible.
                setTimeout(() => onSelect(opt), 200);
              }}
              // Disable only while loading; do not permanently lock options.
              disabled={!!loading}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
