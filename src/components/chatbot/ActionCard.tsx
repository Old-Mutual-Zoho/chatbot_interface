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

  return (
    <div
      className="bg-white rounded-xl mx-auto flex flex-col items-center"
      style={{
        width: '340px',
        minHeight: '220px',
        border: '2.5px solid #e5e7eb',
        boxSizing: 'border-box',
        padding: '22px 18px',
        margin: '24px auto',
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,120,71,0.08)',
      }}
    >
      {options.map((opt, idx) => {
        // Keep the chosen option highlighted during loading.
        const isActive = (activeIdx === idx) || (lastSelected && opt.value === lastSelected);
        return (
          <button
            key={opt.value}
            type="button"
            className="transition focus:outline-none"
            style={{
              width: '96%',
              padding: '13px 0',
              margin: '0 auto 12px auto',
              borderRadius: '10px',
              border: isActive ? 'none' : '1.5px solid #007847',
              background: isActive ? '#007847' : '#fff',
              color: isActive ? '#fff' : '#007847',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: 'inherit',
              textAlign: 'center',
              boxShadow: isActive ? '0 2px 8px rgba(0,120,71,0.10)' : 'none',
              display: 'block',
              lineHeight: '1.2',
            }}
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
  );
};
