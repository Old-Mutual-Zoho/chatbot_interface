import React from "react";
import { ActionCard } from "../ActionCard";
import type { ActionOption } from "../ActionCard";
import type { ActionCardMessage } from "./actionCardTypes";

interface ActionCardRendererProps {
  message: ActionCardMessage;
  onSelect: (option: ActionOption) => void;
  loading?: boolean;
  lastSelected?: string | null;
}

export const ActionCardRenderer: React.FC<ActionCardRendererProps> = ({ message, onSelect, loading, lastSelected }) => {
  return (
    <div className="w-full flex justify-center animate-fade-in px-2 sm:px-4">
      <ActionCard options={message.options} onSelect={onSelect} loading={loading} lastSelected={lastSelected} />
    </div>
  );
};
