import React from "react";
import { ActionCard } from "../ActionCard";
import type { ActionOption } from "../ActionCard";
import type { ActionCardMessage } from "./actionCardTypes";

interface ActionCardRendererProps {
  message: ActionCardMessage;
  onSelect: (option: ActionOption) => void;
}

export const ActionCardRenderer: React.FC<ActionCardRendererProps> = ({ message, onSelect }) => {
  return (
    <div className="flex justify-start animate-fade-in">
      <ActionCard options={message.options} onSelect={onSelect} />
    </div>
  );
};
